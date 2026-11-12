import * as React from "react"
import { formatWibDate, formatWibTime, parseUtcDateTime } from "@/shared/lib/utcDateTime"
import {
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CalendarClock,
  MoreHorizontal,
  FileText,
} from "lucide-react"
import type { MyInterviewItem } from "../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { TableSortHeader, EmptyState, ErrorState, TableSkeleton } from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@/shared/lib/utils"

export type InterviewSortKey =
  | "candidate"
  | "recruitment"
  | "schedule"
  | "status"
  | "score"

export interface MyInterviewsTableProps {
  interviews: MyInterviewItem[]
  onOpenDetail?: (item: MyInterviewItem) => void
  sortKey: InterviewSortKey
  sortDirection: "asc" | "desc"
  onSort: (key: string) => void
  onAcceptInvitation?: (item: MyInterviewItem) => void
  onSubmitAssessment?: (item: MyInterviewItem) => void
  onViewAssessment?: (item: MyInterviewItem) => void
  onAssignTakeHome?: (item: MyInterviewItem) => void
  onRequestReschedule?: (item: MyInterviewItem) => void
  onResetFilters?: () => void
  hasActiveFilters?: boolean
  isLoading?: boolean
  isFetching?: boolean
  isError?: boolean
  error?: unknown
  onRetry?: () => void
}

export function MyInterviewsTable({
  interviews,
  onOpenDetail,
  sortKey,
  sortDirection,
  onSort,
  onAcceptInvitation,
  onSubmitAssessment,
  onViewAssessment,
  onAssignTakeHome,
  onRequestReschedule,
  onResetFilters,
  hasActiveFilters = false,
  isLoading = false,
  isFetching = false,
  isError = false,
  error,
  onRetry,
}: MyInterviewsTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className={cn("overflow-x-auto", isFetching && !isLoading && "opacity-60")}>
      <Table>
        <TableHeader className="bg-card">
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableSortHeader
              label="Candidate Profile"
              sortKey="candidate"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              onSort={onSort}
              className="pl-5 min-w-56"
            />
            <TableSortHeader
              label="Recruitment & Stage"
              sortKey="recruitment"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              onSort={onSort}
              className="min-w-48"
            />
            <TableSortHeader
              label="Schedule"
              sortKey="schedule"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              onSort={onSort}
              className="min-w-44"
            />
            <TableSortHeader
              label="Mode & Logistics"
              className="min-w-44"
            />
            <TableSortHeader label="Interview Panel" className="min-w-48" />
            <TableSortHeader
              label="Attendance Status"
              sortKey="status"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              onSort={onSort}
              align="center"
              className="min-w-36"
            />
            <TableSortHeader
              label="Evaluation"
              sortKey="score"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              onSort={onSort}
              align="center"
              className="min-w-36"
            />
            <TableSortHeader
              label="Action"
              align="center"
              className="pr-5 w-44"
            />
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeleton colCount={8} rowCount={5} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={8} className="h-64 text-center">
                <ErrorState
                  title={getApiError(error).kind === "forbidden" ? "Access denied" : "Unable to load interviews"}
                  description={getApiError(error, "Unable to load your interview sessions.").message}
                  onRetry={getApiError(error).kind === "forbidden" ? undefined : onRetry}
                />
              </TableCell>
            </TableRow>
          ) : interviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-64 text-center">
                <EmptyState
                  title="No interviews match"
                  description={
                    hasActiveFilters
                      ? "Change keywords or clear filters to view other interview assignments."
                      : "You have no interview assignments scheduled at this time."
                  }
                  action={
                    hasActiveFilters && onResetFilters ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="rounded-full border-0 bg-muted/60 text-foreground hover:bg-muted cursor-pointer"
                      >
                        Reset filters
                      </Button>
                    ) : undefined
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            interviews.map((item) => {
              const isCopied = copiedId === item.id

              const startDate = parseUtcDateTime(item.scheduledStart)
              const endDate = parseUtcDateTime(item.scheduledEnd)

              const isPending = item.status === "pending"
              const isRescheduleRequested = item.status === "rescheduled"
              const isAccepted = item.status === "accepted"
              const isDeclined = item.status === "declined"
              const isCompleted = item.status === "completed"
              const isCancelled = item.status === "cancelled"

              let takeHomeRestriction: string | undefined
              if (!item.canAssignTakeHome) {
                if (!item.candidateConfirmed) {
                  takeHomeRestriction = "Waiting for candidate confirmation"
                } else {
                  takeHomeRestriction = "Requires an active selection stage"
                }
              }

              const takeHomeAction = onAssignTakeHome && (
                <DropdownMenuItem
                  disabled={!item.canAssignTakeHome}
                  onClick={() => onAssignTakeHome(item)}
                  className="items-start gap-2 text-xs font-medium data-disabled:opacity-100"
                >
                  <FileText className="mt-0.5 size-3.5" aria-hidden />
                  <span className="whitespace-normal">
                    <span className={cn("block", takeHomeRestriction && "text-muted-foreground")}>
                      {item.fileTakeHome ? "Edit Take-home" : "Assign Take-home"}
                    </span>
                    {takeHomeRestriction && (
                      <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                        {takeHomeRestriction}
                      </span>
                    )}
                  </span>
                </DropdownMenuItem>
              )

              return (
                <TableRow
                  key={item.id}
                  className={cn("border-b border-border transition-colors hover:bg-muted/40", onOpenDetail && "cursor-pointer")}
                  onClick={() => onOpenDetail?.(item)}
                >
                  {/* Candidate Profile */}
                  <TableCell className="pl-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <button type="button" onClick={(event) => { event.stopPropagation(); onOpenDetail?.(item) }} className="block truncate text-left text-sm font-semibold text-foreground hover:text-primary hover:underline">
                          {item.candidateName}
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <span className="truncate max-w-40">
                            {item.candidateEmail}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Recruitment Batch & Stage */}
                  <TableCell className="py-3.5 text-xs">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span
                        className="font-medium text-foreground truncate max-w-48 text-sm"
                        title={item.recruitmentName}
                      >
                        {item.recruitmentName}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {item.stageName}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Schedule */}
                  <TableCell className="py-3.5 text-xs whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground text-sm">
                        {!Number.isNaN(startDate.getTime())
                          ? formatWibDate(startDate, { weekday: "short" })
                          : "Date unavailable"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                        <Clock className="size-3 text-muted-foreground" />
                        {!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())
                          ? `${formatWibTime(startDate)} – ${formatWibTime(endDate)} WIB`
                          : "Time unavailable"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Mode & Logistics */}
                  <TableCell className="py-3.5 text-xs" onClick={(event) => event.stopPropagation()}>
                    <div className="flex flex-col gap-1">
                      {item.isOnline ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                            <Video className="size-3 text-cyan-600" />
                            Online
                          </span>
                          {item.meetingUrl ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={item.meetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline max-w-36 truncate"
                                title={item.meetingUrl}
                              >
                                <span>Meet Link</span>
                                <ExternalLink className="size-2.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(item.meetingUrl!, item.id)}
                                title={isCopied ? "Copied!" : "Copy link"}
                                className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                              >
                                {isCopied ? (
                                  <Check className="size-3 text-emerald-600" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              Link pending
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                            <MapPin className="size-3 text-indigo-600" />
                            Onsite
                          </span>
                          <p
                            className="text-[11px] text-muted-foreground truncate max-w-44 mt-0.5"
                            title={item.location || "Location not provided"}
                          >
                            {item.location || "Location not provided"}
                          </p>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Interview Panel */}
                  <TableCell className="py-3.5 text-xs">
                    {item.panelInterviewers.length > 0 ? (
                      <div className="space-y-1.5">
                        {item.panelInterviewers.map((member) => (
                          <div key={member.id} className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="max-w-36 truncate font-medium text-foreground" title={member.name}>
                              {member.name}
                            </span>
                            {member.isCurrent && (
                              <span className="text-[10px] text-muted-foreground">You</span>
                            )}
                            {member.isLead && (
                              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                Lead
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Panel unavailable</span>
                    )}
                  </TableCell>

                  {/* Attendance Status */}
                  <TableCell className="py-3.5 text-center whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                    <div className="flex flex-col items-center gap-1">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                          <AlertCircle className="size-3 text-amber-600" />
                          Pending Confirmation
                        </span>
                      )}

                      {isRescheduleRequested && (
                        <Popover>
                          <PopoverTrigger
                            render={
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
                                title="This session has been rescheduled"
                              >
                                <CalendarClock className="size-3 text-amber-600" />
                                Rescheduled
                              </button>
                            }
                          />
                          <PopoverContent
                            align="center"
                            className="w-80 p-3.5 rounded-xl bg-card shadow-lg"
                          >
                            <div className="space-y-1.5 text-left text-xs">
                              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                                <CalendarClock className="size-3.5 shrink-0" />
                                <span>Reschedule Proposed</span>
                              </div>
                              {item.rescheduleRequest ? (
                                <div className="space-y-1 text-muted-foreground pt-1 border-t border-border/50 text-[11px]">
                                  <p>
                                    <strong className="text-foreground">Proposed:</strong>{" "}
                                    {formatWibDate(item.rescheduleRequest.proposedStart, { weekday: "short" })} • {formatWibTime(item.rescheduleRequest.proposedStart)}{" "}
                                    –{" "}
                                    {formatWibTime(item.rescheduleRequest.proposedEnd)} WIB
                                  </p>
                                  <p className="italic leading-relaxed">
                                    &ldquo;{item.rescheduleRequest.reason}&rdquo;
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[11px] text-muted-foreground italic">
                                  This session is no longer active.
                                </p>
                              )}
                              <span className="inline-block text-[10px] text-amber-600/90 font-medium pt-1">
                                Status: Rescheduled
                              </span>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}

                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          {item.candidateConfirmed ? "Confirmed" : "Awaiting Candidate"}
                        </span>
                      )}

                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                          <XCircle className="size-3 text-rose-600" />
                          Cancelled
                        </span>
                      )}

                      {isDeclined && (
                        <Popover>
                          <PopoverTrigger
                            render={
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 dark:text-rose-300 hover:bg-rose-500/25 transition-colors cursor-pointer"
                                title="Click to view decline reason"
                              >
                                <XCircle className="size-3 text-rose-600" />
                                Declined
                              </button>
                            }
                          />
                          <PopoverContent
                            align="center"
                            className="w-80 p-3.5 rounded-xl bg-card shadow-lg"
                          >
                            <div className="space-y-1.5 text-left">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                                <XCircle className="size-3.5 shrink-0" />
                                <span>Decline Reason</span>
                              </div>
                              <p className="text-xs text-foreground/90 italic leading-relaxed whitespace-pre-wrap">
                                &ldquo;{item.declineReason || "No explanation reason was provided."}&rdquo;
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                          <CheckCircle2 className="size-3 text-blue-600" />
                          Completed
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Evaluation / Assessment Score */}
                  <TableCell className="py-3.5 text-center whitespace-nowrap text-xs">
                    {item.assessment ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                          {item.assessment.score} / 100
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            item.assessment.recommendation === "Strongly Recommend" &&
                              "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
                            item.assessment.recommendation === "Recommend" &&
                              "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
                            item.assessment.recommendation === "Consider" &&
                              "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
                            item.assessment.recommendation === "Not Recommend" &&
                              "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                          )}
                        >
                          {item.assessment.recommendation}
                        </span>
                      </div>
                    ) : isAccepted && item.candidateConfirmed ? (
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-950/30 dark:text-amber-400">
                        Awaiting Score
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </TableCell>

                  {/* Action Buttons: Centered */}
                  <TableCell className="pr-5 py-3.5 text-center whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                    {/* Attendance confirmation */}
                    {isPending && item.isLead && (
                      <div className="flex items-center justify-center gap-1.5">
                        {onRequestReschedule && (
                          <Button type="button" variant="outline" size="sm" onClick={() => onRequestReschedule(item)} className="h-8 rounded-full px-3 text-xs">
                            Reschedule
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onAcceptInvitation?.(item)}
                          className="h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Check className="size-3.5" />
                          Accept
                        </Button>
                      </div>
                    )}
                    {isPending && !item.isLead && (
                      <span className="text-xs text-muted-foreground">Awaiting lead confirmation</span>
                    )}

                    {/* Rescheduled sessions cannot be confirmed or assessed */}
                    {isRescheduleRequested && (
                      <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full font-medium inline-block">
                        Rescheduled
                      </span>
                    )}

                    {/* 3. Accepted: MoreHorizontal Dropdown Menu */}
                    {isAccepted && (
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-8 rounded-full text-foreground transition-colors hover:bg-muted cursor-pointer"
                                aria-label={`Actions for ${item.candidateName}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-52 rounded-xl p-1 shadow-lg bg-card">
                            {takeHomeAction}
                            {item.candidateConfirmed && !item.assessment && onSubmitAssessment && (
                              <DropdownMenuItem
                                onClick={() => onSubmitAssessment(item)}
                                className="cursor-pointer gap-2 text-xs font-medium"
                              >
                                <FileText className="size-3.5" aria-hidden />
                                <span>Submit Evaluation</span>
                              </DropdownMenuItem>
                            )}
                            {onRequestReschedule && item.isLead && (
                              <DropdownMenuItem
                                onClick={() => onRequestReschedule(item)}
                                className="cursor-pointer gap-2 text-xs font-medium"
                              >
                                <Clock className="size-3.5" aria-hidden />
                                <span>Request Reschedule</span>
                              </DropdownMenuItem>
                            )}

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    {/* 4. Completed: MoreHorizontal Dropdown Menu */}
                    {isCompleted && (
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-8 rounded-full text-foreground transition-colors hover:bg-muted cursor-pointer"
                                aria-label={`Actions for ${item.candidateName}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-52 rounded-xl p-1 shadow-lg bg-card">
                            {takeHomeAction}
                            {item.assessment && onViewAssessment && (
                              <DropdownMenuItem
                                onClick={() => onViewAssessment(item)}
                                className="cursor-pointer gap-2 text-xs font-medium "
                              >
                                <FileText className="size-3.5" aria-hidden />
                                <span>View Evaluation</span>
                              </DropdownMenuItem>
                            )}

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    {/* 5. Declined / Other fallback */}
                    {(isDeclined || isCancelled) && (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
