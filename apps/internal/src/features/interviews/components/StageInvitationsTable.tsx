import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { TableSortHeader, EmptyState } from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  Check,
  X,
} from "lucide-react"
import type { StageInvitationItem } from "../types"

export type StageSortKey = "recruitment" | "stage" | "period" | "candidates" | "status"

export interface StageInvitationsTableProps {
  invitations: StageInvitationItem[]
  sortKey: StageSortKey
  sortDirection: "asc" | "desc"
  onSort: (key: string) => void
  hasActiveFilters: boolean
  onResetFilters?: () => void
  onAccept?: (item: StageInvitationItem) => void
  onDecline?: (item: StageInvitationItem) => void
}

export function StageInvitationsTable({
  invitations,
  sortKey,
  sortDirection,
  onSort,
  hasActiveFilters,
  onResetFilters,
  onAccept,
  onDecline,
}: StageInvitationsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-card">
          <TableRow className="hover:bg-transparent">
            <TableSortHeader
              label="Recruitment Batch"
              sortKey="recruitment"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              onSort={onSort}
              className="pl-5 min-w-56"
            />
            <TableSortHeader
              label="Selection Stage"
              sortKey="stage"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              onSort={onSort}
              className="min-w-44"
            />
            <TableSortHeader
              label="Selection Period"
              sortKey="period"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              onSort={onSort}
              className="min-w-48"
            />
            <TableSortHeader
              label="Mandate Status"
              sortKey="status"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              onSort={onSort}
              align="center"
              className="min-w-36"
            />
            <TableSortHeader
              label="Action"
              align="center"
              className="pr-5 w-48"
            />
          </TableRow>
        </TableHeader>

        <TableBody>
          {invitations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-64 text-center">
                <EmptyState
                  title="No stage invitations found"
                  description={
                    hasActiveFilters
                      ? "Try adjusting search query or filters to find other stage invitations."
                      : "You currently have no pending or past stage interviewer invitations."
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
            invitations.map((item) => {
              const isPending = item.status === "pending"
              const isAccepted = item.status === "accepted"
              const isDeclined = item.status === "declined"

              return (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors border-b border-border/70"
                >
                  {/* Recruitment Batch */}
                  <TableCell className="pl-5 py-3.5 text-xs">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span
                        className="font-semibold text-foreground max-w-64 text-sm"
                        title={item.recruitmentName}
                      >
                        {item.recruitmentName}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1">
                          {item.department}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Stage */}
                  <TableCell className="py-3.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        <Layers className="size-3" />
                        {item.stageName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Period */}
                  <TableCell className="py-3.5 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {safeFormatDate(item.startDate)} – {safeFormatDate(item.endDate)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Mandate Status */}
                  <TableCell className="py-3.5 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                          <AlertCircle className="size-3 text-amber-600" />
                          Pending Response
                        </span>
                      )}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Accepted (Active)
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
                                &ldquo;{item.declineReason || "No explanation reason was recorded."}&rdquo;
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="pr-5 py-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {isPending && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onAccept?.(item)}
                            className="rounded-full border-none bg-emerald-600 hover:bg-emerald-700 text-white px-3 text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Check className="size-3.5" />
                            Accept
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onDecline?.(item)}
                            className="rounded-full border-none bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 px-3 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <X className="size-3.5" />
                            Decline
                          </Button>
                        </>
                      )}

                      {isAccepted && (
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                          Ready for Scheduling
                        </span>
                      )}

                      {isDeclined && (
                        <Popover>
                          <PopoverTrigger
                            render={
                              <button
                                type="button"
                                className="rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs px-2.5 py-1 font-medium transition-colors cursor-pointer dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800"
                              >
                                View Reason
                              </button>
                            }
                          />
                          <PopoverContent
                            align="end"
                            className="w-80 p-3.5 rounded-xl bg-card shadow-lg"
                          >
                            <div className="space-y-1.5 text-left">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                                <XCircle className="size-3.5 shrink-0" />
                                <span>Decline Reason</span>
                              </div>
                              <p className="text-xs text-foreground/90 italic leading-relaxed whitespace-pre-wrap">
                                &ldquo;{item.declineReason || "No explanation reason was recorded."}&rdquo;
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
