import type { Recruitment, InterviewSessionItem } from "../../types"
import { Panel, SearchInput, ErrorState } from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import { InterviewMiniCalendar } from "./InterviewMiniCalendar"
import { InterviewSessionTable } from "./InterviewSessionTable"
import { ScheduleInterviewDialog } from "./ScheduleInterviewDialog"
import { ReviewRescheduleDialog } from "./ReviewRescheduleDialog"
import { useInterviewsTab } from "../../hooks"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
import { CalendarPlus, AlertTriangle } from "lucide-react"
import { formatWibDate, formatWibTime } from "@/shared/lib/utcDateTime"

export interface InterviewsTabProps {
  recruitment: Recruitment
  onScheduleInterview?: () => void
  onViewSessionDetail?: (session: InterviewSessionItem) => void
  onReviewReschedule?: (session: InterviewSessionItem) => void
}

export function InterviewsTab({
  recruitment,
  onScheduleInterview,
  onViewSessionDetail,
  onReviewReschedule,
}: InterviewsTabProps) {
  const {
    canScheduleInterview,
    scheduleRestriction,
    sessions,
    filteredSessions,
    pendingReschedules,
    isLoading,
    isError,
    apiError,
    refetch,

    // Filter states & options
    search,
    setSearch,
    stageFilter,
    setStageFilter,
    stageFilterItems,
    statusFilter,
    setStatusFilter,
    statusFilterItems,
    modeFilter,
    setModeFilter,
    modeFilterItems,
    selectedDate,
    isFilterPendingReschedule,

    // Dialog states
    isScheduleOpen,
    setIsScheduleOpen,
    rescheduleSessionToReview,
    isReviewRescheduleOpen,
    setIsReviewRescheduleOpen,

    // Action handlers
    handleSelectDate,
    handleTogglePendingReschedule,
    handleClearDateFilter,
    handleOpenScheduleNew,
    handleSaveSession,
    isSchedulingInterview,
    handleOpenReviewReschedule,
    handleApproveReschedule,
    handleRejectReschedule,
  } = useInterviewsTab({
    recruitment,
    onScheduleInterview,
    onReviewReschedule,
  })

  return (
    <Panel className="space-y-0">
      {/* Top Pending Reschedule Banner Alert (if any) */}
      {pendingReschedules.length > 0 && !isFilterPendingReschedule && (
        <div className="flex flex-col items-start justify-between gap-3 border-b border-border bg-amber-50 px-5 py-3 text-xs text-amber-950 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold">
                {pendingReschedules.length} candidate requested a schedule
                change:
              </span>{" "}
              <span className="text-amber-800 dark:text-amber-300">
                {pendingReschedules[0]?.candidateName} requested reschedule to{" "}
                {pendingReschedules[0]?.rescheduleRequest &&
                  `${formatWibDate(pendingReschedules[0].rescheduleRequest.proposedStart)} at ${formatWibTime(pendingReschedules[0].rescheduleRequest.proposedStart)} WIB`}
                .
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePendingReschedule}
              className="shrink-0 cursor-pointer rounded-full border border-none border-amber-300 bg-amber-200/40 px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-200"
            >
              Filter in Table
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingReschedules[0]) {
                  handleOpenReviewReschedule(pendingReschedules[0])
                }
              }}
              className="shrink-0 cursor-pointer rounded-full bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-amber-700"
            >
              Review Request
            </button>
          </div>
        </div>
      )}

      {/* Top Filter & Action Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search candidate, code, or interview title..."
            containerClassName="w-full sm:w-84"
          />

          {/* Stage Dropdown Filter */}
          <Select
            items={stageFilterItems}
            value={stageFilter}
            onValueChange={(val) => setStageFilter(val ?? "all")}
          >
            <SelectTrigger className="h-10 w-44 rounded-full border-0 bg-muted px-4 text-xs font-medium text-foreground shadow-none hover:bg-muted/70">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectGroup>
                {stageFilterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Status Dropdown Filter */}
          <Select
            items={statusFilterItems}
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "all")}
          >
            <SelectTrigger className="h-10 w-36 rounded-full border-0 bg-muted px-4 text-xs font-medium text-foreground shadow-none hover:bg-muted/70">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectGroup>
                {statusFilterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Mode Dropdown Filter */}
          <Select
            items={modeFilterItems}
            value={modeFilter}
            onValueChange={(val) => setModeFilter(val ?? "all")}
          >
            <SelectTrigger className="h-10 w-36 rounded-full border-0 bg-muted px-4 text-xs font-medium text-foreground shadow-none hover:bg-muted/70">
              <SelectValue placeholder="All Modes" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectGroup>
                {modeFilterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Schedule Interview Button */}
        <div className="flex shrink-0 items-center gap-2 self-start lg:self-center">
          <Button
            type="button"
            onClick={handleOpenScheduleNew}
            disabled={!canScheduleInterview}
            title={scheduleRestriction ?? "Schedule Interview"}
            className="h-10 shrink-0 cursor-pointer gap-2 rounded-full border-0 bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-none hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
          >
            <CalendarPlus className="size-4" />
            <span>Schedule Interview</span>
          </Button>
        </div>
      </div>

      {scheduleRestriction && (
        <div className="flex items-center gap-2.5 border-b border-border bg-amber-500/10 px-5 py-3 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          <p>{scheduleRestriction}</p>
        </div>
      )}

      {/* 2-Column Split Layout: Mini Calendar (Left) + Table (Right) */}
      {isLoading ? (
        <div role="status" className="p-6 text-sm text-muted-foreground">
          Loading interview sessions...
        </div>
      ) : isError ? (
        <ErrorState
          title={
            getApiError(apiError).kind === "forbidden"
              ? "Access denied"
              : "Failed to load interviews"
          }
          description={
            getApiError(
              apiError,
              "Unable to load interview sessions. Please try again."
            ).message
          }
          onRetry={
            getApiError(apiError).kind === "forbidden"
              ? undefined
              : () => refetch()
          }
        />
      ) : (
        <div className="flex flex-col gap-6 p-5 md:flex-row">
          {/* Left Column: Mini Calendar (fixed sidebar) */}
          <div className="w-full shrink-0 md:w-72 lg:w-80">
            <InterviewMiniCalendar
              sessions={filteredSessions}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              isFilterPendingReschedule={isFilterPendingReschedule}
              onTogglePendingReschedule={handleTogglePendingReschedule}
            />
          </div>

          {/* Right Column: Interview Sessions Table with Pagination */}
          <div className="min-w-0 flex-1">
            <InterviewSessionTable
              sessions={filteredSessions}
              selectedDate={selectedDate}
              onClearDateFilter={handleClearDateFilter}
              onViewDetail={onViewSessionDetail}
              onReviewReschedule={handleOpenReviewReschedule}
              isFilterPendingReschedule={isFilterPendingReschedule}
            />
          </div>
        </div>
      )}

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        open={
          isScheduleOpen &&
          canScheduleInterview
        }
        onOpenChange={setIsScheduleOpen}
        recruitment={recruitment}
        existingSessions={sessions}
        onSchedule={handleSaveSession}
        isScheduling={isSchedulingInterview}
      />

      {/* Review Reschedule Dialog */}
      <ReviewRescheduleDialog
        key={rescheduleSessionToReview?.rescheduleRequest?.id ?? "no-request"}
        open={isReviewRescheduleOpen}
        onOpenChange={setIsReviewRescheduleOpen}
        session={rescheduleSessionToReview}
        onApprove={handleApproveReschedule}
        onReject={handleRejectReschedule}
      />
    </Panel>
  )
}
