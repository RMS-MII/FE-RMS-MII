import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import type { PipelineItem, StageState } from "../types"
import { useGetBatchByIdQuery } from "../api/recruitments-api"
import { useGetBatchApplicationsQuery } from "../api/applications-api"
import { useGetBatchInterviewSessionsQuery } from "../api/interviews-api"
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

const IS_GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function useRecruitmentDetail({
  id,
  activeTab: controlledTab,
  selectedStage: controlledStage,
  onTabChange,
  onStageChange,
}: UseRecruitmentDetailProps) {
  const navigate = useNavigate()
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

  const isRealBatch = useMemo(() => IS_GUID_REGEX.test(id), [id])

  const { data: apiRecruitment, isLoading, isError, refetch } = useGetBatchByIdQuery(id)
  const recruitment = apiRecruitment ?? null

  const { data: batchApps } = useGetBatchApplicationsQuery(
    { id, pageSize: 1 },
    { skip: !id }
  )

  const candidatesCount = batchApps?.totalItems ?? 0

  const { data: batchInterviews } = useGetBatchInterviewSessionsQuery(
    { batchId: id },
    { skip: !id || !isRealBatch }
  )

  const interviewsCount = batchInterviews?.length ?? 0

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
        name: stage.stageName || stage.stageTypeName || `Stage ${index + 1}`,
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
    return [
      { key: "summary", label: "Summary" },
      { key: "stages", label: "Stages", count: (recruitment.batchStages || recruitment.stages || []).length },
      { key: "candidates", label: "Candidates", count: candidatesCount },
      { key: "interviews", label: "Interviews", count: interviewsCount },
    ]
  }, [recruitment, candidatesCount, interviewsCount])

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
    handleTabChange,
    handleStageChange,
    handleStageSelect,
    handleCreateStage,
    handleEditStage,
    handleBackToList,
  }
}
