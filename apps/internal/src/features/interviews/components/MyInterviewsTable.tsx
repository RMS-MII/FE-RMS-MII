import * as React from "react"
import { format, parseISO } from "date-fns"
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
} from "lucide-react"
import type { MyInterviewItem } from "../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { TableSortHeader, EmptyState } from "@/shared/components"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@/shared/lib/utils"

export type InterviewSortKey =
  | "candidate"
  | "recruitment"
  | "schedule"
  | "status"
  | "score"

export interface MyInterviewsTableProps {
  interviews: MyInterviewItem[]
  sortKey: InterviewSortKey
  sortDirection: "asc" | "desc"
  onSort: (key: string) => void
  onConfirmInvitation?: (item: MyInterviewItem) => void
  onSubmitAssessment?: (item: MyInterviewItem) => void
  onViewAssessment?: (item: MyInterviewItem) => void
  onViewCandidate?: (item: MyInterviewItem) => void
  onResetFilters?: () => void
  hasActiveFilters?: boolean
}

export function MyInterviewsTable({
  interviews,
  sortKey,
  sortDirection,
  onSort,
  onConfirmInvitation,
  onSubmitAssessment,
  onViewAssessment,
  onViewCandidate,
  onResetFilters,
  hasActiveFilters = false,
}: MyInterviewsTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="overflow-x-auto">
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
              className="pr-5 w-36"
            />
          </TableRow>
        </TableHeader>

        <TableBody>
          {interviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
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

              let startDate: Date
              let endDate: Date
              try {
                startDate = parseISO(item.scheduledStart)
                endDate = parseISO(item.scheduledEnd)
              } catch {
                startDate = new Date()
                endDate = new Date()
              }

              const isPending = item.status === "pending"
              const isAccepted = item.status === "accepted"
              const isDeclined = item.status === "declined"
              const isCompleted = item.status === "completed"

              return (
                <TableRow
                  key={item.id}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  {/* Candidate Profile */}
                  <TableCell className="pl-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onViewCandidate?.(item)}
                          className="font-semibold text-sm text-foreground hover:text-primary transition-colors text-left truncate block cursor-pointer hover:underline"
                          title="View candidate details"
                        >
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
                        {format(startDate, "EEE, dd MMM yyyy")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                        <Clock className="size-3 text-muted-foreground" />
                        {format(startDate, "HH:mm")} – {format(endDate, "HH:mm")} WIB
                      </span>
                    </div>
                  </TableCell>

                  {/* Mode & Logistics */}
                  <TableCell className="py-3.5 text-xs">
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
                            title={item.location || "Office Meeting Room"}
                          >
                            {item.location || "Office Meeting Room"}
                          </p>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Your Attendance Status */}
                  <TableCell className="py-3.5 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                          <AlertCircle className="size-3 text-amber-600" />
                          Pending Confirmation
                        </span>
                      )}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Confirmed
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
                            className="w-80 p-3.5 rounded-xl border border-border bg-card shadow-lg"
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
                            item.assessment.recommendation === "Strong Hire" &&
                              "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
                            item.assessment.recommendation === "Recommend" &&
                              "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
                            item.assessment.recommendation === "Neutral" &&
                              "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
                            item.assessment.recommendation === "Do Not Recommend" &&
                              "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                          )}
                        >
                          {item.assessment.recommendation}
                        </span>
                      </div>
                    ) : isAccepted ? (
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-950/30 dark:text-amber-400">
                        Awaiting Score
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </TableCell>

                  {/* Action Button */}
                  <TableCell className="pr-5 py-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* 1. Pending: Confirm Invitation */}
                      {isPending && onConfirmInvitation && (
                        <button
                          type="button"
                          onClick={() => onConfirmInvitation(item)}
                          className="rounded-full bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Confirm Schedule
                        </button>
                      )}

                      {/* 2. Accepted & Needs Assessment */}
                      {isAccepted && !item.assessment && onSubmitAssessment && (
                        <button
                          type="button"
                          onClick={() => onSubmitAssessment(item)}
                          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Submit Assessment
                        </button>
                      )}

                      {/* 3. Completed: View Assessment */}
                      {isCompleted && item.assessment && onViewAssessment && (
                        <button
                          type="button"
                          onClick={() => onViewAssessment(item)}
                          className="rounded-full border border-border bg-card hover:bg-muted text-foreground px-3 py-1 text-xs font-medium transition-colors cursor-pointer"
                        >
                          View Assessment
                        </button>
                      )}

                      {/* 4. Declined: Reason Popover */}
                      {isDeclined && (
                        <Popover>
                          <PopoverTrigger
                            render={
                              <button
                                type="button"
                                className="rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs px-2.5 py-0.5 font-medium transition-colors cursor-pointer dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800"
                              >
                                View Reason
                              </button>
                            }
                          />
                          <PopoverContent
                            align="end"
                            className="w-80 p-3.5 rounded-xl border border-border bg-card shadow-lg"
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
                    </div>
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
