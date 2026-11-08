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
import {
  TableSortHeader,
  EmptyState,
  ErrorState,
  TableSkeleton,
  StatusBadge,
  type Tone,
} from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import { safeFormatDate } from "@/shared/lib/format"
import { Check, X } from "lucide-react"
import type { StageInvitationItem, StageInvitationStatus } from "../types"

export type StageSortKey = "recruitment" | "stage" | "period" | "status"

const statuses: Record<StageInvitationStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "warning" },
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
  unknown: { label: "Unknown", tone: "neutral" },
}

export interface StageInvitationsTableProps {
  invitations: StageInvitationItem[]
  sortKey: StageSortKey
  sortDirection: "asc" | "desc"
  onSort: (key: string) => void
  hasActiveFilters: boolean
  onResetFilters?: () => void
  onAccept?: (item: StageInvitationItem) => void
  onDecline?: (item: StageInvitationItem) => void
  isLoading?: boolean
  isError?: boolean
  error?: unknown
  onRetry?: () => void
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
  isLoading,
  isError,
  error,
  onRetry,
}: StageInvitationsTableProps) {
  const problem = getApiError(
    error,
    "Unable to load your stage invitations. Please try again."
  )
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
              className="min-w-56 pl-5"
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
              label="Status"
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
              className="w-48 pr-5"
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton colCount={5} rowCount={5} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={5}>
                <ErrorState
                  title={
                    problem.kind === "forbidden"
                      ? "Access denied"
                      : "Failed to load invitations"
                  }
                  description={
                    problem.kind === "forbidden"
                      ? "You do not have access to interviewer invitations."
                      : problem.message
                  }
                  onRetry={problem.kind === "forbidden" ? undefined : onRetry}
                />
              </TableCell>
            </TableRow>
          ) : invitations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-64 text-center">
                <EmptyState
                  title="No stage invitations found"
                  description={
                    hasActiveFilters
                      ? "Try adjusting your search or filters."
                      : "You have no stage interviewer invitations."
                  }
                  action={
                    hasActiveFilters && onResetFilters ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="rounded-full bg-muted text-foreground"
                      >
                        Reset filters
                      </Button>
                    ) : undefined
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            invitations.map((item) => (
              <TableRow
                key={item.id}
                className="border-b border-border/70 transition-colors hover:bg-muted/30"
              >
                <TableCell className="py-3.5 pl-5">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold break-words text-foreground">
                      {item.recruitmentName}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {item.recruitmentBatchCode}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.stageName}
                    </p>
                    {item.stageTypeName && (
                      <p className="text-xs text-muted-foreground">
                        {item.stageTypeName}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3.5 text-xs whitespace-nowrap">
                  <p className="text-foreground">
                    {safeFormatDate(item.startDate)} –{" "}
                    {safeFormatDate(item.endDate)}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Assigned {safeFormatDate(item.assignedAt)}
                  </p>
                </TableCell>
                <TableCell className="py-3.5 text-center whitespace-nowrap">
                  <StatusBadge tone={statuses[item.status].tone}>
                    {statuses[item.status].label}
                  </StatusBadge>
                  {item.respondedAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Responded {safeFormatDate(item.respondedAt)}
                    </p>
                  )}
                </TableCell>
                <TableCell className="py-3.5 pr-5 text-center">
                  {item.status === "pending" ? (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onAccept?.(item)}
                        className="gap-1.5 rounded-full bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                      >
                        <Check className="size-3.5" aria-hidden />
                        Accept
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onDecline?.(item)}
                        className="gap-1.5 rounded-full border-destructive/30 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-3.5" aria-hidden />
                        Decline
                      </Button>
                    </div>
                  ) : item.status === "accepted" ? (
                    <p className="text-xs text-success">Ready for scheduling</p>
                  ) : !item.note ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : null}
                  {item.note && (
                    <Popover>
                      <PopoverTrigger
                        render={
                          <button
                            type="button"
                            className="mt-1 cursor-pointer rounded-md px-2 py-1 text-xs text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            View note
                          </button>
                        }
                      />
                      <PopoverContent
                        align="end"
                        className="w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-4 text-foreground"
                      >
                        <p className="mb-2 text-sm font-semibold">
                          Assignment note
                        </p>
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {item.note}
                        </p>
                      </PopoverContent>
                    </Popover>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
