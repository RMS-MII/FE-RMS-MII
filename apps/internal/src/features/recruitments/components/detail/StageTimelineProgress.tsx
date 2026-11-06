import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Circle,
  ChevronRight,
} from "lucide-react"
import { safeFormatDate } from "@/shared/lib/format"
import type { ApplicationStageItem } from "../../types"

export interface StageTimelineProgressProps {
  stages: ApplicationStageItem[]
  currentStageIndex: number
  selectedStageIndex: number
  onSelectStage: (index: number) => void
}

export function StageTimelineProgress({
  stages,
  currentStageIndex,
  selectedStageIndex,
  onSelectStage,
}: StageTimelineProgressProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h4 className="text-sm font-semibold text-foreground">Stages Timeline</h4>
        <span className="text-xs text-muted-foreground font-mono">
          Step {Math.min(currentStageIndex + 1, stages.length)} of {stages.length}
        </span>
      </div>

      {/* Stepper Timeline List */}
      <div className="relative pl-0.5">
        {stages.map((stage, idx) => {
          const isPassed = stage.status === "passed"
          const isInProgress = stage.status === "in_progress"
          const isFailed = stage.status === "failed"
          const isPending = stage.status === "pending"
          const isSelected = selectedStageIndex === idx
          const isLast = idx === stages.length - 1

          return (
            <div key={stage.stageId || idx} className="relative flex items-start gap-3 group">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute left-3.75 top-7 bottom-0 w-0.5 transition-colors ${
                    isPassed
                      ? "bg-emerald-500/50"
                      : isFailed
                      ? "bg-rose-500/40"
                      : "bg-border"
                  }`}
                />
              )}

              {/* Status Node Icon (no outer border, clean colored background & icon) */}
              <button
                type="button"
                onClick={() => onSelectStage(idx)}
                className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : ""
                } ${
                  isPassed
                    ? " bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : isFailed
                    ? " bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : isInProgress
                    ? " bg-primary/10 text-primary animate-pulse"
                    : isPending
                    ? " bg-amber-500/10 text-amber-500"
                    : " bg-muted/40 text-muted-foreground/60"
                }`}
                aria-label={`View stage ${idx + 1}: ${stage.stageName}`}
              >
                {isPassed ? (
                  <CheckCircle2 className="size-4" />
                ) : isFailed ? (
                  <XCircle className="size-4" />
                ) : isInProgress ? (
                  <Clock className="size-4" />
                ) : isPending ? (
                  <AlertCircle className="size-4" />
                ) : (
                  <Circle className="size-3.5" />
                )}
              </button>

              {/* Stage Card */}
              <div
                onClick={() => onSelectStage(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelectStage(idx)
                  }
                }}
                className={`mb-2.5 flex-1 rounded-xl p-3 text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-2xs"
                    : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
                }`}
              >
                {/* Stage Title Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {idx + 1}. {stage.stageName}
                  </span>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                </div>

                {/* Details Row: Score on left, Date on right */}
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    {stage.totalScore != null ? (
                      <span className="font-semibold text-foreground">
                        Score: {stage.totalScore}
                        {stage.passingScore != null && stage.passingScore > 0 && (
                          <span className="font-normal text-muted-foreground">
                            {" "}/ {stage.passingScore}
                          </span>
                        )}
                      </span>
                    ) : stage.passingScore != null && stage.passingScore > 0 ? (
                      <span>Min Score: {stage.passingScore}</span>
                    ) : (
                      <span>Evaluation</span>
                    )}
                  </span>

                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {stage.completedAt
                      ? safeFormatDate(stage.completedAt)
                      : stage.startedAt
                      ? safeFormatDate(stage.startedAt)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
