import * as React from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react"
import type { InterviewSessionItem } from "../../types"
import { formatWibDate, getWibDateKey } from "@/shared/lib/utcDateTime"

export interface InterviewMiniCalendarProps {
  sessions: InterviewSessionItem[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  currentDate?: string // default "2026-03-10"
  isFilterPendingReschedule?: boolean
  onTogglePendingReschedule?: () => void
  className?: string
}

export const InterviewMiniCalendar = React.memo(function InterviewMiniCalendar({
  sessions,
  selectedDate,
  onSelectDate,
  currentDate = getWibDateKey(new Date()),
  isFilterPendingReschedule = false,
  onTogglePendingReschedule,
  className = "",
}: InterviewMiniCalendarProps) {
  const today = React.useMemo(() => parseISO(currentDate), [currentDate])
  const [currentMonth, setCurrentMonth] = React.useState<Date>(today)

  // Map sessions by date string ("YYYY-MM-DD")
  const sessionsByDate = React.useMemo(() => {
    const map = new Map<string, InterviewSessionItem[]>()
    for (const s of sessions) {
      const dateKey = getWibDateKey(s.scheduledStart)
      const list = map.get(dateKey) || []
      list.push(s)
      map.set(dateKey, list)
    }
    return map
  }, [sessions])

  // Aggregate stats
  const totalSessions = sessions.length
  const todaySessionsCount = sessionsByDate.get(currentDate)?.length ?? 0
  const pendingRescheduleCount = React.useMemo(
    () =>
      sessions.filter((s) => s.rescheduleRequest?.status === "pending").length,
    [sessions]
  )

  // Generate days in calendar grid (Monday to Sunday)
  const daysInGrid = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentMonth])

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1))
  const handleGoToToday = () => {
    setCurrentMonth(today)
    onSelectDate(currentDate)
  }

  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h4>
          <p className="text-xs text-muted-foreground">
            {totalSessions} total scheduled session
            {totalSessions !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleGoToToday}
            className="rounded-full px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* "All Dates" Quick Selection Button */}
      <button
        type="button"
        onClick={() => onSelectDate(null)}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
          selectedDate === null && !isFilterPendingReschedule
            ? "bg-primary text-primary-foreground shadow-xs"
            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <span className="flex items-center gap-2">
          <Layers className="size-3.5" />
          <span>View All Dates</span>
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            selectedDate === null && !isFilterPendingReschedule
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {totalSessions}
        </span>
      </button>

      {/* Mini Calendar Month Grid */}
      <div className="space-y-1.5">
        {/* Weekday Labels */}
        <div className="grid grid-cols-7 text-center">
          {weekdays.map((day) => (
            <span
              key={day}
              className="py-1 text-[11px] font-medium text-muted-foreground/80"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-x-0.5 gap-y-1">
          {daysInGrid.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const daySessions = sessionsByDate.get(dateKey) || []
            const hasSessions = daySessions.length > 0
            const hasPendingReschedule = daySessions.some(
              (s) => s.rescheduleRequest?.status === "pending"
            )
            const isSelected =
              selectedDate === dateKey && !isFilterPendingReschedule
            const isCurrentToday = isSameDay(day, today)
            const isCurrentMonth = isSameMonth(day, currentMonth)

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate(dateKey)}
                className={`relative flex h-8 flex-col items-center justify-center rounded-lg text-xs transition-all ${
                  isSelected
                    ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                    : isCurrentToday
                      ? "border border-primary font-semibold text-primary hover:bg-primary/5"
                      : isCurrentMonth
                        ? "font-normal text-foreground hover:bg-muted"
                        : "text-muted-foreground/35 hover:bg-muted/40"
                }`}
              >
                <span>{format(day, "d")}</span>

                {/* Session Indicator Dot */}
                {hasSessions && (
                  <span
                    className={`absolute bottom-0.75 size-1.25 rounded-full ${
                      hasPendingReschedule
                        ? "bg-amber-500 ring-1 ring-background"
                        : isSelected
                          ? "bg-primary-foreground"
                          : "bg-primary"
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Summary Cards & Reschedule Action Alert */}
      <div className="space-y-2 border-t border-border pt-2">
        {/* Today's shortcut */}
        <button
          type="button"
          onClick={() => onSelectDate(currentDate)}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
            selectedDate === currentDate && !isFilterPendingReschedule
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-muted/60"
          }`}
        >
          <span className="flex items-center gap-2">
            <Clock className="size-3.5 text-primary" />
            <span>Today ({formatWibDate(currentDate, { year: undefined })})</span>
          </span>
          <span className="font-semibold text-foreground">
            {todaySessionsCount} session{todaySessionsCount !== 1 ? "s" : ""}
          </span>
        </button>

        {/* Pending Reschedule Alert Filter */}
        {pendingRescheduleCount > 0 && (
          <button
            type="button"
            onClick={onTogglePendingReschedule}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all ${
              isFilterPendingReschedule
                ? "bg-amber-500 font-medium text-white shadow-xs"
                : "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle
                className={`size-3.5 ${isFilterPendingReschedule ? "text-white" : "text-amber-600 dark:text-amber-400"}`}
              />
              <span className="font-medium">Reschedule Request</span>
            </span>
            <span
              className={`py-0.2 rounded-full px-2 text-[11px] font-bold ${
                isFilterPendingReschedule
                  ? "bg-white text-amber-600"
                  : "bg-amber-200/80 text-amber-950 dark:bg-amber-900 dark:text-amber-100"
              }`}
            >
              {pendingRescheduleCount} pending
            </span>
          </button>
        )}
      </div>
    </div>
  )
})
