import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import type { CandidateApplicationItem, Recruitment } from "../../types"
import { CandidateProfileCard } from "./CandidateProfileCard"
import { StageTimelineProgress } from "./StageTimelineProgress"
import { StageEvaluationEvidence } from "./StageEvaluationEvidence"
import { StageDecisionFooter } from "./StageDecisionFooter"

export interface CandidateApplicationDetailDialogProps {
  application: CandidateApplicationItem | null
  recruitment: Recruitment
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateStatus?: (
    applicationId: string,
    action: "advance" | "reject" | "reopen",
    payload?: { reason?: string; notes?: string }
  ) => void
}

type ApplicationDetailContentProps = Pick<
  CandidateApplicationDetailDialogProps,
  "onOpenChange" | "onUpdateStatus"
> & {
  application: CandidateApplicationItem
  recruitmentName: string
}

function ApplicationDetailContent({
  application,
  recruitmentName,
  onOpenChange,
  onUpdateStatus,
}: ApplicationDetailContentProps) {
  const stages = application.applicationStages || []
  const activeStageIndex = Math.max(
    0,
    Math.min(application.currentStageIndex, stages.length - 1)
  )
  const [stageIndex, setStageIndex] = useState(activeStageIndex)
  const selectedStageIndex = Math.max(
    0,
    Math.min(stageIndex, stages.length - 1)
  )
  const isFinalStage =
    stages.length > 0 && application.currentStageIndex >= stages.length - 1

  return (
    <DialogContent className="flex max-h-[90dvh] w-full flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-4xl lg:max-w-5xl">
      <DialogHeader className="shrink-0 border-b border-border p-6 pr-14 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <DialogTitle className="text-base font-semibold text-foreground">
            Candidate Application
          </DialogTitle>
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
            {application.codeApplication}
          </span>
        </div>
        <DialogDescription className="text-sm leading-relaxed">
          Review the candidate profile and selection-stage evaluations for{" "}
          {recruitmentName}.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-border px-6 py-4">
          <CandidateProfileCard application={application} />
        </div>

        <div
          className={
            stages.length > 0
              ? "md:grid md:grid-cols-[280px_minmax(0,1fr)]"
              : undefined
          }
        >
          {stages.length > 0 && (
            <aside
              aria-label="Selection stages"
              className="min-w-0 border-b border-border p-6 md:border-r md:border-b-0"
            >
              <StageTimelineProgress
                stages={stages}
                currentStageIndex={application.currentStageIndex}
                selectedStageIndex={selectedStageIndex}
                onSelectStage={setStageIndex}
              />
            </aside>
          )}

          <div className="min-w-0 p-6">
            <StageEvaluationEvidence
              application={application}
              stageIndex={selectedStageIndex}
            />
          </div>
        </div>
      </div>

      <StageDecisionFooter
        key={stages[selectedStageIndex]?.stageId ?? "no-stage"}
        application={application}
        stage={stages[selectedStageIndex]}
        isViewingActiveStage={
          selectedStageIndex === application.currentStageIndex
        }
        isFinalStage={isFinalStage}
        onAdvanceStage={(notes) =>
          onUpdateStatus?.(application.id, "advance", { notes })
        }
        onRejectStage={(reason, notes) =>
          onUpdateStatus?.(application.id, "reject", { reason, notes })
        }
        onGoToActiveStage={() => setStageIndex(activeStageIndex)}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  )
}

export function CandidateApplicationDetailDialog({
  application,
  recruitment,
  open,
  onOpenChange,
  onUpdateStatus,
}: CandidateApplicationDetailDialogProps) {
  if (!application) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ApplicationDetailContent
          key={application.id + ":" + application.currentStageIndex}
          application={application}
          recruitmentName={recruitment.name}
          onOpenChange={onOpenChange}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </Dialog>
  )
}

export { CandidateApplicationDetailDialog as CandidateDetailDialog }
