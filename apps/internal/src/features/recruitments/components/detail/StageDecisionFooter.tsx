import { useId, useState } from "react"
import type { FormEvent } from "react"
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
import { safeFormatDate } from "@/shared/lib/format"
import type {
  CandidateApplicationItem,
  CandidateApplicationStageItem,
} from "../../types"

export interface StageDecisionFooterProps {
  application: CandidateApplicationItem
  stage: CandidateApplicationStageItem | undefined
  isViewingActiveStage: boolean
  isFinalStage: boolean
  onAdvanceStage?: (notes?: string) => void
  onRejectStage?: (reason: string, notes?: string) => void
  onGoToActiveStage?: () => void
  onStartStage?: () => void
  startRestriction?: string | null
  isStarting?: boolean
  onBack: () => void
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
const rejectionItems = REJECTION_REASONS.map((reason) => ({
  label: reason,
  value: reason,
}))

export function StageDecisionFooter({
  application,
  stage,
  isViewingActiveStage,
  isFinalStage,
  onAdvanceStage,
  onRejectStage,
  onGoToActiveStage,
  onStartStage,
  startRestriction,
  isStarting = false,
  onBack,
}: StageDecisionFooterProps) {
  const formId = useId()
  const [confirmation, setConfirmation] = useState<"advance" | "reject" | null>(
    null
  )
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0])
  const [notes, setNotes] = useState("")
  const stageName = stage?.stageName || application.currentStageName
  const isApplicationRejected =
    application.status === "rejected" || application.status === "failed"
  const isApplicationAccepted = application.status === "accepted"
  const isApplicationDropped =
    application.status === "dropped" || application.status === "withdrawn"
  const canMakeDecision =
    Boolean(onAdvanceStage && onRejectStage && stage?.applicationStageId) &&
    !isApplicationRejected &&
    !isApplicationAccepted &&
    !isApplicationDropped &&
    isViewingActiveStage &&
    stage?.status === "in_progress"
  const hasActiveStage = Boolean(
    application.applicationStages[application.currentStageIndex]
  )
  const isRejecting = confirmation === "reject"

  let readOnlyMessage = "This stage is not currently available for evaluation."
  if (!stage)
    readOnlyMessage = "No selection stage is available for evaluation."
  else if (
    stage.isPassed ||
    stage.status === "passed" ||
    stage.status === "accepted"
  ) {
    readOnlyMessage =
      stageName +
      " has passed" +
      (stage.completedAt ? " on " + safeFormatDate(stage.completedAt) : "") +
      "."
  } else if (stage.status === "failed" || stage.status === "rejected") {
    readOnlyMessage = stageName + " did not pass."
  } else if (stage.isStarted === false || stage.status === "upcoming")
    readOnlyMessage = stageName + " has not started."
  else if (stage.status === "pending" || stage.status === "submitted")
    readOnlyMessage = stageName + " is awaiting evaluation."
  else if (stage.status === "in_progress")
    readOnlyMessage = stageName + " is in progress."
  else if (stage.status === "expired")
    readOnlyMessage = stageName + " has expired."
  else if (stage.status === "dropped")
    readOnlyMessage = stageName + " was dropped."
  if (isApplicationDropped)
    readOnlyMessage = "This application has been dropped."
  else if (startRestriction && (isViewingActiveStage || !hasActiveStage)) {
    readOnlyMessage = startRestriction
  }

  const handleOpenConfirmation = (action: "advance" | "reject") => {
    if (!canMakeDecision) return
    setNotes("")
    setRejectionReason(REJECTION_REASONS[0])
    setConfirmation(action)
  }

  const handleConfirm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canMakeDecision || !confirmation) return
    if (isRejecting) {
      if (!rejectionReason) return
      onRejectStage?.(rejectionReason, notes.trim())
    } else {
      onAdvanceStage?.(notes.trim())
    }
    setConfirmation(null)
    setNotes("")
  }

  return (
    <>
      <div className="shrink-0 border-t border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 space-y-1">
            {isApplicationRejected ? (
              <>
                <p className="flex items-center gap-2 text-sm font-medium text-danger">
                  <XCircle className="size-4 shrink-0" aria-hidden />
                  Candidate disqualified
                </p>
                <p className="text-xs text-muted-foreground">
                  {application.rejectReason || "Decision locked"}
                </p>
              </>
            ) : isApplicationAccepted ? (
              <>
                <p className="flex items-center gap-2 text-sm font-medium text-success">
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                  Candidate accepted
                </p>
                <p className="text-xs text-muted-foreground">
                  All selection stages completed. Decision locked.
                </p>
              </>
            ) : canMakeDecision ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Reviewing active stage
                </p>
                <p className="text-sm font-medium text-foreground">
                  {stageName}
                </p>
              </>
            ) : (
              <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                {readOnlyMessage}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <CancelButton disabled={isStarting} onClick={onBack}>
              Back to Candidates
            </CancelButton>
            {!canMakeDecision &&
              !isApplicationRejected &&
              !isApplicationAccepted &&
              !isApplicationDropped &&
              hasActiveStage &&
              !isViewingActiveStage &&
              onGoToActiveStage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onGoToActiveStage}
                  disabled={isStarting}
                  className="h-10 rounded-full bg-card px-4 text-sm"
                >
                  Go to Active Stage
                </Button>
              )}
            {onStartStage && !startRestriction && isViewingActiveStage && (
              <SaveButton
                disabled={isStarting}
                isLoading={isStarting}
                onClick={onStartStage}
              >
                Start Stage
              </SaveButton>
            )}
            {canMakeDecision && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenConfirmation("reject")}
                  className="h-10 gap-1.5 rounded-full border-destructive/30 bg-card px-4 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <XCircle className="size-4" aria-hidden />
                  Fail / Reject Candidate
                </Button>
                <SaveButton
                  onClick={() => handleOpenConfirmation("advance")}
                  icon={
                    isFinalStage ? (
                      <CheckCircle2 className="size-4" aria-hidden />
                    ) : (
                      <ArrowRight className="size-4" aria-hidden />
                    )
                  }
                >
                  {isFinalStage
                    ? "Accept & Hire Candidate"
                    : "Pass & Advance Stage"}
                </SaveButton>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={confirmation !== null && canMakeDecision}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setConfirmation(null)
            setNotes("")
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto rounded-2xl bg-card p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border p-6 pr-12 pb-4">
            <DialogTitle className="text-base font-semibold">
              {isRejecting
                ? "Confirm Disqualification"
                : isFinalStage
                  ? "Confirm Final Acceptance"
                  : "Confirm Stage Pass"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {isRejecting
                ? "Reject this candidate at " +
                  stageName +
                  " and end their participation in this recruitment."
                : isFinalStage
                  ? "Mark this candidate as Accepted after completing all selection stages."
                  : "Mark " +
                    stageName +
                    " as Passed and advance the candidate to the next stage."}
            </DialogDescription>
          </DialogHeader>

          <form id={formId} onSubmit={handleConfirm} className="space-y-4 p-6">
            {isRejecting && (
              <div className="space-y-1.5">
                <Label
                  htmlFor={formId + "-reason"}
                  className="text-sm font-medium"
                >
                  Rejection Reason <span className="text-destructive">*</span>
                </Label>
                <Select
                  items={rejectionItems}
                  value={rejectionReason}
                  onValueChange={(value) => {
                    if (value) setRejectionReason(value)
                  }}
                >
                  <SelectTrigger
                    id={formId + "-reason"}
                    aria-required="true"
                    className="w-full rounded-full border-0 bg-muted px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary data-[size=default]:h-10"
                  >
                    <SelectValue placeholder="Select a rejection reason" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(100vw-2rem)] rounded-xl">
                    <SelectGroup>
                      {rejectionItems.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                          className="py-2 [&>span:first-child]:min-w-0 [&>span:first-child]:shrink"
                        >
                          <span className="whitespace-normal">
                            {item.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label
                htmlFor={formId + "-notes"}
                className="text-sm font-medium"
              >
                {isRejecting ? "Evaluation Notes" : "Stage Clearance Notes"}{" "}
                <span className="font-normal text-muted-foreground">
                  (Optional)
                </span>
              </Label>
              <Textarea
                id={formId + "-notes"}
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={
                  isRejecting
                    ? "Add context for this decision..."
                    : "Add notes about the candidate's stage evaluation..."
                }
                className="min-h-24 resize-y rounded-xl border-0 bg-muted px-4 py-3 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </form>

          <DialogFooter className="m-0 gap-2 border-t border-border bg-card px-6 py-4">
            <CancelButton onClick={() => setConfirmation(null)} />
            <SaveButton
              type="submit"
              form={formId}
              disabled={!canMakeDecision || (isRejecting && !rejectionReason)}
              icon={
                isRejecting ? (
                  <XCircle className="size-4" aria-hidden />
                ) : (
                  <CheckCircle2 className="size-4" aria-hidden />
                )
              }
              className={
                isRejecting
                  ? "bg-destructive hover:bg-destructive/90"
                  : undefined
              }
            >
              {isRejecting
                ? "Confirm Disqualification"
                : isFinalStage
                  ? "Confirm Acceptance"
                  : "Confirm Stage Pass"}
            </SaveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
