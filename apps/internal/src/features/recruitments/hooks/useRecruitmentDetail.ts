import { useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import type { PipelineItem, StageState } from "../types"
import { useGetBatchByIdQuery, useGetBatchStageFlowQuery, useGetBatchSummaryQuery } from "../api/recruitments-api"
import { useGetBatchApplicationsQuery } from "../api/applications-api"
import { isRecruitmentClosed } from "../utils/recruitmentUtils"

export type TabKey =
  | "summary"
  | "stages"
  | "candidates"
  | "interviews"

export interface UseRecruitmentDetailProps {
  id: string
  activeTab?: TabKey
  selectedStage?: number | null
  onTabChange?: (tab: TabKey) => void
  onStageChange?: (stageIndex: number | null) => void
}

export function useRecruitmentDetail({
  id,
  activeTab: controlledTab,
  selectedStage: controlledStage,
  onTabChange,
  onStageChange,
}: UseRecruitmentDetailProps) {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: "/_auth/recruitments/$id/" })
  const [internalTab, setInternalTab] = useState<TabKey>("summary")
  const [internalStage, setInternalStage] = useState<number | null>(null)

  const activeTab = controlledTab ?? internalTab
  const selectedStage = controlledStage !== undefined ? controlledStage : internalStage

  const handleTabChange = (newTab: TabKey) => {
    if (onTabChange) {
      onTabChange(newTab)
    } else {
      setInternalTab(newTab)
    }
  }

  const handleStageChange = (newStage: number | null) => {
    if (onStageChange) {
      onStageChange(newStage)
    } else {
      setInternalStage(newStage)
    }
  }

  const detailQuery = useGetBatchByIdQuery(id)
  const flowQuery = useGetBatchStageFlowQuery(id)
  const summaryQuery = useGetBatchSummaryQuery(id, { skip: activeTab !== "summary" })
  const recruitment = useMemo(() => detailQuery.data && flowQuery.data
    ? { ...detailQuery.data, batchStages: flowQuery.data }
    : null, [detailQuery.data, flowQuery.data])
  const isLoading = detailQuery.isLoading || flowQuery.isLoading
  const isError = detailQuery.isError || flowQuery.isError
  const refetch = () => {
    void detailQuery.refetch()
    void flowQuery.refetch()
  }

  const activeStageIndex = recruitment?.batchStages?.findIndex((stage) =>
    ["active", "1"].includes(String(stage.lifecycleStatus).toLowerCase())) ?? -1
  const candidateStageIndex = selectedStage !== null
    && selectedStage >= 0
    && selectedStage < (recruitment?.batchStages?.length ?? 0)
      ? selectedStage
      : activeStageIndex
  const candidateStageId = candidateStageIndex >= 0
    ? recruitment?.batchStages?.[candidateStageIndex]?.id
    : undefined
  const candidateQuery = useGetBatchApplicationsQuery({
    id,
    search: searchParams.candidateSearch?.trim() || undefined,
    stageId: candidateStageId,
    page: searchParams.candidatePage ?? 1,
    pageSize: 10,
  }, { skip: activeTab !== "candidates" || !recruitment })

  const pipelineItems = useMemo(() => {
    if (!recruitment) return []
    return (recruitment.batchStages ?? []).map((stage, index): PipelineItem => {
      const lifecycle = String(stage.lifecycleStatus ?? "Inactive").toLowerCase()
      const state: StageState = lifecycle === "completed" || lifecycle === "2"
        ? "done"
        : lifecycle === "active" || lifecycle === "1"
          ? "current"
          : "upcoming"

      return {
        name: stage.stageName || `Stage ${index + 1}`,
        count: stage.candidateCount ?? undefined,
        state,
      }
    })
  }, [recruitment])

  const handleStageSelect = (index: number) => {
    if (activeTab === "candidates" && selectedStage === index) {
      handleStageChange(null)
    } else {
      handleStageChange(index)
    }
  }

  const tabs: { key: TabKey; label: string; count?: number }[] = useMemo(() => {
    if (!recruitment) return []
    const defaultCandidateCount = activeStageIndex >= 0
      ? recruitment.batchStages?.[activeStageIndex]?.candidateCount ?? 0
      : summaryQuery.data?.totalCandidates
    return [
      { key: "summary", label: "Summary" },
      { key: "stages", label: "Stages", count: (recruitment.batchStages || recruitment.stages || []).length },
      { key: "candidates", label: "Candidates", count: activeTab === "candidates"
        ? candidateQuery.currentData?.totalItems
        : defaultCandidateCount },
      { key: "interviews", label: "Interviews", count: summaryQuery.data?.interviewSessions },
    ]
  }, [recruitment, activeStageIndex, activeTab, candidateQuery.currentData?.totalItems, summaryQuery.data?.totalCandidates, summaryQuery.data?.interviewSessions])

  const handleCreateStage = () => {
    if (!recruitment || isRecruitmentClosed(recruitment)) return
    navigate({
      to: "/recruitments/$id/stages",
      params: { id: recruitment.id },
    })
  }

  const handleEditStage = () => {
    if (!recruitment || isRecruitmentClosed(recruitment)) return
    navigate({
      to: "/recruitments/$id/stages",
      params: { id: recruitment.id },
    })
  }

  const handleBackToList = () => {
    navigate({ to: "/recruitments" })
  }

  return {
    recruitment,
    isLoading,
    isError,
    refetch,
    activeTab,
    selectedStage,
    tabs,
    pipelineItems,
    candidateStageIndex,
    handleTabChange,
    handleStageChange,
    handleStageSelect,
    handleCreateStage,
    handleEditStage,
    handleBackToList,
  }
}
