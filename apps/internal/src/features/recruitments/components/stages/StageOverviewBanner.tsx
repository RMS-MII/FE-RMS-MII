import { Panel, CancelButton, SaveButton } from "@/shared/components"
import { formatDate } from "@/shared/lib/format"
import type { Recruitment } from "../../types"

export interface StageOverviewBannerProps {
  recruitment: Recruitment
  totalStages: number
  onCancel: () => void
  onSave: () => void
  isSaved?: boolean
}

export function StageOverviewBanner({
  recruitment,
  totalStages,
  onCancel,
  onSave,
  isSaved,
}: StageOverviewBannerProps) {
  return (
    <Panel className="bg-card/70 px-5 py-3.5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs">
        {/* Batch metadata */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-muted-foreground">Batch Code: </span>
            <span className="font-mono font-semibold text-foreground">
              {recruitment.batchCode ?? recruitment.code}
            </span>
          </div>
          <div className="h-3 w-px bg-border hidden sm:block" />
          <div>
            <span className="text-muted-foreground">Department: </span>
            <span className="font-medium text-foreground">{recruitment.division}</span>
          </div>
          <div className="h-3 w-px bg-border hidden sm:block" />
          <div>
            <span className="text-muted-foreground">Batch Period: </span>
            <span className="font-medium text-foreground">
              {formatDate(recruitment.openDate)} to {formatDate(recruitment.closeDate)}
            </span>
          </div>
          <div className="h-3 w-px bg-border hidden sm:block" />
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary tabular-nums">
            {totalStages} Stages Planned
          </span>
        </div>

        {/* Action Buttons in Banner */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <CancelButton onClick={onCancel} />
          <SaveButton onClick={onSave} isSaved={isSaved} />
        </div>
      </div>
    </Panel>
  )
}
