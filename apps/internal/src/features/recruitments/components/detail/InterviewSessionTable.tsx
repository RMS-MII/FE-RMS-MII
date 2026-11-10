import * as React from "react"
import {
  CalendarX,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Calendar as CalendarIcon,
} from "lucide-react"
import type { InterviewSessionItem } from "../../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  DataTablePagination,
  StatusBadge,
  type Tone,
} from "@/shared/components"
import { cn } from "@/shared/lib/utils"
import { formatWibDate, formatWibTime, getWibDateKey, parseUtcDateTime } from "@/shared/lib/utcDateTime"

const interviewerStatusColors: Record<string, string> = {
  pending: "bg-warning-soft text-warning",
  assigned: "bg-warning-soft text-warning",
  accepted: "bg-success-soft text-success",
  declined: "bg-danger-soft text-danger",
  in_progress: "bg-info-soft text-info",
  completed: "bg-success-soft text-success",
  cancelled: "bg-neutral-soft text-neutral",
  unknown: "bg-neutral-soft text-neutral",
}

const interviewerStatusLabels: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  accepted: "Accepted",
  declined: "Declined",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  unknown: "Unknown",
}

const sessionStatusLabels: Record<string, { label: string; tone: Tone }> = {
  scheduled: { label: "Scheduled", tone: "info" },
  pending_confirmation: { label: "Pending Confirmation", tone: "warning" },
  rescheduled: { label: "Rescheduled", tone: "warning" },
  accepted_by_interviewer: {
    label: "Accepted by Interviewer",
    tone: "success",
  },
  accepted_by_candidate: { label: "Accepted by Candidate", tone: "success" },
  in_progress: { label: "In Progress", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  unknown: { label: "Unknown", tone: "neutral" },
}

export interface InterviewSessionTableProps {
  sessions: InterviewSessionItem[]
  selectedDate: string | null
  onClearDateFilter?: () => void
  onViewDetail?: (session: InterviewSessionItem) => void
  onReviewReschedule?: (session: InterviewSessionItem) => void
  onAdjustSchedule?: (session: InterviewSessionItem) => void
  isFilterPendingReschedule?: boolean
  className?: string
}

export function InterviewSessionTable({
  sessions,
  selectedDate,
  onClearDateFilter,
  onReviewReschedule,
  onAdjustSchedule,
  isFilterPendingReschedule = false,
  className = "",
}: InterviewSessionTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [pagination, setPagination] = React.useState({ key: "", page: 1 })
  const pageSize = 6
  const filterKey = `${selectedDate ?? "all"}:${isFilterPendingReschedule}:${sessions.length}`

  // Filter sessions based on selected date or pending reschedule flag
  const filteredSessions = React.useMemo(() => {
    let result = [...sessions]

    if (isFilterPendingReschedule) {
      result = result.filter((s) => s.rescheduleRequest?.status === "pending")
    } else if (selectedDate) {
      result = result.filter(
        (s) => getWibDateKey(s.scheduledStart) === selectedDate
      )
    }

    // Sort by scheduledStart ascending
    return result.sort(
      (a, b) =>
        parseUtcDateTime(a.scheduledStart).getTime() -
        parseUtcDateTime(b.scheduledStart).getTime()
    )
  }, [sessions, selectedDate, isFilterPendingReschedule])

  const page =
    pagination.key === filterKey
      ? Math.min(
          pagination.page,
          Math.max(1, Math.ceil(filteredSessions.length / pageSize))
        )
      : 1
  const setPage = (nextPage: number) =>
    setPagination({ key: filterKey, page: nextPage })

  // Pagination slice
  const paginatedSessions = React.useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredSessions.slice(start, start + pageSize)
  }, [filteredSessions, page, pageSize])

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Header summary text
  const headerInfo = React.useMemo(() => {
    if (isFilterPendingReschedule) {
      return {
        title: "Pending Reschedule Requests",
        subtitle: `${filteredSessions.length} candidate${filteredSessions.length !== 1 ? "s" : ""} requesting schedule adjustments`,
      }
    }

    if (selectedDate) {
      try {
        return {
          title: formatWibDate(selectedDate, { weekday: "long", month: "long" }),
          subtitle: `${filteredSessions.length} interview session${filteredSessions.length !== 1 ? "s" : ""} scheduled`,
        }
      } catch {
        return {
          title: `Date: ${selectedDate}`,
          subtitle: `${filteredSessions.length} interview sessions`,
        }
      }
    }

    return {
      title: "All Scheduled Interview Sessions",
      subtitle: `${filteredSessions.length} sessions across all dates`,
    }
  }, [selectedDate, isFilterPendingReschedule, filteredSessions.length])

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Table Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            {isFilterPendingReschedule ? (
              <AlertTriangle className="size-4 text-amber-500" />
            ) : (
              <CalendarIcon className="size-4 text-primary" />
            )}
            <h3 className="text-base font-semibold text-foreground">
              {headerInfo.title}
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {headerInfo.subtitle}
          </p>
        </div>

        {(selectedDate || isFilterPendingReschedule) && onClearDateFilter && (
          <button
            type="button"
            onClick={onClearDateFilter}
            className="cursor-pointer text-xs font-medium text-primary hover:underline"
          >
            Show All Dates
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-4 text-center">#</TableHead>
                <TableHead className="min-w-44">Candidate</TableHead>
                <TableHead className="min-w-32">Stage</TableHead>
                <TableHead className="min-w-36">Schedule</TableHead>
                <TableHead className="min-w-40">Interviewers</TableHead>
                <TableHead className="min-w-44">Mode</TableHead>
                <TableHead className="min-w-28 text-center">Status</TableHead>
                <TableHead className="w-20 pr-4 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <CalendarX className="mb-2 size-10 text-muted-foreground/60" />
                      <h4 className="text-sm font-semibold text-foreground">
                        {isFilterPendingReschedule
                          ? "No Pending Reschedule Requests"
                          : "No Interview Sessions Scheduled"}
                      </h4>
                      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                        {isFilterPendingReschedule
                          ? "All candidate reschedule requests have been reviewed."
                          : selectedDate
                            ? "There are no interview sessions scheduled for this specific date."
                            : "No interview sessions found matching your criteria."}
                      </p>
                      {(selectedDate || isFilterPendingReschedule) &&
                        onClearDateFilter && (
                          <button
                            type="button"
                            onClick={onClearDateFilter}
                            className="mt-3.5 cursor-pointer rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                          >
                            View All Dates
                          </button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSessions.map((session, idx) => {
                  const itemIndex = (page - 1) * pageSize + idx + 1
                  const isPendingReschedule =
                    session.rescheduleRequest?.status === "pending"

                  // Safe time format
                  let dateFormatted: string
                  let timeFormatted: string
                  try {
                    dateFormatted = formatWibDate(session.scheduledStart)
                    timeFormatted = `${formatWibTime(session.scheduledStart)} – ${formatWibTime(session.scheduledEnd)} WIB`
                  } catch {
                    dateFormatted = session.scheduledStart
                    timeFormatted = "Time TBA"
                  }

                  return (
                    <TableRow
                      key={session.id}
                      className="border-b border-border/60 transition-colors hover:bg-muted/30"
                    >
                      {/* Row Index */}
                      <TableCell className="pl-4 text-center font-mono text-xs text-muted-foreground">
                        {itemIndex}
                      </TableCell>

                      {/* Candidate Column */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {session.candidateName}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {session.candidateEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Stage */}
                      <TableCell className="py-3">
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {session.stageName}
                        </span>
                      </TableCell>

                      {/* Date & Time */}
                      <TableCell className="py-3 text-xs whitespace-nowrap">
                        <p className="font-semibold text-foreground">
                          {dateFormatted}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-3 shrink-0 text-muted-foreground" />
                          <span>{timeFormatted}</span>
                        </div>
                      </TableCell>

                      {/* Assigned Interviewers with Approval Status Badge */}
                      <TableCell className="py-3 text-xs">
                        {session.interviewers.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {session.interviewers.map((inv) => {
                              const statusStyle =
                                interviewerStatusColors[inv.status] ||
                                "bg-muted text-muted-foreground border border-border"
                              const statusDesc =
                                interviewerStatusLabels[inv.status] ||
                                inv.status

                              return (
                                <span
                                  key={inv.id}
                                  title={`${inv.employeeName} • ${statusDesc}`}
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
                                    statusStyle
                                  )}
                                >
                                  {inv.employeeName}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </TableCell>

                      {/* Mode & Logistics */}
                      <TableCell className="py-3 text-xs">
                        <div className="space-y-1.5">
                          {session.isOnline ? (
                            <div className="flex flex-col items-start gap-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                                <Video className="size-3 text-cyan-600" />
                                Online
                              </span>
                              {session.meetingUrl && (
                                <div className="flex items-center gap-1">
                                  <a
                                    href={session.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                                  >
                                    <span>Join Link</span>
                                    <ExternalLink className="size-2.5" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyLink(
                                        session.meetingUrl!,
                                        session.id
                                      )
                                    }
                                    title="Copy meeting link"
                                    className="cursor-pointer p-0.5 text-muted-foreground hover:text-foreground"
                                  >
                                    {copiedId === session.id ? (
                                      <Check className="size-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="size-3" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                                <MapPin className="size-3 text-indigo-600" />
                                Onsite
                              </span>
                              <p
                                className="mt-0.5 max-w-44 truncate text-[11px] text-muted-foreground"
                                title={
                                  session.location || "Office Meeting Room"
                                }
                              >
                                {session.location || "Office Meeting Room"}
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <StatusBadge
                            tone={
                              sessionStatusLabels[session.status]?.tone ??
                              "neutral"
                            }
                          >
                            {sessionStatusLabels[session.status]?.label ??
                              "Unknown"}
                          </StatusBadge>

                          {/* Reschedule Request Notice Badge */}
                          {isPendingReschedule && (
                            <button
                              type="button"
                              onClick={() => onReviewReschedule?.(session)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 transition-colors hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300"
                            >
                              <AlertTriangle className="size-2.5 text-amber-600" />
                              Reschedule Req.
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* Action Column */}
                      <TableCell className="py-3 pr-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {isPendingReschedule && onReviewReschedule ? (
                            <button
                              type="button"
                              onClick={() => onReviewReschedule(session)}
                              className="cursor-pointer rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-amber-700"
                            >
                              Review Reschedule
                            </button>
                          ) : (session.status === "rescheduled" ||
                              session.rescheduleRequest?.status ===
                                "approved") &&
                            onAdjustSchedule ? (
                            <button
                              type="button"
                              onClick={() => onAdjustSchedule(session)}
                              className="cursor-pointer rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                            >
                              Adjust Schedule
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground/60">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredSessions.length > pageSize && (
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            totalItems={filteredSessions.length}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
