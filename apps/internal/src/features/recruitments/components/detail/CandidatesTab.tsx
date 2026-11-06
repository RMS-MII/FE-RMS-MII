import { useNavigate } from "@tanstack/react-router"
import { cn } from "@/shared/lib/utils"
import {
  Panel,
  SearchInput,
  StatusBadge,
  EmptyState,
  FilterChips,
  TableSortHeader,
  DataTablePagination,
  TableSkeleton,
  ErrorState,
} from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
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
import { Eye, UserPlus, AlertCircle } from "lucide-react"
import {
  useCandidatesTab,
  statusToneMap,
  statusLabelMap,
  type UseCandidatesTabProps,
} from "../../hooks/useCandidatesTab"

export interface CandidatesTabProps extends UseCandidatesTabProps {}

export function CandidatesTab({
  recruitment,
  selectedStageIndex = null,
  onStageChange,
}: CandidatesTabProps) {
  const navigate = useNavigate()

  const {
    search,
    setSearch,
    stageFilter,
    statusFilter,
    sortKey,
    sortDirection,
    page,
    pageSize,
    hasStages,
    isApiLoading,
    isApiError,
    refetchApplications,
    selectedApplication,
    isDetailOpen,
    setIsDetailOpen,
    isAddOpen,
    setIsAddOpen,
    stageItems,
    statusItems,
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
    handleUpdateCandidateStatus,
  } = useCandidatesTab({
    recruitment,
    selectedStageIndex,
    onStageChange,
  })

  const parsedStageIndex = stageFilter !== "all" ? Number(stageFilter) : null

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
                handlePageChange(1)
              }}
              placeholder="Search candidate, email, or application code..."
              containerClassName="sm:w-80"
            />

            {/* Stage Filter */}
            <Select
              items={stageItems}
              value={stageFilter}
              onValueChange={handleStageChange}
            >
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
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-center shrink-0">
            <Button
              type="button"
              onClick={() => hasStages && setIsAddOpen(true)}
              disabled={!hasStages}
              title={
                !hasStages
                  ? "Configure selection stages first before adding candidates"
                  : "Add candidate"
              }
              className={cn(
                "h-10 gap-1.5 rounded-full border-0 px-4 text-sm font-medium shadow-none shrink-0 transition-all",
                hasStages
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed hover:bg-muted"
              )}
            >
              <UserPlus className="size-4" aria-hidden />
              <span>Add candidate</span>
            </Button>
          </div>
        </div>

        {/* Warning Banner when recruitment batch has no stages yet */}
        {!hasStages && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border bg-amber-500/10 px-5 py-3 text-xs text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p>
                <strong className="font-semibold">Selection stages required:</strong> Candidates can only be added once this recruitment batch has configured selection stages.
              </p>
            </div>
          </div>
        )}

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
                  className="text-center"
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

                <TableHead className="w-14 pr-5 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isApiLoading ? (
                <TableSkeleton colCount={8} rowCount={pageSize} />
              ) : isApiError ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-8">
                    <ErrorState
                      title="Failed to load candidates"
                      description="Unable to fetch candidates from server. Please check your connection."
                      onRetry={() => refetchApplications()}
                    />
                  </TableCell>
                </TableRow>
              ) : currentApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-8">
                    {!hasStages ? (
                      <EmptyState
                        title="Selection stages required"
                        description="This recruitment batch does not have selection stages yet. Please configure the stages first to begin adding candidates."
                        action={
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              navigate({
                                to: "/recruitments/$id/stages",
                                params: { id: recruitment.id },
                              })
                            }
                            className="rounded-full border-0 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                          >
                            Configure Stages
                          </Button>
                        }
                      />
                    ) : (
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
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                currentApplications.map((app, idx) => {
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
        <DataTablePagination className="border-t border-border px-5 py-4"
          page={page}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageChange={handlePageChange}
        />
      </Panel>

      {/* Candidate Application & Stage Journey Detail Dialog */}
      <CandidateApplicationDetailDialog
        application={selectedApplication}
        recruitment={recruitment}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdateStatus={handleUpdateCandidateStatus}
      />

      {/* Add Candidate Manual Dialog (Talent Pool & Direct Register) */}
      <AddCandidateDialog
        recruitment={recruitment}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAddCandidates={handleAddCandidates}
        existingApplicationCount={totalCount}
      />
    </>
  )
}
