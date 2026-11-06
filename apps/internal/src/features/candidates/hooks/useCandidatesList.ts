import { useState, useMemo, useEffect } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import type { Chip, SortDirection } from "@/shared/components"
import { useGetCandidatesQuery } from "../api/candidates-api"
import type { Candidate, CandidateSearchParams, CandidateSortKey } from "../types"
import { sortCandidates } from "../utils"

export const genderItems = [
  { label: "All Genders", value: "all" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
]

export const batchStatusItems = [
  { label: "All Applications", value: "all" },
  { label: "Has Applications", value: "applied" },
  { label: "Talent Pool", value: "pool" },
]

export function mapGenderDto(gender: number | string | undefined | null): string {
  if (gender === 2 || String(gender).toLowerCase() === "female") return "Female"
  if (gender === 1 || String(gender).toLowerCase() === "male") return "Male"
  return String(gender || "")
}

export function mapBatchStatusDto(status: number | string | undefined | null): string {
  const s = String(status ?? "").toLowerCase()
  if (s === "0" || s === "pending") return "Pending"
  if (s === "1" || s === "in_progress" || s === "inprogress") return "In Progress"
  if (s === "2" || s === "passed" || s === "accepted") return "Accepted"
  if (s === "3" || s === "failed" || s === "rejected") return "Rejected"
  if (s === "4" || s === "withdrawn") return "Withdrawn"
  return String(status ?? "")
}

export function useCandidatesList() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: "/_auth/candidates/" })

  // Search parameters from URL with defaults
  const search = searchParams.search ?? ""
  const gender = searchParams.gender ?? "all"
  const batchStatus = searchParams.batchStatus ?? "all"
  const sortKey = (searchParams.sort as CandidateSortKey) ?? "createdAt"
  const sortDirection = (searchParams.order as SortDirection) ?? "desc"
  const page = searchParams.page ? Number(searchParams.page) : 1
  const pageSize = searchParams.pageSize ? Number(searchParams.pageSize) : 5

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Local state for smooth typing in SearchInput
  const [searchTerm, setSearchTerm] = useState(search)

  useEffect(() => {
    setSearchTerm(search)
  }, [search])

  const handleUpdateSearch = (updates: Partial<CandidateSearchParams>) => {
    navigate({
      to: "/candidates",
      search: (prev) => ({
        ...prev,
        search: updates.search !== undefined ? (updates.search.trim() ? updates.search.trim() : undefined) : prev.search,
        gender: updates.gender !== undefined ? (updates.gender === "all" ? undefined : updates.gender) : prev.gender,
        batchStatus:
          updates.batchStatus !== undefined
            ? updates.batchStatus === "all"
              ? undefined
              : updates.batchStatus
            : prev.batchStatus,
        sort: updates.sort !== undefined ? updates.sort : prev.sort,
        order: updates.order !== undefined ? updates.order : prev.order,
        page: updates.page !== undefined ? (updates.page === 1 ? undefined : updates.page) : prev.page,
        pageSize: updates.pageSize !== undefined ? (updates.pageSize === 5 ? undefined : updates.pageSize) : prev.pageSize,
      }),
    })
  }

  useEffect(() => {
    if (searchTerm === search) return

    const timer = setTimeout(() => {
      handleUpdateSearch({
        search: searchTerm.trim() ? searchTerm.trim() : "",
        page: 1,
      })
    }, 350)

    return () => clearTimeout(timer)
  }, [searchTerm, search])

  // RTK Query: fetch from real backend GET /api/candidates
  const {
    data: pagedData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCandidatesQuery({
    search: search.trim() || undefined,
    page,
    pageSize,
  })

  // Map API DTOs into domain CandidateEntity models
  const rawCandidates: Candidate[] = useMemo(() => {
    if (!pagedData?.items) return []

    return pagedData.items.map((dto) => {
      const assignedBatches = (dto.assignedBatches || []).map((b) => ({
        batchId: b.batchId,
        batchCode: b.batchCode,
        batchName: b.batchName,
        appliedAt: b.appliedAt,
        status: mapBatchStatusDto(b.applicationStatus),
      }))

      return {
        id: dto.id,
        fullName: dto.fullName,
        email: dto.email,
        gender: mapGenderDto(dto.gender),
        phoneNumber: dto.phoneNumber || null,
        birthDate: dto.birthDate || null,
        cv: dto.cv || null,
        expectedSalary: dto.expectedSalary ?? null,
        portfolio: dto.portfolio || null,
        education: dto.education || null,
        institution: dto.institution || null,
        address: dto.address || null,
        gpa: dto.gpa ? String(dto.gpa) : null,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt || null,
        appliedBatchCount: assignedBatches.length,
        appliedBatches: assignedBatches,
      }
    })
  }, [pagedData?.items])

  // Apply secondary client filters if set
  const filteredCandidates = useMemo(() => {
    return rawCandidates.filter((c) => {
      if (gender !== "all") {
        if (!c.gender || c.gender.toLowerCase() !== gender.toLowerCase()) {
          return false
        }
      }
      if (batchStatus !== "all") {
        if (batchStatus === "applied" && c.appliedBatchCount === 0) return false
        if (batchStatus === "pool" && c.appliedBatchCount > 0) return false
      }
      return true
    })
  }, [rawCandidates, gender, batchStatus])

  // Client-side sort
  const sortedCandidates = useMemo(() => {
    return sortCandidates(filteredCandidates, sortKey, sortDirection)
  }, [filteredCandidates, sortKey, sortDirection])

  const totalItems = pagedData?.totalItems ?? sortedCandidates.length

  const handleSortChange = (key: CandidateSortKey) => {
    if (sortKey === key) {
      handleUpdateSearch({
        sort: key,
        order: sortDirection === "asc" ? "desc" : "asc",
        page: 1,
      })
    } else {
      handleUpdateSearch({
        sort: key,
        order: "asc",
        page: 1,
      })
    }
  }

  const handleOpenDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsDetailOpen(true)
  }

  // Active filter chips for easy reset
  const activeChips: Chip[] = useMemo(() => {
    const chips: Chip[] = []
    if (search.trim()) {
      chips.push({
        key: "search",
        label: `Search: "${search}"`,
        onRemove: () => {
          setSearchTerm("")
          handleUpdateSearch({ search: "", page: 1 })
        },
      })
    }
    if (gender && gender !== "all") {
      const match = genderItems.find((g) => g.value === gender)
      chips.push({
        key: "gender",
        label: `Gender: ${match?.label || gender}`,
        onRemove: () => handleUpdateSearch({ gender: "all", page: 1 }),
      })
    }
    if (batchStatus && batchStatus !== "all") {
      const match = batchStatusItems.find((b) => b.value === batchStatus)
      chips.push({
        key: "batchStatus",
        label: `Application: ${match?.label || batchStatus}`,
        onRemove: () => handleUpdateSearch({ batchStatus: "all", page: 1 }),
      })
    }
    return chips
  }, [search, gender, batchStatus])

  const handleResetFilters = () => {
    setSearchTerm("")
    handleUpdateSearch({
      search: "",
      gender: "all",
      batchStatus: "all",
      page: 1,
    })
  }

  return {
    search,
    searchTerm,
    setSearchTerm,
    gender,
    batchStatus,
    sortKey,
    sortDirection,
    page,
    pageSize,
    candidates: sortedCandidates,
    totalItems,
    isLoading: isLoading || isFetching,
    isError,
    refetch,
    selectedCandidate,
    isDetailOpen,
    setIsDetailOpen,
    activeChips,
    genderItems,
    batchStatusItems,
    handleUpdateSearch,
    handleSortChange,
    handleOpenDetail,
    handleResetFilters,
  }
}
