import { useState, useMemo, useCallback } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import type { Recruitment, CandidateApplicationItem } from "../types"
import type { Chip } from "@/shared/components"
import {
  candidateSortSchema,
  getCandidateNavigationSearch,
  type RecruitmentDetailSearch,
} from "../schemas/recruitment-navigation"
import { useGetBatchApplicationsQuery } from "../api/applications-api"
import {
  mapApplicationStatus,
  mapApplicationStageStatus,
  mapFinalResultStatus,
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
  dropped: "danger",
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

export interface UseCandidatesTabProps {
  recruitment: Recruitment
}

export function useCandidatesTab({ recruitment }: UseCandidatesTabProps) {
  const navigate = useNavigate({ from: "/recruitments/$id/" })
  const searchParams = useSearch({ from: "/_auth/recruitments/$id/" })
  const search = searchParams.candidateSearch ?? ""
  const stageFilter =
    searchParams.stage !== undefined ? String(searchParams.stage) : "all"
  const sortKey = searchParams.candidateSort ?? "appliedAt"
  const sortDirection = searchParams.candidateDirection ?? "desc"
  const page = searchParams.candidatePage ?? 1
  const pageSize = 10
  const detailSearch = getCandidateNavigationSearch(searchParams)
  const stageFilterIndex = stageFilter !== "all" ? Number(stageFilter) : null

  // Stage "Active" (pipeline biru) dipakai sebagai default saat tidak ada
  // pilihan stage dari stepper. Filter FE sudah dinonaktifkan karena redudan,
  // jadi daftar kandidat sepenuhnya berasal dari API.
  const activeStageId = useMemo(() => {
    const activeStage = (recruitment.batchStages ?? []).find((stage) => {
      const lifecycle = String(stage.lifecycleStatus ?? "").toLowerCase()
      return lifecycle === "active" || lifecycle === "1"
    })
    return activeStage?.id
  }, [recruitment.batchStages])

  const effectiveStageId =
    (stageFilterIndex !== null
      ? recruitment.batchStages?.[stageFilterIndex]?.id
      : undefined) ?? activeStageId

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
    stageId: effectiveStageId,
    page,
    pageSize,
  })

  const [isAddOpen, setIsAddOpen] = useState(false)

  const stageCount = useMemo(() => {
    if (recruitment.batchStages && recruitment.batchStages.length > 0) {
      return recruitment.batchStages.length
    }
    return recruitment.stages?.length ?? 0
  }, [recruitment.batchStages, recruitment.stages])

  const hasStages = stageCount > 0

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
      const currentStageStatus = mapApplicationStageStatus(
        item.currentStageStatus
      )

      return {
        id: item.id,
        isStandalone: item.isStandalone,
        expectedSalary: item.expectedSalary,
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

  // Active filter chips (hanya search — stage/status ditentukan pipeline & API)
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
    return chips
  }, [search, setSearch])

  const startIndex = (page - 1) * pageSize

  return {
    search,
    setSearch,
    stageFilter,
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
    currentApplications,
    totalCount,
    startIndex,
    activeChips,
    handleSort,
    handlePageChange,
    handleResetFilters,
    handleOpenDetail,
    handleAddCandidates,
  }
}
