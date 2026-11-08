import { useMemo, useState } from "react"
import type {
  BatchStageWithInterviewers,
  Recruitment,
  Stage,
  StageEmployeeStatus,
  StageInterviewerAssignment,
} from "../types"
import {
  useAssignStageInterviewersMutation,
  useGetBatchStagesQuery,
} from "../api/recruitments-api"
import { stageCategoryToLegacyType } from "../utils/stageUtils"

function mapInterviewerStatus(status: number | string): StageEmployeeStatus {
  switch (String(status).toLowerCase()) {
    case "2":
    case "accepted":
      return "accepted"
    case "3":
    case "declined":
      return "declined"
    default:
      return "pending"
  }
}

export function mapBatchStagesToStages(
  batchStages: BatchStageWithInterviewers[]
): Stage[] {
  return batchStages.map((bs) => {
    let duration = 0
    if (bs.startDate && bs.endDate) {
      const start = new Date(bs.startDate).getTime()
      const end = new Date(bs.endDate).getTime()
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        duration = Math.max(
          1,
          Math.round((end - start) / (1000 * 60 * 60 * 24))
        )
      }
    }

    const assignedList: StageInterviewerAssignment[] = bs.interviewers.map(
      (inv) => ({
        employeeId: inv.employeeId,
        status: mapInterviewerStatus(inv.status),
        employeeName: inv.fullName,
        employeeEmail: inv.email,
        jobTitle: inv.jobTitle,
      })
    )

    return {
      id: bs.id,
      batchStageId: bs.id,
      recruitmentBatchId: bs.recruitmentBatchId,
      stageTypeId: bs.stageTypeId,
      stageTypeName: bs.stageTypeName,
      stageCategory: bs.stageCategory,
      name: bs.stageName,
      type: stageCategoryToLegacyType(bs.stageCategory),
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

export interface UseStagesTabProps {
  recruitment: Recruitment
}

export function useStagesTab({ recruitment }: UseStagesTabProps) {
  const {
    currentData: batchStages,
    isFetching,
    isError,
    refetch,
  } = useGetBatchStagesQuery(recruitment.id, {
    skip: !recruitment.id,
    refetchOnMountOrArgChange: true,
  })
  const stages = useMemo(
    () => mapBatchStagesToStages(batchStages ?? []),
    [batchStages]
  )
  const [assignStage, setAssignStage] = useState<Stage | null>(null)
  const [assignIndex, setAssignIndex] = useState<number | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [assignInterviewersApi] = useAssignStageInterviewersMutation()

  // Compute total duration across all stages
  const totalDays = stages.reduce(
    (acc, curr) => acc + (curr.durationDays || 0),
    0
  )

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
    await assignInterviewersApi({
      batchId: recruitment.id,
      stageId,
      body: {
        interviewerEmployeeIds: assignments.map((a) => a.employeeId),
      },
    }).unwrap()
  }

  return {
    stages,
    isLoading: isFetching && !batchStages,
    isError,
    refetch,
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
