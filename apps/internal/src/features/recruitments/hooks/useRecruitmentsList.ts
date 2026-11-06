import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import type { SortDirection, Chip } from "@/shared/components"
import { getRecruitmentStatusMeta } from "../types"
import { useGetBatchesQuery } from "../api/recruitments-api"

export type SortKey = "code" | "name" | "stage" | "candidates" | "period" | "status"

export const PAGE_SIZE = 10

export const recruitmentStatusItems: { label: string; value: string }[] = [
  { label: "All Status", value: "all" },
  { label: "Draft", value: "1" },
  { label: "Open", value: "2" },
  { label: "Closed", value: "3" },
]

export function useRecruitmentsList() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: "/_auth/recruitments/" })

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Derived from search params
  const search = searchParams.search ?? ""
  const statusFilter = searchParams.status ?? "all"
  const sortKey = (searchParams.sortBy as SortKey | undefined) ?? "code"
  const sortDirection = (searchParams.order as SortDirection | undefined) ?? "asc"
  const page = searchParams.page ? Number(searchParams.page) : 1

  // Local state for smooth typing in SearchInput
  const [searchTerm, setSearchTerm] = useState(search)

  useEffect(() => {
    setSearchTerm(search)
  }, [search])

  useEffect(() => {
    if (searchTerm === search) return

    const timer = setTimeout(() => {
      navigate({
        to: "/recruitments",
        search: (prev) => ({
          ...prev,
          search: searchTerm.trim() ? searchTerm.trim() : undefined,
          page: undefined,
        }),
        replace: true,
      })
    }, 350)

    return () => clearTimeout(timer)
  }, [searchTerm, search, navigate])

  // Convert status filter to backend numeric enum
  const apiStatusParam = useMemo(() => {
    if (!statusFilter || statusFilter === "all") return undefined
    if (statusFilter === "1" || statusFilter.toLowerCase() === "draft") return 1
    if (statusFilter === "2" || statusFilter.toLowerCase() === "open" || statusFilter.toLowerCase() === "running") return 2
    if (statusFilter === "3" || statusFilter.toLowerCase() === "closed" || statusFilter.toLowerCase() === "completed") return 3
    const num = Number(statusFilter)
    return isNaN(num) ? undefined : num
  }, [statusFilter])

  // RTK Query: fetch directly from GET /api/batches
  const {
    data: pagedData,
    isLoading,
    isError,
    refetch,
  } = useGetBatchesQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search.trim() || undefined,
    status: apiStatusParam,
  })

  const recruitments = useMemo(() => pagedData?.items ?? [], [pagedData])
  const totalItems = pagedData?.totalItems ?? 0

  const handleClearSearch = () => {
    setSearchTerm("")
    navigate({
      to: "/recruitments",
      search: (prev) => ({
        ...prev,
        search: undefined,
        page: undefined,
      }),
      replace: true,
    })
  }

  const handleStatusChange = (val: string | null) => {
    if (!val) return
    navigate({
      to: "/recruitments",
      search: (prev) => ({
        ...prev,
        status: val === "all" ? undefined : val,
        page: undefined,
      }),
      replace: true,
    })
  }

  const handleSort = (key: string) => {
    const k = key as SortKey
    let nextSortKey: SortKey | undefined = k
    let nextOrder: SortDirection | undefined = "asc"

    if (sortKey === k) {
      if (sortDirection === "asc") {
        nextOrder = "desc"
      } else if (sortDirection === "desc") {
        nextSortKey = undefined
        nextOrder = undefined
      }
    }

    navigate({
      to: "/recruitments",
      search: (prev) => ({
        ...prev,
        sortBy: nextSortKey,
        order: nextOrder,
      }),
      replace: true,
    })
  }

  const handlePageChange = (newPage: number) => {
    navigate({
      to: "/recruitments",
      search: (prev) => ({
        ...prev,
        page: newPage === 1 ? undefined : newPage,
      }),
      replace: true,
    })
  }

  // Active filter chips
  const activeChips: Chip[] = useMemo(() => {
    const chips: Chip[] = []
    if (search.trim()) {
      chips.push({
        key: "search",
        label: `Search: "${search}"`,
        onRemove: handleClearSearch,
      })
    }
    if (statusFilter !== "all") {
      const meta = getRecruitmentStatusMeta(statusFilter)
      chips.push({
        key: "status",
        label: `Status: ${meta.label}`,
        onRemove: () => {
          navigate({
            to: "/recruitments",
            search: (prev) => ({
              ...prev,
              status: undefined,
              page: undefined,
            }),
            replace: true,
          })
        },
      })
    }
    return chips
  }, [search, statusFilter, navigate])

  const handleResetFilters = () => {
    setSearchTerm("")
    navigate({
      to: "/recruitments",
      search: (prev) => ({
        sortBy: prev.sortBy,
        order: prev.order,
      }),
      replace: true,
    })
  }

  const handleViewDetail = (id: string) => {
    navigate({
      to: "/recruitments/$id",
      params: { id },
    })
  }

  return {
    search,
    searchTerm,
    setSearchTerm,
    statusFilter,
    sortKey,
    sortDirection,
    page,
    pageSize: PAGE_SIZE,
    recruitments,
    totalItems,
    isLoading,
    isError,
    refetch,
    isCreateOpen,
    setIsCreateOpen,
    activeChips,
    statusItems: recruitmentStatusItems,
    handleClearSearch,
    handleStatusChange,
    handleSort,
    handlePageChange,
    handleResetFilters,
    handleViewDetail,
  }
}
