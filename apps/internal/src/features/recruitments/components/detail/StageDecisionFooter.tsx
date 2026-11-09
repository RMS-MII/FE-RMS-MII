import { useId, useState, type FormEvent } from "react"
import { ArrowRight, CheckCircle2, Lock, XCircle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { CancelButton, SaveButton } from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import { safeFormatDate } from "@/shared/lib/format"
import type {
  CandidateApplicationDetailItem,
  CandidateApplicationStageItem,
  EvaluateStageCommand,
  SetFinalResultCommand,
} from "../../types"

type Confirmation =
  | "stage-pass"
  | "stage-reject"
  | "final-accepted"
  | "final-rejected"
type PassingStageStatus = Extract<
  EvaluateStageCommand["status"],
  "Prioritized" | "Considered"
>

export interface StageDecisionFooterProps {
  application: CandidateApplicationDetailItem
  stage: CandidateApplicationStageItem | undefined
  isViewingActiveStage: boolean
  onEvaluateStage: (
    status: EvaluateStageCommand["status"],
    notes: string
  ) => void | Promise<void>
  onSetFinalResult: (
    status: SetFinalResultCommand["finalResultStatus"],
    notes: string
  ) => void | Promise<void>
  onGoToActiveStage?: () => void
  onStartStage?: () => void
  startRestriction?: string | null
  isStarting?: boolean
  isEvaluating?: boolean
  isFinalizing?: boolean
  startRetry?: {
    message: string
    onRetry: () => void | Promise<void>
  } | null
  onBack: () => void
}

const passingStatusItems: { label: string; value: PassingStageStatus }[] = [
  { label: "Prioritized", value: "Prioritized" },
  { label: "Considered", value: "Considered" },
]

export function StageDecisionFooter({
  application,
  stage,
  isViewingActiveStage,
  onEvaluateStage,
  onSetFinalResult,
  onGoToActiveStage,
  onStartStage,
  startRestriction,
  isStarting = false,
  isEvaluating = false,
  isFinalizing = false,
  startRetry,
  onBack,
}: StageDecisionFooterProps) {
  const formId = useId()
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [passingStatus, setPassingStatus] = useState<PassingStageStatus | "">("")
  const [notes, setNotes] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const isRejected = application.status === "rejected" || application.status === "failed"
  const isAccepted = application.status === "accepted"
  const isDropped = application.status === "dropped" || application.status === "withdrawn"
  const canEvaluateStage = Boolean(
    stage?.applicationStageId &&
      isViewingActiveStage &&
      application.status === "in_progress" &&
      (stage.stageType === "test"
        ? stage.status === "submitted"
        : stage.stageType === "interview" &&
          stage.status === "in_progress" &&
          stage.evaluationReady)
  )
  const canFinalize = Boolean(
    application.summary.canFinalize &&
      application.status === "in_progress" &&
      application.finalStatus == null
  )
  const hasActiveStage = Boolean(
    application.applicationStages[application.currentStageIndex]
  )
  const isSaving = isStarting || isEvaluating || isFinalizing
  const isFinalRejection = confirmation === "final-rejected"
  const isStageRejection = confirmation === "stage-reject"
  const isRejecting = isFinalRejection || isStageRejection

  let readOnlyMessage = "This stage is not currently available for evaluation."
  if (!stage) readOnlyMessage = "No selection stage is available for evaluation."
  else if (stage.isPassed || stage.status === "passed" || stage.status === "accepted") {
    readOnlyMessage =
      stage.stageName +
      " has passed" +
      (stage.completedAt ? " on " + safeFormatDate(stage.completedAt) : "") +
      "."
  } else if (stage.status === "failed" || stage.status === "rejected") {
    readOnlyMessage = stage.stageName + " did not pass."
  } else if (stage.isStarted === false || stage.status === "upcoming") {
    readOnlyMessage = stage.stageName + " has not started."
  } else if (stage.stageType === "test" && stage.status !== "submitted") {
    readOnlyMessage = "The candidate must submit this test before HR can evaluate it."
  } else if (stage.stageType === "interview" && !stage.evaluationReady) {
    readOnlyMessage = "Wait until every active interviewer submits an assessment."
  }
  if (isDropped) readOnlyMessage = "This application has been dropped."
  else if (startRestriction && !stage) {
    readOnlyMessage = startRestriction
  }

  const openConfirmation = (next: Confirmation) => {
    setNotes("")
    setPassingStatus("")
    setActionError(null)
    setConfirmation(next)
  }

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!confirmation || isSaving) return
    const trimmedNotes = notes.trim()
    if (!trimmedNotes) {
      setActionError("Notes are required.")
      return
    }
    if (trimmedNotes.length > 500) {
      setActionError("Notes must be 500 characters or fewer.")
      return
    }
    if (confirmation === "stage-pass" && !passingStatus) {
      setActionError("Choose Prioritized or Considered to record the stage decision.")
      return
    }

    setActionError(null)
    try {
      if (confirmation === "stage-pass" || confirmation === "stage-reject") {
        const status = isRejecting ? "Rejected" : passingStatus
        if (status) await onEvaluateStage(status, trimmedNotes)
      } else {
        const status = confirmation === "final-accepted" ? "Accepted" : "Rejected"
        await onSetFinalResult(status, trimmedNotes)
      }
      setConfirmation(null)
      setNotes("")
      setPassingStatus("")
    } catch (error) {
      setActionError(getApiError(error).message)
    }
  }

  const open = confirmation !== null
  const dialogTitle =
    confirmation === "stage-pass" || confirmation === "stage-reject"
      ? isRejecting
        ? "Reject Candidate at This Stage"
        : "Evaluate Stage"
      : confirmation === "final-accepted"
        ? "Confirm Final Acceptance"
        : "Confirm Final Rejection"

  return (
    <>
      <div className="shrink-0 border-t border-border bg-card px-6 py-4">
        {startRetry && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p role="alert" className="text-sm text-amber-800 dark:text-amber-300">
              Stage evaluation was saved, but the next stage could not be started. {startRetry.message}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void startRetry.onRetry()}
              disabled={isStarting}
              className="shrink-0 rounded-full"
            >
              {isStarting ? "Starting..." : "Retry Start Stage"}
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 space-y-1">
            {isRejected ? (
              <>
                <p className="flex items-center gap-2 text-sm font-medium text-danger">
                  <XCircle className="size-4 shrink-0" aria-hidden />
                  Candidate disqualified
                </p>
                <p className="text-xs text-muted-foreground">{application.note || "Decision locked"}</p>
              </>
            ) : isAccepted ? (
              <>
                <p className="flex items-center gap-2 text-sm font-medium text-success">
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                  Candidate accepted
                </p>
                <p className="text-xs text-muted-foreground">All selection stages completed. Decision locked.</p>
              </>
            ) : canFinalize ? (
              <>
                <p className="text-sm font-medium text-foreground">All active stages are complete</p>
                <p className="text-xs text-muted-foreground">Record the final recruitment result.</p>
              </>
            ) : canEvaluateStage ? (
              <>
                <p className="text-xs text-muted-foreground">Evaluating active stage</p>
                <p className="text-sm font-medium text-foreground">{stage?.stageName}</p>
              </>
            ) : (
              <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                {readOnlyMessage}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <CancelButton disabled={isStarting || isSaving} onClick={onBack}>
              Back to Candidates
            </CancelButton>
            {!canEvaluateStage &&
              !canFinalize &&
              !isRejected &&
              !isAccepted &&
              !isDropped &&
              hasActiveStage &&
              !isViewingActiveStage &&
              onGoToActiveStage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onGoToActiveStage}
                  disabled={isStarting || isSaving}
                  className="h-10 rounded-full bg-card px-4 text-sm"
                >
                  Go to Active Stage
                </Button>
              )}
            {onStartStage && !startRestriction && isViewingActiveStage && (
              <SaveButton
                disabled={isStarting || isSaving}
                isLoading={isStarting}
                onClick={onStartStage}
              >
                Start Stage
              </SaveButton>
            )}
            {canEvaluateStage && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openConfirmation("stage-reject")}
                  className="h-10 gap-1.5 rounded-full border-destructive/30 bg-card px-4 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <XCircle className="size-4" aria-hidden />
                  Reject at Stage
                </Button>
                <SaveButton
                  onClick={() => openConfirmation("stage-pass")}
                  icon={<ArrowRight className="size-4" aria-hidden />}
                >
                  Evaluate Stage
                </SaveButton>
              </>
            )}
            {canFinalize && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openConfirmation("final-rejected")}
                  className="h-10 rounded-full border-destructive/30 bg-card px-4 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Reject Application
                </Button>
                <SaveButton
                  onClick={() => openConfirmation("final-accepted")}
                  icon={<CheckCircle2 className="size-4" aria-hidden />}
                >
                  Accept Application
                </SaveButton>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !isSaving) {
            setConfirmation(null)
            setActionError(null)
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto rounded-2xl bg-card p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border p-6 pr-12 pb-4">
            <DialogTitle className="text-base font-semibold">{dialogTitle}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {confirmation === "stage-pass" || confirmation === "stage-reject"
                ? `Record the HR decision for ${stage?.stageName ?? "this stage"}. Passing decisions allow the candidate to progress.`
                : confirmation === "final-accepted"
                  ? "Accept this candidate after all active stages have passed."
                  : "Reject this application after all active stages are complete."}
            </DialogDescription>
          </DialogHeader>

          <form id={formId} onSubmit={(event) => void handleConfirm(event)} className="space-y-4 p-6">
            {confirmation === "stage-pass" && (
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-status`}>
                  Passing Decision <span className="text-destructive">*</span>
                </Label>
                <Select
                  items={passingStatusItems}
                  value={passingStatus}
                  onValueChange={(value) => {
                    if (value) setPassingStatus(value as PassingStageStatus)
                  }}
                  disabled={isSaving}
                >
                  <SelectTrigger id={`${formId}-status`} className="w-full rounded-full bg-muted">
                    <SelectValue placeholder="Select Prioritized or Considered" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectGroup>
                      {passingStatusItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${formId}-notes`}>
                  {confirmation === "stage-pass" || confirmation === "stage-reject"
                    ? "Evaluation Notes"
                    : "Final Decision Notes"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <span className="text-xs text-muted-foreground">{notes.length}/500</span>
              </div>
              <Textarea
                id={`${formId}-notes`}
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={500}
                required
                disabled={isSaving}
                placeholder="Add notes for this decision..."
                className="min-h-24 resize-y rounded-xl border-0 bg-muted px-4 py-3 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            {actionError && (
              <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                {actionError}
              </p>
            )}
          </form>

          <DialogFooter className="m-0 gap-2 border-t border-border bg-card px-6 py-4">
            <CancelButton disabled={isSaving} onClick={() => setConfirmation(null)} />
            <SaveButton
              type="submit"
              form={formId}
              disabled={isSaving || (confirmation === "stage-pass" && !passingStatus)}
              isLoading={isSaving}
            >
              {confirmation === "stage-pass" || confirmation === "stage-reject"
                ? isRejecting
                  ? "Confirm Rejection"
                  : "Save Stage Evaluation"
                : "Save Final Result"}
            </SaveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
