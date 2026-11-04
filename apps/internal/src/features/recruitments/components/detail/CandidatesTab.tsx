import { useState, useMemo, useEffect } from "react"
import type { Recruitment, CandidateApplicationItem } from "../../types"
import {
  Panel,
  SearchInput,
  StatusBadge,
  EmptyState,
  FilterChips,
  TableSortHeader,
  DataTablePagination,
  type Chip,
  type SortDirection,
} from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
import {
  getRecruitmentCandidateApplications,
  filterCandidateApplications,
  sortCandidateApplications,
  type CandidateAppSortKey,
} from "../../utils"
import { CandidateApplicationDetailDialog } from "./CandidateApplicationDetailDialog"
import { AddCandidateDialog } from "./AddCandidateDialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
import { Eye, UserPlus } from "lucide-react"

export interface CandidatesTabProps {
  recruitment: Recruitment
  selectedStageIndex?: number | null
  onStageChange?: (stageIndex: number | null) => void
}

const statusToneMap: Record<string, "success" | "warning" | "info" | "danger" | "neutral"> = {
  passed: "success",
  accepted: "success",
  in_progress: "info",
  pending: "warning",
  failed: "danger",
  rejected: "danger",
  withdrawn: "neutral",
  upcoming: "neutral",
}

const statusLabelMap: Record<string, string> = {
  in_progress: "In Progress",
  passed: "Passed",
  failed: "Failed",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  upcoming: "Upcoming",
}

const statusItems = [
  { label: "All Status", value: "all" },
  { label: "In Progress", value: "in_progress" },
  { label: "Passed", value: "passed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Accepted", value: "accepted" },
  { label: "Withdrawn", value: "withdrawn" },
]

export function CandidatesTab({
  recruitment,
  selectedStageIndex = null,
  onStageChange,
}: CandidatesTabProps) {
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

  // Build stage dropdown items
  const stageItems = useMemo(() => {
    const items = [{ label: "All Stages", value: "all" }]
    ;(recruitment.stages || []).forEach((stg, idx) => {
      items.push({
        label: `Stage ${idx + 1}: ${stg.name}`,
        value: String(idx),
      })
    })
    return items
  }, [recruitment.stages])

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

  // Filter applications
  const filteredApplications = useMemo(() => {
    return filterCandidateApplications(
      applications,
      search,
      parsedStageIndex,
      statusFilter
    )
  }, [applications, search, parsedStageIndex, statusFilter])

  // Sort applications
  const sortedApplications = useMemo(() => {
    return sortCandidateApplications(
      filteredApplications,
      sortKey,
      sortDirection,
      parsedStageIndex
    )
  }, [filteredApplications, sortKey, sortDirection, parsedStageIndex])

  // Paginate applications
  const paginatedApplications = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedApplications.slice(start, start + pageSize)
  }, [sortedApplications, page, pageSize])

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
      const match = statusItems.find((s) => s.value === statusFilter)
      chips.push({
        key: "status",
        label: `Status: ${match?.label || statusFilter}`,
        onRemove: () => handleStatusChange("all"),
      })
    }
    return chips
  }, [search, stageFilter, statusFilter, stageItems])

  const startIndex = (page - 1) * pageSize

  return (
    <>
      <Panel className="space-y-0">
        {/* Top Search & Filter Bar (Matching Recruitments & Candidates List layout) */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val)
                setPage(1)
              }}
              placeholder="Search candidate, email, or application code..."
              containerClassName="sm:w-80"
            />

            {/* Stage Filter */}
            <Select value={stageFilter} onValueChange={handleStageChange}>
              <SelectTrigger className="h-10 w-48 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {stageItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
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
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-center shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Showing</span>
              <span className="font-semibold text-foreground tabular-nums">
                {filteredApplications.length}
              </span>
              <span>of {applications.length} candidates</span>
            </div>

            <Button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="h-10 gap-1.5 rounded-full border-0 bg-primary px-4 text-sm font-medium text-primary-foreground shadow-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shrink-0"
            >
              <UserPlus className="size-4" aria-hidden />
              <span>Add candidate</span>
            </Button>
          </div>
        </div>

        {/* Removable Active Filter Chips */}
        <FilterChips chips={activeChips} onReset={handleResetFilters} />

        {/* Candidate Application Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 pl-5 text-center">#</TableHead>

                <TableSortHeader
                  label="Candidate Profile"
                  sortKey="name"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />

                <TableSortHeader
                  label="App Code"
                  sortKey="code"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />

                <TableSortHeader
                  label={parsedStageIndex !== null ? "Selected Stage" : "Current Stage"}
                  sortKey="stage"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />

                <TableSortHeader
                  label="Score"
                  sortKey="score"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                />

                <TableSortHeader
                  label="Status"
                  sortKey="status"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />

                <TableSortHeader
                  label="Applied Date"
                  sortKey="appliedAt"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="hidden md:table-cell"
                />

                <TableHead className="w-16 pr-5 text-center whitespace-nowrap">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <EmptyState
                      title="No candidates match"
                      description={
                        activeChips.length > 0
                          ? "Try adjusting your search terms or filters to find candidates."
                          : "No candidates currently registered in this recruitment batch."
                      }
                      action={
                        activeChips.length > 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="rounded-full border-0 bg-muted/60 text-foreground hover:bg-muted cursor-pointer"
                          >
                            Reset filters
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsAddOpen(true)}
                            className="rounded-full border-0 bg-muted/60 text-foreground hover:bg-muted cursor-pointer"
                          >
                            Add your first candidate
                          </Button>
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedApplications.map((app, idx) => {
                  const rowNum = startIndex + idx + 1

                  // Determine stage name, score, and status based on whether a specific stage is filtered
                  const displayStageName =
                    parsedStageIndex !== null
                      ? app.applicationStages[parsedStageIndex]?.stageName || app.currentStageName
                      : app.currentStageName

                  const displayScore =
                    parsedStageIndex !== null
                      ? app.applicationStages[parsedStageIndex]?.totalScore
                      : app.currentStageScore

                  const displayStatus =
                    parsedStageIndex !== null
                      ? app.applicationStages[parsedStageIndex]?.status || app.currentStageStatus
                      : app.currentStageStatus

                  const statusTone = statusToneMap[displayStatus] || "neutral"
                  const statusLabel = statusLabelMap[displayStatus] || displayStatus

                  return (
                    <TableRow
                      key={app.id}
                      className="border-b border-border transition-colors hover:bg-muted/40 cursor-pointer"
                      onClick={() => handleOpenDetail(app)}
                    >
                      {/* Row number */}
                      <TableCell className="pl-5 py-3.5 text-center font-semibold text-muted-foreground tabular-nums text-xs">
                        {rowNum}
                      </TableCell>

                      {/* Candidate Profile (Name, Email, Education) */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm truncate">
                              {app.candidateName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {app.candidateEducation || app.candidateEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Application Code (BatchApplications.CodeApplication) */}
                      <TableCell className="py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-medium text-muted-foreground rounded bg-muted/50 px-2 py-0.5">
                          {app.codeApplication}
                        </span>
                      </TableCell>

                      {/* Stage Name (BatchStage.StageName) */}
                      <TableCell className="py-3.5 whitespace-nowrap text-xs font-medium text-foreground">
                        {displayStageName}
                      </TableCell>

                      {/* Stage Score (ApplicationStage.TotalScore) */}
                      <TableCell className="py-3.5 text-center whitespace-nowrap">
                        {displayScore !== null && displayScore !== undefined ? (
                          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary tabular-nums">
                            {displayScore}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-normal">–</span>
                        )}
                      </TableCell>

                      {/* Status Badge (ApplicationStage.Status / BatchApplications.Status) */}
                      <TableCell className="py-3.5 whitespace-nowrap">
                        <StatusBadge tone={statusTone}>
                          {statusLabel}
                        </StatusBadge>
                      </TableCell>

                      {/* Applied Date (BatchApplications.AppliedAt) */}
                      <TableCell className="hidden md:table-cell py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                        {safeFormatDate(app.appliedAt)}
                      </TableCell>

                      {/* Action */}
                      <TableCell
                        className="pr-5 py-3.5 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleOpenDetail(app)}
                          title="View application details & stages history"
                          className="size-8 rounded-full border-0 bg-muted hover:bg-muted/60 text-foreground cursor-pointer"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalItems={sortedApplications.length}
          onPageChange={setPage}
        />
      </Panel>

      {/* Candidate Application & Stage Journey Detail Dialog */}
      <CandidateApplicationDetailDialog
        application={selectedApplication}
        recruitment={recruitment}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* Add Candidate Manual Dialog (Talent Pool & Direct Register) */}
      <AddCandidateDialog
        recruitment={recruitment}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAddCandidates={handleAddCandidates}
        existingApplicationCount={applications.length}
      />
    </>
  )
}
