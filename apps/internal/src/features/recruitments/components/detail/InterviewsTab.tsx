import * as React from "react"
import type { Recruitment, InterviewSessionItem } from "../../types"
import { Panel, SearchInput } from "@/shared/components"
import { mockInterviewSessions, getRecruitmentInterviewSessions } from "../../data/interviewMock"
import { InterviewMiniCalendar } from "./InterviewMiniCalendar"
import { InterviewSessionTable } from "./InterviewSessionTable"
import { ScheduleInterviewDialog } from "./ScheduleInterviewDialog"
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
  // Load recruitment sessions (with fallback to mock sessions)
  const initialSessions = React.useMemo(() => {
    const list = getRecruitmentInterviewSessions(recruitment.id)
    return list.length > 0 ? list : mockInterviewSessions
  }, [recruitment.id])

  const [sessions, setSessions] = React.useState<InterviewSessionItem[]>(initialSessions)

  // Keep state updated if initialSessions change
  React.useEffect(() => {
    setSessions(initialSessions)
  }, [initialSessions])

  // Filter States
  const [search, setSearch] = React.useState("")
  const [stageFilter, setStageFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [modeFilter, setModeFilter] = React.useState<string>("all")
  const [selectedDate, setSelectedDate] = React.useState<string | null>("2026-03-10")
  const [isFilterPendingReschedule, setIsFilterPendingReschedule] = React.useState<boolean>(false)
  const [isScheduleOpen, setIsScheduleOpen] = React.useState<boolean>(false)

  const handleAddNewSession = (newSession: InterviewSessionItem) => {
    setSessions((prev) => [newSession, ...prev])
    setSelectedDate(newSession.scheduledStart.slice(0, 10))
    setIsFilterPendingReschedule(false)
  }

  // Count pending reschedule requests
  const pendingReschedules = React.useMemo(
    () => sessions.filter((s) => s.rescheduleRequest?.status === "pending"),
    [sessions]
  )

  // Available interview stages in this batch
  const interviewStages = React.useMemo(() => {
    return (recruitment.stages || []).filter(
      (stg) =>
        stg.type === "interview" ||
        stg.name.toLowerCase().includes("interview") ||
        stg.name.toLowerCase().includes("hr") ||
        stg.name.toLowerCase().includes("user")
    )
  }, [recruitment.stages])

  // Filter items matching RecruitmentsListPage pattern for @base-ui/react select
  const stageFilterItems = React.useMemo(() => {
    return [
      { label: "All Stages", value: "all" },
      ...interviewStages.map((stg) => ({
        label: stg.name,
        value: stg.id,
      })),
    ]
  }, [interviewStages])

  const statusFilterItems = React.useMemo(() => {
    return [
      { label: "All Status", value: "all" },
      { label: "Scheduled", value: "scheduled" },
      { label: "Completed", value: "completed" },
      { label: "Rescheduled", value: "rescheduled" },
      { label: "Cancelled", value: "cancelled" },
    ]
  }, [])

  const modeFilterItems = React.useMemo(() => {
    return [
      { label: "All Modes", value: "all" },
      { label: "Online Only", value: "online" },
      { label: "Onsite Only", value: "onsite" },
    ]
  }, [])

  // Apply search and dropdown filters
  const filteredSessions = React.useMemo(() => {
    let result = [...sessions]

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.candidateName.toLowerCase().includes(q) ||
          s.candidateEmail.toLowerCase().includes(q) ||
          s.codeApplication.toLowerCase().includes(q) ||
          s.sessionName.toLowerCase().includes(q) ||
          (s.location && s.location.toLowerCase().includes(q))
      )
    }

    // Stage filter
    if (stageFilter !== "all") {
      result = result.filter((s) => s.stageId === stageFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter)
    }

    // Mode filter
    if (modeFilter === "online") {
      result = result.filter((s) => s.isOnline)
    } else if (modeFilter === "onsite") {
      result = result.filter((s) => !s.isOnline)
    }

    return result
  }, [sessions, search, stageFilter, statusFilter, modeFilter])

  // Handlers for mini calendar date selection
  const handleSelectDate = (date: string | null) => {
    setSelectedDate(date)
    setIsFilterPendingReschedule(false)
  }

  const handleTogglePendingReschedule = () => {
    setIsFilterPendingReschedule((prev) => !prev)
    if (!isFilterPendingReschedule) {
      setSelectedDate(null)
    }
  }

  const handleClearDateFilter = () => {
    setSelectedDate(null)
    setIsFilterPendingReschedule(false)
  }

  return (
    <Panel className="p-4 sm:p-6 space-y-6 bg-card border-border">
      {/* Top Pending Reschedule Banner Alert (if any) */}
      {pendingReschedules.length > 0 && !isFilterPendingReschedule && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-200">
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
          <button
            type="button"
            onClick={handleTogglePendingReschedule}
            className="shrink-0 rounded-full bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Review Request
          </button>
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
            onClick={() => {
              setIsScheduleOpen(true)
              onScheduleInterview?.()
            }}
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
            onReviewReschedule={onReviewReschedule}
            isFilterPendingReschedule={isFilterPendingReschedule}
          />
        </div>
      </div>

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        recruitment={recruitment}
        existingSessions={sessions}
        onSchedule={handleAddNewSession}
      />
    </Panel>
  )
}
