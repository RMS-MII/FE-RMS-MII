import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { initialRecruitments, recruitmentPipeline } from "../data/mock"
import { getRecruitmentInterviewSessions, mockInterviewSessions } from "../data/interviewMock"
import { useGetBatchByIdQuery } from "../api/recruitments-api"
import { useGetBatchApplicationsQuery } from "../api/applications-api"
import { candidates } from "@/data/mock"

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

  const { data: apiRecruitment, isLoading, isError, refetch } = useGetBatchByIdQuery(id)

  const recruitment = useMemo(() => {
    return apiRecruitment ?? initialRecruitments.find((r) => r.id === id) ?? null
  }, [apiRecruitment, id])

  // Related data counts matching ERD records
  const recruitmentCandidates = useMemo(() => {
    return candidates.filter((c) => c.recruitmentId === id)
  }, [id])

  const recruitmentInterviews = useMemo(() => {
    const list = getRecruitmentInterviewSessions(id)
    return list.length > 0 ? list : mockInterviewSessions
  }, [id])

  const pipelineItems = useMemo(() => {
    if (!recruitment) return []
    return recruitmentPipeline(recruitment)
  }, [recruitment])

  const handleStageSelect = (index: number) => {
    if (activeTab === "candidates" && selectedStage === index) {
      handleStageChange(null)
    } else {
      handleStageChange(index)
    }
  }

  const isRealBatch = Boolean(recruitment && !recruitment.id.startsWith("r"))
  const { data: batchApps } = useGetBatchApplicationsQuery(
    { id: recruitment?.id ?? "", pageSize: 1 },
    { skip: !isRealBatch || !recruitment?.id }
  )

  const candidatesCount = isRealBatch
    ? (batchApps?.totalItems ?? 0)
    : recruitmentCandidates.length

  const tabs: { key: TabKey; label: string; count?: number }[] = useMemo(() => {
    if (!recruitment) return []
    return [
      { key: "summary", label: "Summary" },
      { key: "stages", label: "Stages", count: (recruitment.batchStages || recruitment.stages || []).length },
      { key: "candidates", label: "Candidates", count: candidatesCount },
      { key: "interviews", label: "Interviews", count: recruitmentInterviews.length },
    ]
  }, [recruitment, candidatesCount, recruitmentInterviews.length])

  const handleCreateStage = () => {
    if (!recruitment) return
    navigate({
      to: "/recruitments/$id/stages",
      params: { id: recruitment.id },
    })
  }

  const handleEditStage = () => {
    if (!recruitment) return
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

