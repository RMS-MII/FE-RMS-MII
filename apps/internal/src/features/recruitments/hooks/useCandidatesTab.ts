import { useState, useMemo, useCallback } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import type { Recruitment, CandidateApplicationItem } from "../types"
import type { Chip } from "@/shared/components"
import {
  candidateSortSchema,
  candidateStatusFilterSchema,
  getCandidateNavigationSearch,
  type RecruitmentDetailSearch,
} from "../schemas/recruitment-navigation"
import { useGetBatchApplicationsQuery } from "../api/applications-api"
import {
  mapApplicationStatus,
  mapApplicationStageStatus,
  mapFinalResultStatus,
  parseStatusFilterToNumber,
} from "../utils/statusAdapters"

export {
  mapApplicationStatus,
  parseStatusFilterToNumber,
} from "../utils/statusAdapters"

export const statusToneMap: Record<
  string,
  "success" | "warning" | "info" | "danger" | "neutral"
> = {
  passed: "success",
  accepted: "success",
  in_progress: "info",
  pending: "warning",
  failed: "danger",
  rejected: "danger",
  withdrawn: "neutral",
  upcoming: "neutral",
  dropped: "neutral",
  submitted: "warning",
  expired: "danger",
  prioritized: "success",
  considered: "success",
  unknown: "neutral",
}

export const statusLabelMap: Record<string, string> = {
  in_progress: "In Progress",
  passed: "Passed",
  failed: "Failed",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  upcoming: "Upcoming",
  dropped: "Dropped",
  submitted: "Submitted",
  expired: "Expired",
  prioritized: "Prioritized",
  considered: "Considered",
  unknown: "Unknown",
}

export const candidateStatusItems = [
  { label: "All Status", value: "all" },
  { label: "In Progress", value: "in_progress" },
  { label: "Rejected", value: "rejected" },
  { label: "Dropped", value: "dropped" },
  { label: "Accepted", value: "accepted" },
]

export interface UseCandidatesTabProps {
  recruitment: Recruitment
}

export function useCandidatesTab({ recruitment }: UseCandidatesTabProps) {
  const navigate = useNavigate({ from: "/recruitments/$id/" })
  const searchParams = useSearch({ from: "/_auth/recruitments/$id/" })
  const search = searchParams.candidateSearch ?? ""
  const stageFilter =
    searchParams.stage !== undefined ? String(searchParams.stage) : "all"
  const statusFilter = searchParams.candidateStatus ?? "all"
  const sortKey = searchParams.candidateSort ?? "appliedAt"
  const sortDirection = searchParams.candidateDirection ?? "desc"
  const page = searchParams.candidatePage ?? 1
  const pageSize = 10
  const detailSearch = getCandidateNavigationSearch(searchParams)

  const updateSearch = useCallback(
    (updates: Partial<RecruitmentDetailSearch>) => {
      void navigate({
        search: (previous) => ({ ...previous, ...updates, tab: "candidates" }),
        replace: true,
      })
    },
    [navigate]
  )
  const setSearch = useCallback(
    (value: string) => {
      updateSearch({
        candidateSearch: value || undefined,
        candidatePage: undefined,
      })
    },
    [updateSearch]
  )
  const handlePageChange = (value: number) => {
    updateSearch({ candidatePage: value > 1 ? value : undefined })
  }

  // Real API Query for Batch Applications
  const {
    currentData: apiData,
    error: apiError,
    isLoading: isApiLoading,
    isError: isApiError,
    refetch: refetchApplications,
  } = useGetBatchApplicationsQuery({
    id: recruitment.id,
    search: search.trim() || undefined,
    status:
      statusFilter !== "all"
        ? parseStatusFilterToNumber(statusFilter)
        : undefined,
    page,
    pageSize,
  })

  const [isAddOpen, setIsAddOpen] = useState(false)

  // Build stage dropdown items directly from batchStages
  const stageCount = useMemo(() => {
    if (recruitment.batchStages && recruitment.batchStages.length > 0) {
      return recruitment.batchStages.length
    }
    return recruitment.stages?.length ?? 0
  }, [recruitment.batchStages, recruitment.stages])

  const hasStages = stageCount > 0

  const stageItems = useMemo(() => {
    const items = [{ label: "All Stages", value: "all" }]
    const list =
      recruitment.batchStages && recruitment.batchStages.length > 0
        ? recruitment.batchStages.map((bs) => bs.stageName)
        : (recruitment.stages || []).map((s) => s.name)

    list.forEach((name, idx) => {
      items.push({
        label: `Stage ${idx + 1}: ${name}`,
        value: String(idx),
      })
    })
    return items
  }, [recruitment.batchStages, recruitment.stages])

  const handleStageChange = useCallback(
    (value: string | null) => {
      if (!value) return
      updateSearch({
        stage: value === "all" ? undefined : Number(value),
        candidatePage: undefined,
      })
    },
    [updateSearch]
  )

  const handleStatusChange = useCallback(
    (value: string | null) => {
      if (!value) return
      const result = candidateStatusFilterSchema.safeParse(value)
      if (value !== "all" && !result.success) return
      updateSearch({
        candidateStatus: result.success ? result.data : undefined,
        candidatePage: undefined,
      })
    },
    [updateSearch]
  )

  // Map API data into UI application items
  const currentApplications: CandidateApplicationItem[] = useMemo(() => {
    if (!apiData?.items) return []
    const stages = recruitment.batchStages || []

    return apiData.items.map((item) => {
      const cand = item.candidate
      const statusStr = mapApplicationStatus(item.status)
      const currentStageIndex = stages.findIndex(
        (stage) => stage.id === item.currentStageId
      )
      const currentStageStatus = mapApplicationStageStatus(item.currentStageStatus)

      return {
        id: item.id,
        candidateId: item.candidateId,
        recruitmentBatchId: item.recruitmentBatchId,
        codeApplication: item.codeApplication,
        appliedAt: item.appliedAt ?? item.createdAt ?? "",
        status: statusStr,
        finalStatus: mapFinalResultStatus(item.finalResultStatus),
        note: item.notes,
        fileOfferingLetter: item.fileOfferingLetter,
        offeringLetterStatus:
          item.offeringLetterStatus != null
            ? String(item.offeringLetterStatus)
            : null,
        candidateName: cand?.fullName || "Unnamed Candidate",
        candidateEmail: cand?.email || "-",
        candidatePhone: cand?.phoneNumber,
        candidateEducation: cand?.education
          ? `${cand.education}${cand.institution ? ` • ${cand.institution}` : ""}`
          : cand?.institution || "-",
        candidateInstitution: cand?.institution,
        candidateGpa: cand?.gpa != null ? String(cand.gpa) : undefined,
        candidateCv: cand?.cv,
        candidatePortfolio: cand?.portfolio,
        currentStageIndex,
        currentStageName: item.currentStageName ?? "Not started",
        currentStageScore: null,
        currentStageStatus,
        applicationStages: stages.map((s, idx) => ({
          stageIndex: idx,
          stageId: s.id,
          batchStageId: s.id,
          applicationStageId: null,
          stageName: s.stageName,
          stageType: s.stageCategory?.toLowerCase() ?? "screening",
          stageTypeName: s.stageTypeName,
          passingScore: s.passingScore,
          status: s.id === item.currentStageId ? currentStageStatus : "unknown",
          totalScore: null,
        })),
      }
    })
  }, [apiData, recruitment.batchStages])

  const totalCount = apiData?.totalItems ?? 0

  const handleSort = (key: string) => {
    const result = candidateSortSchema.safeParse(key)
    if (!result.success) return
    const direction =
      sortKey === result.data && sortDirection === "asc" ? "desc" : "asc"
    updateSearch({
      candidateSort: result.data === "appliedAt" ? undefined : result.data,
      candidateDirection: direction === "desc" ? undefined : direction,
    })
  }

  const handleResetFilters = () => {
    updateSearch({
      candidateSearch: undefined,
      stage: undefined,
      candidateStatus: undefined,
      candidatePage: undefined,
    })
  }

  const handleOpenDetail = (application: CandidateApplicationItem) => {
    void navigate({
      to: "/recruitments/$id/applications/$applicationId",
      params: { id: recruitment.id, applicationId: application.id },
      search: detailSearch,
    })
  }

  const handleAddCandidates = () => {
    refetchApplications()
  }

  // Active filter chips
  const activeChips: Chip[] = useMemo(() => {
    const chips: Chip[] = []
    if (search.trim()) {
      chips.push({
        key: "search",
        label: `Search: "${search}"`,
        onRemove: () => {
          setSearch("")
        },
      })
    }
    if (stageFilter !== "all") {
      const match = stageItems.find((s) => s.value === stageFilter)
      chips.push({
        key: "stage",
        label: match?.label || `Stage ${Number(stageFilter) + 1}`,
        onRemove: () => handleStageChange("all"),
      })
    }
    if (statusFilter !== "all") {
      const match = candidateStatusItems.find((s) => s.value === statusFilter)
      chips.push({
        key: "status",
        label: `Status: ${match?.label || statusFilter}`,
        onRemove: () => handleStatusChange("all"),
      })
    }
    return chips
  }, [
    search,
    stageFilter,
    statusFilter,
    stageItems,
    handleStageChange,
    handleStatusChange,
    setSearch,
  ])

  const startIndex = (page - 1) * pageSize

  return {
    search,
    setSearch,
    stageFilter,
    statusFilter,
    sortKey,
    sortDirection,
    page,
    pageSize,
    isRealBatch: true,
    hasStages,
    stageCount,
    isApiLoading,
    isApiError,
    apiError,
    refetchApplications,
    detailSearch,
    isAddOpen,
    setIsAddOpen,
    stageItems,
    statusItems: candidateStatusItems,
    currentApplications,
    totalCount,
    startIndex,
    activeChips,
    handleStageChange,
    handleStatusChange,
    handleSort,
    handlePageChange,
    handleResetFilters,
    handleOpenDetail,
    handleAddCandidates,
  }
}
