import type { Recruitment, InterviewSessionItem } from "../../types"
import { Panel, SearchInput } from "@/shared/components"
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
    sessions,
    filteredSessions,
    pendingReschedules,

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
    sessionToReschedule,
    setSessionToReschedule,
    rescheduleSessionToReview,
    isReviewRescheduleOpen,
    setIsReviewRescheduleOpen,

    // Action handlers
    handleSelectDate,
    handleTogglePendingReschedule,
    handleClearDateFilter,
    handleOpenScheduleNew,
    handleOpenAdjustSchedule,
    handleSaveSession,
    handleOpenReviewReschedule,
    handleApproveReschedule,
    handleRejectReschedule,
  } = useInterviewsTab({
    recruitment,
    onScheduleInterview,
    onReviewReschedule,
  })

  return (
    <Panel className="p-4 sm:p-6 space-y-6 bg-card border-border">
      {/* Top Pending Reschedule Banner Alert (if any) */}
      {pendingReschedules.length > 0 && !isFilterPendingReschedule && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold">
                {pendingReschedules.length} candidate requested a schedule change:
              </span>{" "}
              <span className="text-amber-800 dark:text-amber-300">
                {pendingReschedules[0]?.candidateName} requested reschedule to{" "}
                {pendingReschedules[0]?.rescheduleRequest?.proposedStart.slice(0, 10)}.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePendingReschedule}
              className="shrink-0 rounded-full border-none bg-amber-200/40 text-amber-900 border border-amber-300 px-3 py-1.5 text-xs font-semibold hover:bg-amber-200 transition-colors cursor-pointer"
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
              className="shrink-0 rounded-full bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
            >
              Review Request
            </button>
          </div>
        </div>
      )}

      {/* Top Filter & Action Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
            <SelectTrigger className="h-10 w-44 rounded-full border-0 bg-muted px-4 text-xs font-medium text-foreground hover:bg-muted/70 shadow-none">
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
            <SelectTrigger className="h-10 w-36 rounded-full border-0 bg-muted px-4 text-xs font-medium text-foreground hover:bg-muted/70 shadow-none">
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
            <SelectTrigger className="h-10 w-36 rounded-full border-0 bg-muted px-4 text-xs font-medium text-foreground hover:bg-muted/70 shadow-none">
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
        <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
          <Button
            type="button"
            onClick={handleOpenScheduleNew}
            className="h-10 gap-2 rounded-full border-0 bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-none hover:bg-primary/90 cursor-pointer shrink-0"
          >
            <CalendarPlus className="size-4" />
            <span>Schedule Interview</span>
          </Button>
        </div>
      </div>

      {/* 2-Column Split Layout: Mini Calendar (Left) + Table (Right) */}
      <div className="flex flex-col md:flex-row gap-6 pt-2">
        {/* Left Column: Mini Calendar (fixed sidebar) */}
        <div className="w-full md:w-72 lg:w-80 shrink-0">
          <InterviewMiniCalendar
            sessions={filteredSessions}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            currentDate="2026-03-10"
            isFilterPendingReschedule={isFilterPendingReschedule}
            onTogglePendingReschedule={handleTogglePendingReschedule}
          />
        </div>

        {/* Right Column: Interview Sessions Table with Pagination */}
        <div className="flex-1 min-w-0">
          <InterviewSessionTable
            sessions={filteredSessions}
            selectedDate={selectedDate}
            onClearDateFilter={handleClearDateFilter}
            onViewDetail={onViewSessionDetail}
            onReviewReschedule={handleOpenReviewReschedule}
            onAdjustSchedule={handleOpenAdjustSchedule}
            isFilterPendingReschedule={isFilterPendingReschedule}
          />
        </div>
      </div>

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        open={isScheduleOpen}
        onOpenChange={(open) => {
          setIsScheduleOpen(open)
          if (!open) setSessionToReschedule(null)
        }}
        recruitment={recruitment}
        existingSessions={sessions}
        sessionToReschedule={sessionToReschedule}
        onSchedule={handleSaveSession}
      />

      {/* Review Reschedule Dialog */}
      <ReviewRescheduleDialog
        open={isReviewRescheduleOpen}
        onOpenChange={setIsReviewRescheduleOpen}
        session={rescheduleSessionToReview}
        onApprove={handleApproveReschedule}
        onReject={handleRejectReschedule}
      />
    </Panel>
  )
}
