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

      // Extract existing interviewers with name & title from API batch stage
      const assignedList: StageInterviewerAssignment[] =
        (bs as any).interviewers?.map((inv: any) => ({
          employeeId: inv.employeeId,
          status: (inv.statusName?.toLowerCase() === "accepted" ? "accepted" : "pending") as StageEmployeeStatus,
          employeeName: inv.fullName,
          employeeEmail: inv.email,
          jobTitle: inv.jobTitle,
        })) ?? []

      return {
        id: bs.id,
        batchStageId: bs.id,
        recruitmentBatchId: bs.recruitmentBatchId,
        stageTypeId: bs.stageTypeId,
        stageTypeName: bs.stageTypeName,
        stageCategory: bs.stageCategory,
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
  const [assignIndex, setAssignIndex] = useState<number | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [assignInterviewersApi] = useAssignStageInterviewersMutation()

  // Keep stages updated when recruitment data changes
  useEffect(() => {
    setStages(mapBatchStagesToStages(recruitment))
  }, [recruitment])

  // Compute total duration across all stages
  const totalDays = stages.reduce((acc, curr) => acc + (curr.durationDays || 0), 0)

  const handleOpenAssignDialog = (stage: Stage, index: number) => {
    setAssignStage(stage)
    setAssignIndex(index)
    setIsDialogOpen(true)
  }

  const handleCloseAssignDialog = () => {
    setIsDialogOpen(false)
    setAssignStage(null)
    setAssignIndex(undefined)
  }

  const handleSaveInterviewers = async (
    stageId: string,
    assignments: StageInterviewerAssignment[]
  ) => {
    const updatedIds = assignments.map((a) => a.employeeId)

    // 1. Optimistic update
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
    const targetBatch = initialRecruitments.find((b) => b.id === recruitment.id)
    if (targetBatch && targetBatch.stages) {
      targetBatch.stages = targetBatch.stages.map((s) => {
        if (s.id !== stageId) return s
        return {
          ...s,
          assignedInterviewers: assignments,
          interviewerIds: updatedIds,
          ownerId: updatedIds[0] || "",
        }
      })
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
      } catch (err: any) {
        console.error("Failed to assign interviewers on server:", err)
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
