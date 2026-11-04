import * as React from "react"
import { format, parseISO } from "date-fns"
import {
  CalendarX,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
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
import { DataTablePagination } from "@/shared/components"
import { cn } from "@/shared/lib/utils"

const interviewerStatusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  assigned: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  accepted: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  declined: "bg-rose-500/15 text-rose-800 dark:text-rose-300",
  completed: "bg-blue-500/15 text-blue-800 dark:text-blue-300",
}

const interviewerStatusLabels: Record<string, string> = {
  pending: "Pending (Menunggu Persetujuan)",
  assigned: "Pending (Menunggu Persetujuan)",
  accepted: "Accepted (Menyetujui)",
  declined: "Declined (Menolak)",
  completed: "Completed (Selesai)",
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
  const [page, setPage] = React.useState(1)
  const pageSize = 6

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [selectedDate, isFilterPendingReschedule, sessions.length])

  // Filter sessions based on selected date or pending reschedule flag
  const filteredSessions = React.useMemo(() => {
    let result = [...sessions]

    if (isFilterPendingReschedule) {
      result = result.filter(
        (s) => s.rescheduleRequest?.status === "pending"
      )
    } else if (selectedDate) {
      result = result.filter(
        (s) => s.scheduledStart.slice(0, 10) === selectedDate
      )
    }

    // Sort by scheduledStart ascending
    return result.sort(
      (a, b) =>
        new Date(a.scheduledStart).getTime() -
        new Date(b.scheduledStart).getTime()
    )
  }, [sessions, selectedDate, isFilterPendingReschedule])

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
        const parsed = parseISO(selectedDate)
        return {
          title: format(parsed, "EEEE, dd MMMM yyyy"),
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
          <p className="text-xs text-muted-foreground mt-0.5">
            {headerInfo.subtitle}
          </p>
        </div>

        {(selectedDate || isFilterPendingReschedule) && onClearDateFilter && (
          <button
            type="button"
            onClick={onClearDateFilter}
            className="text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            Show All Dates
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
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
                      <CalendarX className="size-10 text-muted-foreground/60 mb-2" />
                      <h4 className="text-sm font-semibold text-foreground">
                        {isFilterPendingReschedule
                          ? "No Pending Reschedule Requests"
                          : "No Interview Sessions Scheduled"}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        {isFilterPendingReschedule
                          ? "All candidate reschedule requests have been reviewed."
                          : selectedDate
                            ? "There are no interview sessions scheduled for this specific date."
                            : "No interview sessions found matching your criteria."}
                      </p>
                      {(selectedDate || isFilterPendingReschedule) && onClearDateFilter && (
                        <button
                          type="button"
                          onClick={onClearDateFilter}
                          className="mt-3.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
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
                  let dateFormatted = ""
                  let timeFormatted = ""
                  try {
                    const start = parseISO(session.scheduledStart)
                    const end = parseISO(session.scheduledEnd)
                    dateFormatted = format(start, "dd MMM yyyy")
                    timeFormatted = `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`
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
                      <TableCell className="pl-4 text-center text-xs text-muted-foreground font-mono">
                        {itemIndex}
                      </TableCell>

                      {/* Candidate Column */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-foreground truncate">
                              {session.candidateName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
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
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <Clock className="size-3 text-muted-foreground shrink-0" />
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
                                interviewerStatusLabels[inv.status] || inv.status

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
                          <span className="text-muted-foreground italic text-xs">
                            Unassigned
                          </span>
                        )}
                      </TableCell>

                      {/* Mode & Logistics */}
                      <TableCell className="py-3 text-xs">
                        <div className="space-y-1.5">
                          {session.isOnline ? (
                            <div className="flex flex-col gap-1 items-start">
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
                                      handleCopyLink(session.meetingUrl!, session.id)
                                    }
                                    title="Copy meeting link"
                                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
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
                                className="text-[11px] text-muted-foreground truncate max-w-44 mt-0.5"
                                title={session.location || "Office Meeting Room"}
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
                          {session.status === "completed" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              Completed
                            </span>
                          ) : session.status === "cancelled" ? (
                            <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                              Cancelled
                            </span>
                          ) : session.status === "rescheduled" ? (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              Rescheduled
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                              Scheduled
                            </span>
                          )}

                          {/* Reschedule Request Notice Badge */}
                          {isPendingReschedule && (
                            <button
                              type="button"
                              onClick={() => onReviewReschedule?.(session)}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer dark:bg-amber-950 dark:text-amber-300"
                            >
                              <AlertTriangle className="size-2.5 text-amber-600" />
                              Reschedule Req.
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* Action Column */}
                      <TableCell className="pr-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {isPendingReschedule && onReviewReschedule ? (
                            <button
                              type="button"
                              onClick={() => onReviewReschedule(session)}
                              className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
                            >
                              Review Reschedule
                            </button>
                          ) : (session.status === "rescheduled" || session.rescheduleRequest?.status === "approved") && onAdjustSchedule ? (
                            <button
                              type="button"
                              onClick={() => onAdjustSchedule(session)}
                              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                            >
                              Adjust Schedule
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground/60">—</span>
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

