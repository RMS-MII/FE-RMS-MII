import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
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

// Feature-owned data & types
import type { Recruitment, RecruitmentStatus } from "../types"
import {
  initialRecruitments,
  recruitmentStatusMeta,
  activeCandidateCount,
} from "../data/mock"
import { CreateRecruitmentDialog } from "../components/CreateRecruitmentDialog"

type SortKey = "code" | "name" | "stage" | "candidates" | "period" | "status"

const PAGE_SIZE = 5

const statusItems: { label: string; value: RecruitmentStatus | "all" }[] = [
  { label: "All Status", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Running", value: "running" },
  { label: "Completed", value: "completed" },
  { label: "Closed", value: "closed" },
]

export function RecruitmentsListPage() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: "/_auth/recruitments/" })

  const [data, setData] = useState<Recruitment[]>(initialRecruitments)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Derived from search params
  const search = searchParams.search ?? ""
  const statusFilter = (searchParams.status as RecruitmentStatus | undefined) ?? "all"
  const divisionFilter = searchParams.division ?? "all"
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
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, search, navigate])

  // Divisions list
  const divisions = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.division))).sort()
  }, [data])

  const divisionItems = useMemo(() => {
    return [
      { label: "All Division", value: "all" },
      ...divisions.map((d) => ({ label: d, value: d })),
    ]
  }, [divisions])

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
        status: val === "all" ? undefined : (val as RecruitmentStatus),
        page: undefined,
      }),
      replace: true,
    })
  }

  const handleDivisionChange = (val: string | null) => {
    if (!val) return
    navigate({
      to: "/recruitments",
      search: (prev) => ({
        ...prev,
        division: val === "all" ? undefined : val,
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

  // Filter & Search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        item.batchCode.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.division.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter

      const matchesDivision =
        divisionFilter === "all" || item.division === divisionFilter

      return matchesSearch && matchesStatus && matchesDivision
    })
  }, [data, search, statusFilter, divisionFilter])

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      let valA: string | number = ""
      let valB: string | number = ""

      switch (sortKey) {
        case "code":
          valA = a.batchCode
          valB = b.batchCode
          break
        case "name":
          valA = a.name.toLowerCase()
          valB = b.name.toLowerCase()
          break
        case "stage":
          valA = a.currentStage
          valB = b.currentStage
          break
        case "candidates":
          valA = activeCandidateCount(a)
          valB = activeCandidateCount(b)
          break
        case "period":
          valA = a.openDate
          valB = b.openDate
          break
        case "status":
          valA = a.status
          valB = b.status
          break
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1
      if (valA > valB) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortKey, sortDirection])

  // Pagination
  const totalItems = sortedData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return sortedData.slice(start, start + PAGE_SIZE)
  }, [sortedData, safePage])

  // Filter chips
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
      chips.push({
        key: "status",
        label: `Status: ${recruitmentStatusMeta[statusFilter]?.label ?? statusFilter}`,
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
    if (divisionFilter !== "all") {
      chips.push({
        key: "division",
        label: `Division: ${divisionFilter}`,
        onRemove: () => {
          navigate({
            to: "/recruitments",
            search: (prev) => ({
              ...prev,
              division: undefined,
              page: undefined,
            }),
            replace: true,
          })
        },
      })
    }
    return chips
  }, [search, statusFilter, divisionFilter, navigate])

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

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((r) => r.id !== id))
  }

  const handleViewDetail = (id: string) => {
    navigate({
      to: "/recruitments/$id",
      params: { id },
    })
  }

  const renderCurrentStage = (r: Recruitment) => {
    if (r.stages.length === 0) {
      return <span className="text-sm text-muted-foreground">No stages</span>
    }
    if (r.currentStage < 0 || r.status === "draft") {
      return <span className="text-sm text-muted-foreground">Not started</span>
    }
    if (r.currentStage >= r.stages.length || r.status === "completed") {
      return <span className="text-sm text-muted-foreground">All stages completed</span>
    }
    const current = r.stages[r.currentStage]
    return (
      <div className="flex items-baseline gap-1.5 whitespace-nowrap text-sm">
        <span className="font-normal text-foreground">
          {current?.name ?? `Stage ${r.currentStage + 1}`}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitments"
        description="Each recruitment represents one job vacancy and its selection stages."
      />

      <Panel>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name or position"
            />

            <Select
              items={statusItems}
              value={statusFilter}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-10 w-40 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {statusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              items={divisionItems}
              value={divisionFilter}
              onValueChange={handleDivisionChange}
            >
              <SelectTrigger className="h-10 w-44 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
                <SelectValue placeholder="All Division" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {divisionItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 gap-1.5 rounded-full border-0 bg-primary px-5 text-sm font-medium text-primary-foreground shadow-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shrink-0"
          >
            <Plus className="size-4" aria-hidden />
            <span>Create recruitment</span>
          </Button>
        </div>

        <FilterChips chips={activeChips} onReset={handleResetFilters} />

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
                  className="w-36 pl-5"
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
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <EmptyState
                      title="No recruitments match"
                      description={
                        search || statusFilter !== "all" || divisionFilter !== "all"
                          ? "Change keywords or clear filters to view other recruitments."
                          : "Create your first recruitment to start accepting candidates."
                      }
                      action={
                        search || statusFilter !== "all" || divisionFilter !== "all" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="rounded-full border-0 bg-muted/60 text-foreground hover:bg-muted"
                          >
                            Reset filters
                          </Button>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((recruitment) => {
                  const statusMeta = recruitmentStatusMeta[recruitment.status]
                  const activeCountNumber = activeCandidateCount(recruitment)

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
                            {recruitment.division}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm">
                        {renderCurrentStage(recruitment)}
                      </TableCell>

                      <TableCell className="text-center tabular-nums text-sm font-normal text-foreground">
                        {activeCountNumber}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                        {formatPeriod(recruitment.openDate, recruitment.closeDate)}
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
                                className="size-8 rounded-full text-foreground transition-colors hover:bg-muted"
                                aria-label={`Actions for ${recruitment.name}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 rounded-xl">
                            <DropdownMenuItem
                              onClick={() => handleViewDetail(recruitment.id)}
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <Eye className="size-3.5" aria-hidden />
                              <span>View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <Pencil className="size-3.5" aria-hidden />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(recruitment.id)}
                              className="cursor-pointer gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="size-3.5" aria-hidden />
                              <span>Delete</span>
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

        {/* Pagination */}
        {sortedData.length > 0 && (
          <DataTablePagination
            page={safePage}
            pageSize={PAGE_SIZE}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        )}
      </Panel>

      {/* Create Recruitment Dialog */}
      <CreateRecruitmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        existingCount={data.length}
        onSuccess={(newRecruitment) => {
          setData((prev) => [newRecruitment, ...prev])
        }}
      />
    </div>
  )
}

