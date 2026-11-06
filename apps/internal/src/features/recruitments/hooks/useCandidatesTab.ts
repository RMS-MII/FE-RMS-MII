import { useState, useMemo, useEffect } from "react"
import type { Recruitment, CandidateApplicationItem } from "../types"
import type { Chip, SortDirection } from "@/shared/components"
import {
  getRecruitmentCandidateApplications,
  filterCandidateApplications,
  sortCandidateApplications,
  type CandidateAppSortKey,
} from "../utils"
import { useGetBatchApplicationsQuery } from "../api/applications-api"

export const statusToneMap: Record<string, "success" | "warning" | "info" | "danger" | "neutral"> = {
  passed: "success",
  accepted: "success",
  in_progress: "info",
  pending: "warning",
  failed: "danger",
  rejected: "danger",
  withdrawn: "neutral",
  upcoming: "neutral",
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
}

export const candidateStatusItems = [
  { label: "All Status", value: "all" },
  { label: "In Progress", value: "in_progress" },
  { label: "Passed", value: "passed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Accepted", value: "accepted" },
  { label: "Withdrawn", value: "withdrawn" },
]

export function parseStatusFilterToNumber(filter: string): number | undefined {
  if (filter === "pending") return 0
  if (filter === "in_progress") return 1
  if (filter === "passed" || filter === "accepted") return 2
  if (filter === "failed" || filter === "rejected") return 3
  if (filter === "withdrawn") return 4
  return undefined
}

export function mapApplicationStatus(status: number | string | undefined | null): string {
  if (status === null || status === undefined) return "in_progress"
  const s = String(status).toLowerCase()
  if (s === "0" || s === "pending") return "pending"
  if (s === "1" || s === "in_progress" || s === "inprogress") return "in_progress"
  if (s === "2" || s === "passed" || s === "accepted") return "passed"
  if (s === "3" || s === "failed" || s === "rejected") return "failed"
  if (s === "4" || s === "withdrawn") return "withdrawn"
  return s
}

export interface UseCandidatesTabProps {
  recruitment: Recruitment
  selectedStageIndex?: number | null
  onStageChange?: (stageIndex: number | null) => void
}

export function useCandidatesTab({
  recruitment,
  selectedStageIndex = null,
  onStageChange,
}: UseCandidatesTabProps) {
  // Search and filter states
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string>(
    selectedStageIndex !== null ? String(selectedStageIndex) : "all"
  )
  const [statusFilter, setStatusFilter] = useState("all")

  // Sorting and pagination states
  const [sortKey, setSortKey] = useState<CandidateAppSortKey>("appliedAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)
  const pageSize = 5

  const isRealBatch = Boolean(recruitment.id && !recruitment.id.startsWith("r"))

  const {
    data: apiData,
    isLoading: isApiLoading,
    isError: isApiError,
    refetch: refetchApplications,
  } = useGetBatchApplicationsQuery(
    {
      id: recruitment.id,
      search: search.trim() || undefined,
      status: statusFilter !== "all" ? parseStatusFilterToNumber(statusFilter) : undefined,
      page,
      pageSize,
    },
    { skip: !isRealBatch }
  )

  // Applications state (allows adding candidates manually)
  const [applications, setApplications] = useState<CandidateApplicationItem[]>(() =>
    getRecruitmentCandidateApplications(recruitment)
  )

  useEffect(() => {
    setApplications(getRecruitmentCandidateApplications(recruitment))
  }, [recruitment])

  // Selected application for detail modal
  const [selectedApplication, setSelectedApplication] =
    useState<CandidateApplicationItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Sync external stage index with internal dropdown state
  useEffect(() => {
    if (selectedStageIndex !== null) {
      setStageFilter(String(selectedStageIndex))
    }
  }, [selectedStageIndex])

  // Build stage dropdown items from batchStages or fallback to stages
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

  const parsedStageIndex = stageFilter !== "all" ? Number(stageFilter) : null

  // Handle stage filter changes
  const handleStageChange = (val: string | null) => {
    if (!val) return
    setStageFilter(val)
    setPage(1)
    if (onStageChange) {
      onStageChange(val === "all" ? null : Number(val))
    }
  }

  // Handle status filter changes
  const handleStatusChange = (val: string | null) => {
    if (!val) return
    setStatusFilter(val)
    setPage(1)
  }

  // Filter applications (for mock mode)
  const filteredApplications = useMemo(() => {
    return filterCandidateApplications(
      applications,
      search,
      parsedStageIndex,
      statusFilter
    )
  }, [applications, search, parsedStageIndex, statusFilter])

  // Sort applications (for mock mode)
  const sortedApplications = useMemo(() => {
    return sortCandidateApplications(
      filteredApplications,
      sortKey,
      sortDirection,
      parsedStageIndex
    )
  }, [filteredApplications, sortKey, sortDirection, parsedStageIndex])

  // Paginate applications (for mock mode)
  const paginatedApplications = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedApplications.slice(start, start + pageSize)
  }, [sortedApplications, page, pageSize])

  // Map API data if real batch
  const apiApplications: CandidateApplicationItem[] = useMemo(() => {
    if (!isRealBatch || !apiData?.items) return []
    const stages = recruitment.batchStages || []
    return apiData.items.map((item) => {
      const cand = item.candidate
      const statusStr = mapApplicationStatus(item.status)
      const activeStage = stages[0]?.stageName || "Document Screening"

      return {
        id: item.id,
        candidateId: item.candidateId,
        recruitmentBatchId: item.recruitmentBatchId,
        codeApplication: item.codeApplication,
        appliedAt: item.appliedAt || item.createdAt || new Date().toISOString(),
        status: statusStr,
        finalStatus: item.finalResultStatus || undefined,
        note: item.notes,
        fileOfferingLetter: item.fileOfferingLetter,
        offeringLetterStatus: item.offeringLetterStatus ? String(item.offeringLetterStatus) : null,
        candidateName: cand?.fullName || "Unnamed Candidate",
        candidateEmail: cand?.email || "-",
        candidatePhone: cand?.phoneNumber,
        candidateEducation: cand?.education
          ? `${cand.education}${cand.institution ? ` • ${cand.institution}` : ""}`
          : cand?.institution || "-",
        candidateInstitution: cand?.institution,
        candidateGpa: cand?.gpa ? String(cand.gpa) : undefined,
        candidateCv: cand?.cv,
        candidatePortfolio: cand?.portfolio,
        currentStageIndex: 0,
        currentStageName: activeStage,
        currentStageScore: null,
        currentStageStatus: statusStr,
        applicationStages: stages.map((s, idx) => ({
          stageIndex: idx,
          stageId: s.id,
          stageName: s.stageName,
          stageType: s.stageCategory?.toLowerCase() ?? "screening",
          stageTypeName: s.stageTypeName,
          passingScore: s.passingScore,
          status: idx === 0 ? statusStr : "upcoming",
          totalScore: null,
        })),
      }
    })
  }, [isRealBatch, apiData?.items, recruitment.batchStages])

  const currentApplications = isRealBatch ? apiApplications : paginatedApplications
  const totalCount = isRealBatch ? (apiData?.totalItems ?? 0) : sortedApplications.length

  const handleSort = (key: string) => {
    const k = key as CandidateAppSortKey
    if (sortKey === k) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(k)
      setSortDirection("asc")
    }
  }

  const handleResetFilters = () => {
    setSearch("")
    setStageFilter("all")
    setStatusFilter("all")
    setPage(1)
    if (onStageChange) {
      onStageChange(null)
    }
  }

  const handleOpenDetail = (app: CandidateApplicationItem) => {
    setSelectedApplication(app)
    setIsDetailOpen(true)
  }

  const handleAddCandidates = (newApps: CandidateApplicationItem[]) => {
    setApplications((prev) => [...newApps, ...prev])
  }

  const handleUpdateCandidateStatus = (
    applicationId: string,
    action: "advance" | "reject" | "reopen",
    payload?: { reason?: string; notes?: string }
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== applicationId) return app

        const now = new Date().toISOString()
        const stages = [...app.applicationStages]
        const currentIdx = app.currentStageIndex
        const currentStage = stages[currentIdx]

        if (action === "advance") {
          // Mark current stage passed
          if (currentStage) {
            stages[currentIdx] = {
              ...currentStage,
              status: "passed",
              completedAt: now,
              feedback: payload?.notes || currentStage.feedback || "Passed by HR evaluation",
            }
          }

          const isLastStage = currentIdx >= stages.length - 1
          if (isLastStage) {
            const updated: CandidateApplicationItem = {
              ...app,
              status: "accepted",
              finalStatus: "accepted",
              applicationStages: stages,
            }
            if (selectedApplication?.id === applicationId) {
              setSelectedApplication(updated)
            }
            return updated
          } else {
            const nextIdx = currentIdx + 1
            if (stages[nextIdx]) {
              stages[nextIdx] = {
                ...stages[nextIdx],
                status: "in_progress",
                startedAt: now,
              }
            }
            const updated: CandidateApplicationItem = {
              ...app,
              status: "in_progress",
              currentStageIndex: nextIdx,
              applicationStages: stages,
            }
            if (selectedApplication?.id === applicationId) {
              setSelectedApplication(updated)
            }
            return updated
          }
        } else if (action === "reject") {
          if (currentStage) {
            stages[currentIdx] = {
              ...currentStage,
              status: "failed",
              completedAt: now,
              feedback: payload?.notes || payload?.reason || "Disqualified",
            }
          }
          const updated: CandidateApplicationItem = {
            ...app,
            status: "rejected",
            finalStatus: "rejected",
            rejectReason: payload?.reason,
            applicationStages: stages,
          }
          if (selectedApplication?.id === applicationId) {
            setSelectedApplication(updated)
          }
          return updated
        } else if (action === "reopen") {
          if (currentStage) {
            stages[currentIdx] = {
              ...currentStage,
              status: "in_progress",
              completedAt: null,
            }
          }
          const updated: CandidateApplicationItem = {
            ...app,
            status: "in_progress",
            finalStatus: undefined,
            rejectReason: undefined,
            applicationStages: stages,
          }
          if (selectedApplication?.id === applicationId) {
            setSelectedApplication(updated)
          }
          return updated
        }

        return app
      })
    )
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
          setPage(1)
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
  }, [search, stageFilter, statusFilter, stageItems])

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
    isRealBatch,
    isApiLoading,
    isApiError,
    refetchApplications,
    selectedApplication,
    setSelectedApplication,
    isDetailOpen,
    setIsDetailOpen,
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
    handlePageChange: setPage,
    handleResetFilters,
    handleOpenDetail,
    handleAddCandidates,
    handleUpdateCandidateStatus,
  }
}

