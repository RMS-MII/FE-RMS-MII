import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Eye, MoreHorizontal, Plus, Loader2, AlertCircle, Calendar } from "lucide-react"

// Primitives from @workspace/ui
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

// Shared internal components
import {
  PageHeader,
  Panel,
  SearchInput,
  FilterChips,
  type Chip,
  TableSortHeader,
  type SortDirection,
  StatusBadge,
  DataTablePagination,
  EmptyState,
} from "@/shared/components"
import { formatPeriod } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"

// Feature-owned data, api & types
import type { Recruitment } from "../types"
import { getRecruitmentStatusMeta } from "../types"
import { activeCandidateCount } from "../data/mock"
import { useGetBatchesQuery } from "../api/recruitments-api"
import { CreateRecruitmentDialog } from "../components/CreateRecruitmentDialog"
import { formatCurrentStageText } from "../utils"

type SortKey = "code" | "name" | "stage" | "candidates" | "period" | "status"

const PAGE_SIZE = 10

const statusItems: { label: string; value: string }[] = [
  { label: "All Status", value: "all" },
  { label: "Draft", value: "1" },
  { label: "Open", value: "2" },
  { label: "Closed", value: "3" },
]

export function RecruitmentsListPage() {
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

  const renderCurrentStage = (r: Recruitment) => {
    const text = formatCurrentStageText(r)
    const isMuted =
      text === "No stages" ||
      text === "Not started" ||
      text === "All stages completed"

    return (
      <span className={cn("text-sm", isMuted ? "text-muted-foreground" : "font-normal text-foreground")}>
        {text}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitments"
        description="Each recruitment represents one job vacancy and its selection stages."
      />

      <Panel>
        {/* Controls: Search, Filter, New Recruitment Button */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by code or position name"
            />

            <Select
              items={statusItems}
              value={statusFilter}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-10 w-36 rounded-full border border-border bg-muted/60 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-primary">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-card p-1 shadow-md">
                {statusItems.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    className="cursor-pointer rounded-lg text-xs"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateOpen(true)}
              size="sm"
              className="h-10 gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="size-3.5" aria-hidden />
              <span>New Recruitment</span>
            </Button>
          </div>
        </div>

        {/* Filter chips bar */}
        {activeChips.length > 0 && (
          <div className="border-b border-border bg-muted/20 px-5 py-2.5">
            <FilterChips
              chips={activeChips}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Table Section */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-card">
              <TableRow className="hover:bg-transparent">
                <TableSortHeader
                  label="Code"
                  sortKey="code"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="w-52 pl-5"
                />
                <TableSortHeader
                  label="Name"
                  sortKey="name"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="left"
                  className="min-w-64"
                />
                <TableSortHeader
                  label="Current Stage"
                  sortKey="stage"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="w-48"
                />
                <TableSortHeader
                  label="Active Candidates"
                  sortKey="candidates"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                  className="w-36"
                />
                <TableSortHeader
                  label="Period"
                  sortKey="period"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                  className="w-56"
                />
                <TableSortHeader
                  label="Status"
                  sortKey="status"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                  className="w-28"
                />
                <TableSortHeader
                  label=""
                  align="right"
                  className="w-16 pr-5"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 1. Loading state */}
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                      <Loader2 className="size-6 animate-spin text-primary" />
                      <p className="text-xs font-medium">Loading recruitments from API...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                /* 2. Error state */
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                      <AlertCircle className="size-7" />
                      <p className="text-sm font-semibold">Failed to fetch recruitments</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Could not connect to backend server at http://localhost:5160/api/batches. Please make sure the backend is active.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="mt-2 rounded-full cursor-pointer"
                      >
                        Try Again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : recruitments.length === 0 ? (
                /* 3. Empty state */
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <EmptyState
                      title="No recruitments match"
                      description={
                        search || statusFilter !== "all"
                          ? "Change keywords or clear filters to view other recruitments."
                          : "No recruitment batches found. Create your first batch to start accepting candidates."
                      }
                      action={
                        search || statusFilter !== "all" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="rounded-full border-0 bg-muted/60 text-foreground hover:bg-muted cursor-pointer"
                          >
                            Reset filters
                          </Button>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                /* 4. Data rows */
                recruitments.map((recruitment) => {
                  const statusMeta = getRecruitmentStatusMeta(recruitment.status)
                  const candidateCount = recruitment.stages ? activeCandidateCount(recruitment) : "—"

                  return (
                    <TableRow
                      key={recruitment.id}
                      className="border-b border-border transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="pl-5 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-muted-foreground">
                          {recruitment.batchCode}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleViewDetail(recruitment.id)}
                            className="text-left text-sm font-semibold text-foreground transition-colors hover:text-primary hover:underline cursor-pointer"
                          >
                            {recruitment.name}
                          </button>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {recruitment.departmentName || recruitment.division || "—"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm">
                        {renderCurrentStage(recruitment)}
                      </TableCell>

                      <TableCell className="text-center tabular-nums text-sm font-normal text-muted-foreground">
                        {candidateCount}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-center text-sm tabular-nums text-muted-foreground">
                        {formatPeriod(
                          recruitment.startDate || recruitment.openDate || "",
                          recruitment.endDate || recruitment.closeDate || ""
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-center">
                        <StatusBadge tone={statusMeta.tone}>
                          {statusMeta.label}
                        </StatusBadge>
                      </TableCell>

                      <TableCell className="pr-5 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-8 rounded-full text-foreground transition-colors hover:bg-muted cursor-pointer"
                                aria-label={`Actions for ${recruitment.name}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl bg-card shadow-lg p-1">
                            <DropdownMenuItem
                              onClick={() => handleViewDetail(recruitment.id)}
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <Eye className="size-3.5" aria-hidden />
                              <span>View Detail</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate({ to: `/recruitments/${recruitment.id}/stages` })}
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <Calendar className="size-3.5" aria-hidden />
                              <span>Manage Stages</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Server Pagination */}
        {!isLoading && !isError && totalItems > 0 && (
          <div className="border-t border-border px-5 py-4">
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Panel>

      <CreateRecruitmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
