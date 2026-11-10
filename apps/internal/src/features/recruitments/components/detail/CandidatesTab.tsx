import { Link, useNavigate } from "@tanstack/react-router"
import { cn } from "@/shared/lib/utils"
import { getApiError } from "@/shared/api/api-error"
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
import { getRecruitmentAddRestriction } from "../../utils/recruitmentUtils"
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

export type CandidatesTabProps = UseCandidatesTabProps

export function CandidatesTab({ recruitment }: CandidatesTabProps) {
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
    apiError,
    refetchApplications,
    detailSearch,
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
  } = useCandidatesTab({
    recruitment,
  })

  const parsedStageIndex = stageFilter !== "all" ? Number(stageFilter) : null
  const addRestriction = getRecruitmentAddRestriction(recruitment, "candidate")
  const canAddCandidates = !addRestriction

  const handleAddDialogOpenChange = (open: boolean) => {
    if (!open || canAddCandidates) setIsAddOpen(open)
  }

  return (
    <>
      <Panel className="space-y-0">
        {/* Top Search & Filter Bar (Matching Recruitments & Candidates List layout) */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search candidate, email, or application code..."
              containerClassName="sm:w-80"
            />

            {/* Stage Filter */}
            <Select
              items={stageItems}
              value={stageFilter}
              onValueChange={handleStageChange}
            >
              <SelectTrigger className="h-10 w-48 rounded-full border-0 bg-muted px-4 text-sm text-foreground shadow-none transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary">
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
              <SelectTrigger className="h-10 w-40 rounded-full border-0 bg-muted px-4 text-sm text-foreground shadow-none transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary">
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

          <div className="flex shrink-0 flex-wrap items-center gap-3 self-start sm:self-center">
            <Button
              type="button"
              onClick={() => handleAddDialogOpenChange(true)}
              disabled={!canAddCandidates}
              title={addRestriction ?? "Add candidate"}
              className={cn(
                "h-10 shrink-0 gap-1.5 rounded-full border-0 px-4 text-sm font-medium shadow-none transition-all",
                canAddCandidates
                  ? "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary"
                  : "cursor-not-allowed bg-muted text-muted-foreground opacity-60 hover:bg-muted"
              )}
            >
              <UserPlus className="size-4" aria-hidden />
              <span>Add candidate</span>
            </Button>
          </div>
        </div>

        {/* Explain the requirements for adding candidates. */}
        {addRestriction && (
          <div className="flex flex-col gap-3 border-b border-border bg-amber-500/10 px-5 py-3 text-xs text-amber-700 sm:flex-row sm:items-center sm:justify-between dark:text-amber-400">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p>{addRestriction}</p>
            </div>
          </div>
        )}

        {/* Removable Active Filter Chips */}
        <div className="border-b border-border bg-muted/20 px-6 py-2.5">
          <FilterChips chips={activeChips} onReset={handleResetFilters} />
        </div>

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
                  label={
                    parsedStageIndex !== null
                      ? "Selected Stage"
                      : "Current Stage"
                  }
                  sortKey="stage"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
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
                <TableSkeleton colCount={7} rowCount={pageSize} />
              ) : isApiError ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-8">
                    <ErrorState
                      title={
                        getApiError(apiError).kind === "forbidden"
                          ? "Access denied"
                          : "Failed to load candidates"
                      }
                      description={
                        getApiError(
                          apiError,
                          "Unable to load candidates. Please try again."
                        ).message
                      }
                      onRetry={
                        getApiError(apiError).kind === "forbidden"
                          ? undefined
                          : () => refetchApplications()
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : currentApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-8">
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
                            className="cursor-pointer rounded-full border-0 bg-primary text-primary-foreground hover:bg-primary/90"
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
                              className="cursor-pointer rounded-full border-0 bg-muted/60 text-foreground hover:bg-muted"
                            >
                              Reset filters
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddDialogOpenChange(true)}
                              disabled={!canAddCandidates}
                              title={
                                addRestriction ?? "Add your first candidate"
                              }
                              className="cursor-pointer rounded-full border-0 bg-muted/60 text-foreground hover:bg-muted"
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

                  // Determine stage name and status based on whether a specific stage is filtered
                  const displayStageName =
                    parsedStageIndex !== null
                      ? app.applicationStages[parsedStageIndex]?.stageName ||
                        app.currentStageName
                      : app.currentStageName

                  const currentBatchStage = recruitment.batchStages?.find(
                    (stage) => stage.id === app.applicationStages[app.currentStageIndex]?.batchStageId
                  )
                  const isUnpublishedDecision =
                    (parsedStageIndex === null || parsedStageIndex === app.currentStageIndex) &&
                    (currentBatchStage?.lifecycleStatus === "Active" ||
                      currentBatchStage?.lifecycleStatus === 1) &&
                    ["prioritized", "considered", "rejected", "dropped"].includes(
                      app.currentStageStatus
                    )
                  const displayStatus =
                    parsedStageIndex !== null
                      ? app.applicationStages[parsedStageIndex]?.status ||
                        app.currentStageStatus
                      : app.status === "in_progress" &&
                          (app.currentStageStatus === "submitted" || isUnpublishedDecision)
                        ? app.currentStageStatus
                        : app.status
                  const statusTone = statusToneMap[displayStatus] || "neutral"
                  const statusLabel = statusLabelMap[displayStatus] || displayStatus

                  return (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer border-b border-border transition-colors hover:bg-muted/40"
                      onClick={() => handleOpenDetail(app)}
                    >
                      {/* Row number */}
                      <TableCell className="py-3.5 pl-5 text-center text-xs font-semibold text-muted-foreground tabular-nums">
                        {rowNum}
                      </TableCell>

                      {/* Candidate Profile (Name, Email, Education) */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <Link
                              to="/recruitments/$id/applications/$applicationId"
                              params={{
                                id: recruitment.id,
                                applicationId: app.id,
                              }}
                              search={detailSearch}
                              onClick={(event) => event.stopPropagation()}
                              className="block truncate text-sm font-semibold text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                            >
                              {app.candidateName}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">
                              {app.candidateEducation || app.candidateEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Application Code (BatchApplications.CodeApplication) */}
                      <TableCell className="py-3.5 whitespace-nowrap">
                        <span className="rounded bg-muted/50 px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                          {app.codeApplication}
                        </span>
                      </TableCell>

                      {/* Stage Name (BatchStage.StageName) */}
                      <TableCell className="py-3.5 text-xs font-medium whitespace-nowrap text-foreground">
                        {displayStageName}
                      </TableCell>

                      {/* Status Badge (ApplicationStage.Status / BatchApplications.Status) */}
                      <TableCell className="py-3.5 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
                          {parsedStageIndex === null && displayStatus === "submitted" && (
                            <span className="text-xs text-muted-foreground">
                              Application: In Progress
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Applied Date (BatchApplications.AppliedAt) */}
                      <TableCell className="hidden py-3.5 text-xs whitespace-nowrap text-muted-foreground md:table-cell">
                        {safeFormatDate(app.appliedAt)}
                      </TableCell>

                      {/* Action */}
                      <TableCell
                        className="py-3.5 pr-5 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          nativeButton={false}
                          render={
                            <Link
                              to="/recruitments/$id/applications/$applicationId"
                              params={{
                                id: recruitment.id,
                                applicationId: app.id,
                              }}
                              search={detailSearch}
                            />
                          }
                          variant="ghost"
                          size="icon-xs"
                          aria-label={
                            "View application for " + app.candidateName
                          }
                          title="View application details & stages history"
                          className="size-8 cursor-pointer rounded-full border-0 bg-muted text-foreground hover:bg-muted/60"
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
          className="border-t border-border px-5 py-4"
          page={page}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageChange={handlePageChange}
        />
      </Panel>

      {/* Add Candidate Manual Dialog (Talent Pool & Direct Register) */}
      <AddCandidateDialog
        recruitment={recruitment}
        open={isAddOpen && canAddCandidates}
        onOpenChange={handleAddDialogOpenChange}
        onAddCandidates={handleAddCandidates}
        existingApplicationCount={totalCount}
      />
    </>
  )
}
