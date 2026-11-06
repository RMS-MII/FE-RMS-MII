import { useState, useEffect } from "react"
import type {
  Recruitment,
  Stage,
  StageEmployeeStatus,
  StageInterviewerAssignment,
} from "../types"
import { initialRecruitments } from "../data/mock"
import { useAssignStageInterviewersMutation } from "../api/recruitments-api"

export function mapBatchStagesToStages(r: Recruitment): Stage[] {
  if (r.batchStages && Array.isArray(r.batchStages) && r.batchStages.length > 0) {
    return r.batchStages.map((bs) => {
      let duration = 0
      if (bs.startDate && bs.endDate) {
        const start = new Date(bs.startDate).getTime()
        const end = new Date(bs.endDate).getTime()
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)))
        }
      }

      // Check if backend returned interviewers on the batch stage
      const assignedList: StageInterviewerAssignment[] =
        (bs as any).interviewers?.map((inv: any) => ({
          employeeId: inv.employeeId,
          status: (inv.statusName?.toLowerCase() === "accepted" ? "accepted" : "pending") as StageEmployeeStatus,
        })) ?? []

      return {
        id: bs.id,
        batchStageId: bs.id,
        recruitmentBatchId: bs.recruitmentBatchId,
        stageTypeId: bs.stageTypeId,
        name: bs.stageName,
        type: (bs.stageCategory?.toLowerCase() ?? "screening") as any,
        durationDays: duration,
        passingScore: bs.passingScore ?? null,
        startDate: bs.startDate ?? null,
        endDate: bs.endDate ?? null,
        isActive: bs.isActive,
        nextStageId: bs.nextStageId,
        assignedInterviewers: assignedList,
        interviewerIds: assignedList.map((a) => a.employeeId),
        ownerId: assignedList[0]?.employeeId,
      }
    })
  }
  return r.stages ?? []
}

export interface UseStagesTabProps {
  recruitment: Recruitment
}

export function useStagesTab({ recruitment }: UseStagesTabProps) {
  const [stages, setStages] = useState<Stage[]>(() => mapBatchStagesToStages(recruitment))
  const [assignStage, setAssignStage] = useState<Stage | null>(null)
  const [assignIndex, setAssignIndex] = useState<number>(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [assignInterviewersApi] = useAssignStageInterviewersMutation()

  // Sync state if parent recruitment stages update
  useEffect(() => {
    setStages(mapBatchStagesToStages(recruitment))
  }, [recruitment.batchStages, recruitment.stages])

  const totalDays = stages.reduce((acc, s) => acc + (s.durationDays || 0), 0)

  const handleOpenAssignDialog = (stage: Stage, index: number) => {
    setAssignStage(stage)
    setAssignIndex(index)
    setIsDialogOpen(true)
  }

  const handleCloseAssignDialog = () => {
    setIsDialogOpen(false)
  }

  const handleSaveInterviewers = async (
    stageId: string,
    assignments: StageInterviewerAssignment[]
  ) => {
    const updatedIds = assignments.map((a) => a.employeeId)

    // 1. Update local component state
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s
        return {
          ...s,
          assignedInterviewers: assignments,
          interviewerIds: updatedIds,
          ownerId: updatedIds[0] || "",
        }
      })
    )

    // 2. Persist in mock recruitment data so changes reflect across pages if legacy mock
    const rIdx = initialRecruitments.findIndex((r) => r.id === recruitment.id)
    if (rIdx !== -1) {
      initialRecruitments[rIdx] = {
        ...initialRecruitments[rIdx],
        stages: (initialRecruitments[rIdx].stages ?? []).map((s) => {
          if (s.id !== stageId) return s
          return {
            ...s,
            assignedInterviewers: assignments,
            interviewerIds: updatedIds,
            ownerId: updatedIds[0] || "",
          }
        }),
      }
    }

    // 3. Call backend API if real recruitment batch ID
    if (recruitment.id && !recruitment.id.startsWith("r")) {
      try {
        await assignInterviewersApi({
          batchId: recruitment.id,
          stageId,
          body: {
            interviewerEmployeeIds: updatedIds,
          },
        }).unwrap()
      } catch (err) {
        console.error("Failed to assign interviewers via API:", err)
      }
    }
  }

  return {
    stages,
    totalDays,
    assignStage,
    assignIndex,
    isDialogOpen,
    setIsDialogOpen,
    handleOpenAssignDialog,
    handleCloseAssignDialog,
    handleSaveInterviewers,
  }
}
