import { CheckCircle2, Clock, XCircle, Circle } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { safeFormatDate } from "@/shared/lib/format"
import type { ApplicationStageItem } from "../../types"

export interface StageTimelineProgressProps {
  stages: ApplicationStageItem[]
  currentStageIndex: number
  selectedStageIndex: number
  onSelectStage: (index: number) => void
}

const stageStatuses = {
  prioritized: {
    label: "Prioritized",
    className: "bg-success-soft text-success",
    Icon: CheckCircle2,
  },
  considered: {
    label: "Considered",
    className: "bg-success-soft text-success",
    Icon: CheckCircle2,
  },
  submitted: {
    label: "Submitted",
    className: "bg-warning-soft text-warning",
    Icon: Clock,
  },
  expired: {
    label: "Expired",
    className: "bg-danger-soft text-danger",
    Icon: XCircle,
  },
  dropped: {
    label: "Dropped · Not passed",
    className: "bg-danger-soft text-danger",
    Icon: XCircle,
  },
  unknown: {
    label: "Unknown",
    className: "bg-neutral-soft text-neutral",
    Icon: Circle,
  },
  passed: {
    label: "Passed",
    className: "bg-success-soft text-success",
    Icon: CheckCircle2,
  },
  accepted: {
    label: "Accepted",
    className: "bg-success-soft text-success",
    Icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    className: "bg-danger-soft text-danger",
    Icon: XCircle,
  },
  rejected: {
    label: "Rejected · Not passed",
    className: "bg-danger-soft text-danger",
    Icon: XCircle,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-info-soft text-info",
    Icon: Clock,
  },
  pending: {
    label: "Pending",
    className: "bg-warning-soft text-warning",
    Icon: Clock,
  },
  upcoming: {
    label: "Not started",
    className: "bg-muted text-muted-foreground",
    Icon: Circle,
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-muted text-muted-foreground",
    Icon: Circle,
  },
}

export function StageTimelineProgress({
  stages,
  currentStageIndex,
  selectedStageIndex,
  onSelectStage,
}: StageTimelineProgressProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">
          Stages Timeline
        </h4>
        <span className="text-xs text-muted-foreground tabular-nums">
          {currentStageIndex >= 0
            ? `Step ${currentStageIndex + 1} of ${stages.length}`
            : `${stages.length} stages`}
        </span>
      </div>

      {stages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stages configured.</p>
      ) : (
        <ol className="flex gap-3 overflow-x-auto pb-1 md:flex-col md:gap-2 md:overflow-visible md:pb-0">
          {stages.map((stage, index) => {
            const status =
              stageStatuses[stage.status as keyof typeof stageStatuses] ??
              stageStatuses.unknown
            const Icon = status.Icon
            const isSelected = selectedStageIndex === index
            const isNotPassed = ["dropped", "rejected", "expired"].includes(stage.status)
            const score =
              stage.totalScore ?? stage.testEvaluation?.score ?? null
            const date = stage.completedAt || stage.startedAt

            return (
              <li
                key={stage.stageId || index}
                className="w-64 shrink-0 md:w-full"
              >
                <button
                  type="button"
                  onClick={() => onSelectStage(index)}
                  aria-label={
                    "View stage " + (index + 1) + ": " + stage.stageName
                  }
                  aria-pressed={isSelected}
                  aria-current={
                    currentStageIndex === index ? "step" : undefined
                  }
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    isSelected
                      ? isNotPassed
                        ? "border-danger/50 bg-danger-soft/30 ring-2 ring-primary ring-offset-2 ring-offset-card shadow-sm"
                        : "border-primary/50 bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-card shadow-sm"
                      : isNotPassed
                        ? "border-danger/30 bg-danger-soft/20 hover:bg-danger-soft/40"
                        : "border-border bg-card hover:bg-muted/50"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      status.className
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 space-y-1.5">
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0 text-sm leading-5 font-medium wrap-break-word text-foreground">
                        {stage.sequence ?? index + 1}. {stage.stageName}
                      </span>
                      {isSelected && (
                        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          Viewing
                        </span>
                      )}
                    </span>
                    <span className={cn("block text-xs font-medium", isNotPassed ? "text-danger" : "text-muted-foreground")}>
                      {status.label}
                    </span>
                    <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground tabular-nums">
                      <span>
                        {score !== null
                          ? "Score: " + score
                          : stage.status === "dropped"
                            ? stage.stageType === "test"
                              ? "No test submission"
                              : "No completed assessment"
                          : stage.passingScore != null
                            ? "Min score: " + stage.passingScore
                            : "Not evaluated"}
                      </span>
                      {date && <span>{safeFormatDate(date)}</span>}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
