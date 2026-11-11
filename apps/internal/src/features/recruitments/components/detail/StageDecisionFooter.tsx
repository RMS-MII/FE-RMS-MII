import { useId, useState, type FormEvent } from "react"
import { CheckCircle2, Lock, XCircle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { CancelButton, SaveButton } from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import type { CandidateApplicationDetailItem, CandidateApplicationStageItem, EvaluateStageCommand } from "../../types"

export interface StageDecisionFooterProps {
  application: CandidateApplicationDetailItem
  stage: CandidateApplicationStageItem | undefined
  isViewingActiveStage: boolean
  usesBatchLifecycle: boolean
  readOnly?: boolean
  onEvaluateStage: (status: EvaluateStageCommand["status"], notes: string) => void | Promise<void>
  onGoToActiveStage?: () => void
  isEvaluating?: boolean
  onBack: () => void
}

export function StageDecisionFooter({
  application, stage, isViewingActiveStage, usesBatchLifecycle, onEvaluateStage,
  onGoToActiveStage, isEvaluating = false, readOnly = false, onBack,
}: StageDecisionFooterProps) {
  const formId = useId()
  const [decision, setDecision] = useState<"pass" | "fail" | null>(null)
  const [notes, setNotes] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const isActive = isViewingActiveStage &&
    (!usesBatchLifecycle ||
      ["active", "1"].includes(String(stage?.lifecycleStatus).toLowerCase()))
  const canDecide = Boolean(
    !readOnly && stage?.applicationStageId && isActive && application.finalStatus == null &&
    (stage.stageType === "test" || stage.stageType === "interview") &&
    (usesBatchLifecycle ||
      (application.status === "in_progress" &&
        (!stage.isCompleted || stage.status === "expired")))
  )
  const canPass = canDecide && Boolean(stage?.evaluationReady) &&
    !["prioritized", "considered"].includes(stage?.status ?? "")
  const canFail = canDecide && Boolean(
    stage?.isStarted &&
    !["rejected", "dropped"].includes(stage.status) &&
    (stage.stageType === "test"
      ? ["in_progress", "submitted", "expired", "prioritized", "considered"].includes(stage.status)
      : ["in_progress", "prioritized", "considered"].includes(stage.status))
  )
  const isRecorded = Boolean(stage?.isCompleted && stage.status !== "expired")
  const failStatus: EvaluateStageCommand["status"] = stage?.stageType === "test"
    ? stage.isAttempts ? "Rejected" : "Dropped"
    : stage?.evaluationReady ? "Rejected" : "Dropped"

  const openDecision = (next: "pass" | "fail") => {
    setNotes(stage?.notes ?? "")
    setActionError(null)
    setDecision(next)
  }

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!decision || isEvaluating) return
    const trimmedNotes = notes.trim()
    if (trimmedNotes.length > 500) {
      setActionError("Notes must be 500 characters or fewer.")
      return
    }
    try {
      await onEvaluateStage(decision === "pass" ? "Considered" : failStatus, trimmedNotes)
      setDecision(null)
      setActionError(null)
    } catch (error) {
      setActionError(getApiError(error).message)
    }
  }

  return (
    <>
      <div className="shrink-0 border-t border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 space-y-1">
            {readOnly ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="size-4" aria-hidden />
                This recruitment batch is closed. This application is read-only.
              </p>
            ) : isRecorded && isActive ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  {usesBatchLifecycle ? "Internal decision" : "Stage decision"}: {stage?.isPassed ? "Passed" : "Not passed"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {usesBatchLifecycle
                    ? "The candidate will see the result when this batch stage is published."
                    : "This decision has been recorded for the application."}
                </p>
              </>
            ) : canDecide ? (
              <>
                <p className="text-sm font-medium text-foreground">Decide {stage?.stageName}</p>
                <p className="text-xs text-muted-foreground">
                  Record the internal result before activating the next stage.
                </p>
              </>
            ) : (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                {readOnly
                  ? "This recruitment is closed. Candidate decisions are read-only."
                  : stage
                  ? isRecorded
                    ? "The decision for this stage has already been recorded."
                    : "Decisions are available only for candidates in the active stage."
                  : "No stage is available for evaluation."}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <CancelButton disabled={isEvaluating} onClick={onBack}>Back to Candidates</CancelButton>
            {!isViewingActiveStage && onGoToActiveStage && (
              <Button type="button" variant="outline" onClick={onGoToActiveStage} className="h-10 rounded-full">
                Go to Active Stage
              </Button>
            )}
            {canFail && (
              <Button type="button" variant="outline" disabled={isEvaluating}
                onClick={() => openDecision("fail")}
                className="h-10 gap-1.5 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <XCircle className="size-4" aria-hidden /> Not Passed
              </Button>
            )}
            {canPass && (
              <SaveButton disabled={isEvaluating} onClick={() => openDecision("pass")}
                icon={<CheckCircle2 className="size-4" aria-hidden />}>
                Passed
              </SaveButton>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!readOnly && decision !== null} onOpenChange={(open) => {
        if (!open && !isEvaluating) setDecision(null)
      }}>
        <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto rounded-2xl bg-card p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border p-6 pr-12 pb-4">
            <DialogTitle className="text-base font-semibold">
              {decision === "pass" ? "Mark Candidate as Passed" : "Mark Candidate as Not Passed"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              This decision stays internal until the batch stage result is published.
              {decision === "fail" && failStatus === "Dropped" &&
                " No completed submission or assessment is available, so this will be recorded as Dropped."}
            </DialogDescription>
          </DialogHeader>
          <form id={formId} onSubmit={(event) => void handleConfirm(event)} className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-notes`}>Decision Notes <span className="font-normal text-muted-foreground">(Optional)</span></Label>
              <Textarea id={`${formId}-notes`} rows={4} value={notes}
                onChange={(event) => setNotes(event.target.value)} maxLength={500}
                disabled={isEvaluating} placeholder="Add a note if needed..."
                className="min-h-24 resize-y rounded-xl border-0 bg-muted px-4 py-3 text-sm" />
              <p className="text-right text-xs text-muted-foreground">{notes.length}/500</p>
            </div>
            {actionError && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{actionError}</p>}
          </form>
          <DialogFooter className="m-0 gap-2 border-t border-border bg-card px-6 py-4">
            <CancelButton disabled={isEvaluating} onClick={() => setDecision(null)} />
            <SaveButton type="submit" form={formId} disabled={isEvaluating} isLoading={isEvaluating} loadingText="Saving...">
              Save Decision
            </SaveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
