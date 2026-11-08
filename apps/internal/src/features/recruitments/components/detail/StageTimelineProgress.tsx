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
    label: "Rejected",
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
    label: "Upcoming",
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
          Step {Math.max(0, Math.min(currentStageIndex + 1, stages.length))} of{" "}
          {stages.length}
        </span>
      </div>

      {stages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stages configured.</p>
      ) : (
        <ol className="flex gap-3 overflow-x-auto pb-1 md:flex-col md:gap-2 md:overflow-visible md:pb-0">
          {stages.map((stage, index) => {
            const status =
              stageStatuses[stage.status as keyof typeof stageStatuses] ??
              stageStatuses.upcoming
            const Icon = status.Icon
            const isSelected = selectedStageIndex === index
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
                    "flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    isSelected
                      ? "border-primary/30 bg-primary/5"
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
                    <span className="block text-sm leading-5 font-medium break-words text-foreground">
                      {index + 1}. {stage.stageName}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {status.label}
                    </span>
                    <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground tabular-nums">
                      <span>
                        {score !== null
                          ? "Score: " + score
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
