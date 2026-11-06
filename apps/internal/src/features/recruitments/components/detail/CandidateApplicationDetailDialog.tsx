import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
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

export function CandidateApplicationDetailDialog({
  application,
  open,
  onOpenChange,
  onUpdateStatus,
}: CandidateApplicationDetailDialogProps) {
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0)

  useEffect(() => {
    if (application) {
      setSelectedStageIndex(application.currentStageIndex || 0)
    }
  }, [application])

  if (!application) return null

  const stages = application.applicationStages || []
  const isFinalStage = application.currentStageIndex >= stages.length - 1

  const handleAdvance = (notes?: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(application.id, "advance", { notes })
    }
  }

  const handleReject = (reason: string, notes?: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(application.id, "reject", { reason, notes })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full p-0! gap-0! rounded-3xl! border border-border shadow-2xl bg-white! max-h-[92vh] h-[88vh] flex flex-col overflow-hidden outline-none"
      >
        <DialogHeader className="border-b border-border p-5 sm:px-6 bg-white shrink-0 pr-14 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                Candidate Application & Evaluation
              </DialogTitle>
              <span className="font-mono text-xs font-semibold rounded-md bg-muted px-2 py-0.5 text-foreground">
                {application.codeApplication}
              </span>
            </div>
          </div>

          <CandidateProfileCard application={application} />
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden bg-white">
          <div className="w-full md:w-[320px] lg:w-90 md:shrink-0 border-b md:border-b-0 md:border-r border-border p-4 sm:p-5 overflow-y-auto">
            <StageTimelineProgress
              stages={stages}
              currentStageIndex={application.currentStageIndex}
              selectedStageIndex={selectedStageIndex}
              onSelectStage={setSelectedStageIndex}
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 space-y-4">

              <StageEvaluationEvidence
                application={application}
                stageIndex={selectedStageIndex}
              />
            </div>

            <StageDecisionFooter
              application={application}
              stage={stages[selectedStageIndex]}
              isViewingActiveStage={selectedStageIndex === application.currentStageIndex}
              isFinalStage={isFinalStage}
              onAdvanceStage={handleAdvance}
              onRejectStage={handleReject}
              onGoToActiveStage={() => setSelectedStageIndex(application.currentStageIndex)}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { CandidateApplicationDetailDialog as CandidateDetailDialog }
