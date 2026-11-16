import { useMemo, useState } from "react"
import type {
  BatchStageWithInterviewers,
  Recruitment,
  Stage,
  StageInterviewerAssignment,
} from "../types"
import {
  useActivateBatchStageMutation,
  useAssignStageInterviewersMutation,
  useCompleteBatchStageMutation,
  useGetBatchStagesQuery,
} from "../api/recruitments-api"
import { stageCategoryToLegacyType } from "../utils/stageUtils"
import { mapStageEmployeeStatus } from "../utils/statusAdapters"
import { isRecruitmentClosed } from "../utils/recruitmentUtils"

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
        stageEmployeeId: inv.stageEmployeeId,
        employeeId: inv.employeeId,
        status: mapStageEmployeeStatus(inv.status),
        employeeName: inv.fullName,
        employeeEmail: inv.email,
        jobTitle: inv.jobTitle,
        note: inv.note ?? undefined,
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
      lifecycleStatus: bs.lifecycleStatus,
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
  const [activateStageApi, { isLoading: isActivatingStage }] =
    useActivateBatchStageMutation()
  const [completeStageApi, { isLoading: isCompletingStage }] =
    useCompleteBatchStageMutation()

  // Compute total duration across all stages
  const totalDays = stages.reduce(
    (acc, curr) => acc + (curr.durationDays || 0),
    0
  )

  const handleOpenAssignDialog = (stage: Stage, index: number) => {
    if (isRecruitmentClosed(recruitment)) return
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
    if (isRecruitmentClosed(recruitment)) throw new Error("Closed recruitment cannot be changed.")
    await assignInterviewersApi({
      batchId: recruitment.id,
      stageId,
      body: {
        interviewerEmployeeIds: assignments.map((a) => a.employeeId),
      },
    }).unwrap()
  }

  const handleActivateStage = async (stageId: string) => {
    if (isRecruitmentClosed(recruitment)) throw new Error("Closed recruitment cannot be changed.")
    return activateStageApi({ batchId: recruitment.id, stageId }).unwrap()
  }

  const handleCompleteStage = async (stageId: string) => {
    if (isRecruitmentClosed(recruitment)) throw new Error("Closed recruitment cannot be changed.")
    return completeStageApi({ batchId: recruitment.id, stageId }).unwrap()
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
    handleActivateStage,
    handleCompleteStage,
    isTransitioning: isActivatingStage || isCompletingStage,
  }
}
