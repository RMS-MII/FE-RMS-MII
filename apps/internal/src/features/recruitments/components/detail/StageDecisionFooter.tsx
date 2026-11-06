import { useState } from "react"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Lock,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { CancelButton } from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
import type { CandidateApplicationItem, CandidateApplicationStageItem } from "../../types"

export interface StageDecisionFooterProps {
  application: CandidateApplicationItem
  stage: CandidateApplicationStageItem | undefined
  isViewingActiveStage: boolean
  isFinalStage: boolean
  onAdvanceStage: (notes?: string) => void
  onRejectStage: (reason: string, notes?: string) => void
  onGoToActiveStage?: () => void
  onClose: () => void
}

const REJECTION_REASONS = [
  "Did not meet minimum passing score",
  "Technical qualifications do not match requirements",
  "Interview panel cultural / soft skill mismatch",
  "Candidate withdrew / declined progression",
  "Position quota already fulfilled",
  "Failed document / background verification",
  "Other reason",
]

export function StageDecisionFooter({
  application,
  stage,
  isViewingActiveStage,
  isFinalStage,
  onAdvanceStage,
  onRejectStage,
  onGoToActiveStage,
  onClose,
}: StageDecisionFooterProps) {
  const [isRejecting, setIsRejecting] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0])
  const [notes, setNotes] = useState("")

  const stageName = stage?.stageName || application.currentStageName

  // 1. Permanent finalized states: overall application is rejected or accepted
  const isApplicationRejected =
    application.status === "rejected" || application.status === "failed"
  const isApplicationAccepted = application.status === "accepted"

  // 2. Stage status check: Decision buttons ONLY available if stage is in_progress
  const isStageInProgress = stage?.status === "in_progress"
  const canMakeDecision =
    !isApplicationRejected &&
    !isApplicationAccepted &&
    isViewingActiveStage &&
    isStageInProgress

  const handleConfirmReject = () => {
    onRejectStage(rejectionReason, notes.trim())
    setIsRejecting(false)
  }

  const handleConfirmAdvance = () => {
    onAdvanceStage(notes.trim())
    setIsAdvancing(false)
  }

  return (
    <div className="border-t border-border bg-white p-4 sm:px-6 transition-all shrink-0">
      {/* State A: Inline Rejection Confirmation Prompt (unboxed, clean layout) */}
      {isRejecting ? (
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-sm">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Confirm Disqualification at {stageName}</span>
          </div>

          <p className="text-muted-foreground">
            Candidate will be permanently disqualified and this decision cannot be changed once confirmed.
          </p>

          <div className="space-y-1">
            <label className="font-medium text-foreground block">
              Rejection Reason <span className="text-destructive">*</span>
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-foreground focus:border-rose-500 focus:outline-none"
            >
              {REJECTION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground block">
              Evaluation Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Scored below threshold, technical skill mismatch..."
              className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-rose-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRejecting(false)}
              className="h-9 rounded-full px-4 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReject}
              className="h-9 rounded-full bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs gap-1.5 cursor-pointer"
            >
              <XCircle className="size-3.5" />
              <span>Confirm Disqualification</span>
            </Button>
          </div>
        </div>
      ) : isAdvancing ? (
        /* State B: Inline Advance Confirmation Prompt (unboxed, clean layout) */
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>
              {isFinalStage
                ? "Confirm Final Acceptance (Hired)"
                : `Pass & Advance from ${stageName}`}
            </span>
          </div>

          <p className="text-muted-foreground">
            {isFinalStage
              ? "Candidate has cleared all selection stages and will be finalized as Accepted (Hired)."
              : "Candidate will be marked as Passed for this stage and queued for the next stage."}
          </p>

          <div className="space-y-1">
            <label className="font-medium text-foreground block">
              Stage Clearance Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared with strong recommendation from panel..."
              className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAdvancing(false)}
              className="h-9 rounded-full px-4 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAdvance}
              className="h-9 rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="size-3.5" />
              <span>
                {isFinalStage ? "Confirm Final Offer" : "Confirm Stage Pass"}
              </span>
            </Button>
          </div>
        </div>
      ) : isApplicationRejected ? (
        /* State C: Application Already Rejected (Locked / Read-Only) */
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <XCircle className="size-4 shrink-0" />
            <span className="font-semibold">
              Candidate Disqualified ({application.rejectReason || "Failed evaluation"})
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Lock className="size-3" />
              <span>Decision locked</span>
            </span>
          </div>

          <CancelButton onClick={onClose} className="h-9 px-5 text-xs">
            Close
          </CancelButton>
        </div>
      ) : isApplicationAccepted ? (
        /* State D: Application Already Accepted (Locked / Read-Only) */
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="font-semibold">
              Candidate Accepted & Completed All Stages (Hired)
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Lock className="size-3" />
              <span>Decision locked</span>
            </span>
          </div>

          <CancelButton onClick={onClose} className="h-9 px-5 text-xs">
            Close
          </CancelButton>
        </div>
      ) : !canMakeDecision ? (
        /* State E: Historical or Future Stage View (Locked / Read-Only) */
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="size-3.5 text-muted-foreground/80 shrink-0" />
            <span>
              {stage?.status === "passed"
                ? `${stageName} is already Passed${
                    stage.completedAt ? ` on ${safeFormatDate(stage.completedAt)}` : ""
                  }.`
                : stage?.status === "failed"
                ? `${stageName} was Failed.`
                : `${stageName} is upcoming.`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onGoToActiveStage && !isViewingActiveStage && (
              <Button
                type="button"
                variant="outline"
                onClick={onGoToActiveStage}
                className="h-9 rounded-full text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
              >
                Go to Active Stage
              </Button>
            )}
            <CancelButton onClick={onClose} className="h-9 px-4 text-xs">
              Close
            </CancelButton>
          </div>
        </div>
      ) : (
        /* State F: Active Stage Evaluation Decision Controls (In Progress Only) */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="font-semibold text-foreground">Decision:</span>
            <span>Reviewing {stageName} (In Progress)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejecting(true)}
              className="h-10 rounded-full border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-4 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <XCircle className="size-4" />
              <span>Fail / Reject Candidate</span>
            </Button>

            <Button
              type="button"
              onClick={() => setIsAdvancing(true)}
              className="h-10 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 px-5 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              {isFinalStage ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Accept & Hire Candidate</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Pass & Advance Stage</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
