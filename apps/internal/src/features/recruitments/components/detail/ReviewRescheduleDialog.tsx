import { useState } from "react"
import { getApiError } from "@/shared/api/api-error"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { CancelButton } from "@/shared/components"
import { formatWibDate, formatWibTime } from "@/shared/lib/utcDateTime"
import type { InterviewSessionItem } from "../../types"
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calendar,
  Loader2,
} from "lucide-react"

export interface ReviewRescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: InterviewSessionItem | null
  onApprove: (
    sessionId: string,
    proposedStart: string,
    proposedEnd: string,
    notes?: string
  ) => void | Promise<void>
  onReject: (sessionId: string, notes: string) => void | Promise<void>
}

export function ReviewRescheduleDialog({
  open,
  onOpenChange,
  session,
  onApprove,
  onReject,
}: ReviewRescheduleDialogProps) {
  const [reviewNotes, setReviewNotes] = useState("")
  const [rejectError, setRejectError] = useState("")
  const [submittingDecision, setSubmittingDecision] = useState<"approve" | "reject" | null>(null)
  const isSubmitting = submittingDecision !== null

  if (!session || !session.rescheduleRequest) return null

  const req = session.rescheduleRequest

  const handleReview = async (decision: "approve" | "reject") => {
    if (isSubmitting) return
    if (decision === "reject" && !reviewNotes.trim()) {
      setRejectError(
        "Please provide a reason or note when rejecting a reschedule request."
      )
      return
    }
    if (reviewNotes.trim().length > 100) {
      setRejectError("Reviewer notes must be 100 characters or fewer.")
      return
    }
    setSubmittingDecision(decision)
    setRejectError("")
    try {
      if (decision === "approve") {
        await onApprove(
          session.id,
          req.proposedStart,
          req.proposedEnd,
          reviewNotes.trim()
        )
      } else {
        await onReject(session.id, reviewNotes.trim())
      }
      setReviewNotes("")
      onOpenChange(false)
    } catch (error) {
      setRejectError(
        getApiError(error, "Failed to review this request. Please try again.")
          .message
      )
    } finally {
      setSubmittingDecision(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-xl p-0">
        <DialogHeader className="border-b border-border p-6 pb-4 ">
          <div className="flex items-center gap-2">
            <DialogTitle>Review Reschedule Request</DialogTitle>
            <span className="rounded-md bg-amber-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-amber-800 dark:text-amber-300">
              Pending Review
            </span>
          </div>
          <DialogDescription>
            Candidate requested to adjust their interview time. Review the
            comparison below and make a decision. Approval updates this session
            immediately and requires confirmation of the new schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 px-6 pb-0">
          {/* Candidate Profile Summary */}
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/50 p-3.5">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {session.candidateName}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.candidateEmail}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {session.stageName}
              </span>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {session.codeApplication}
              </p>
            </div>
          </div>

          {/* Schedule Comparison Grid */}
          <div className="space-y-2">
            <Label className="px-1 text-sm font-medium">
              Schedule Comparison
            </Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Current Schedule */}
              <div className="space-y-1.5 rounded-2xl border border-border/80 bg-card p-3.5">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Current Schedule
                </span>
                <div className="flex items-center gap-2 pt-0.5 text-xs font-semibold text-foreground">
                  <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                  <span>{formatWibDate(session.scheduledStart, { weekday: "short" })}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                  <span>
                    {formatWibTime(session.scheduledStart)} –{" "}
                    {formatWibTime(session.scheduledEnd)} WIB
                  </span>
                </div>
              </div>

              {/* Proposed Schedule */}
              <div className="space-y-1.5 rounded-2xl border border-amber-300/80 bg-amber-50/60 p-3.5 dark:border-amber-800 dark:bg-amber-950/30">
                <span className="flex items-center gap-1 text-[11px] font-semibold tracking-wider text-amber-800 uppercase dark:text-amber-300">
                  <span>Proposed Schedule</span>
                  <ArrowRight className="size-3" />
                </span>
                <div className="flex items-center gap-2 pt-0.5 text-xs font-semibold text-amber-950 dark:text-amber-100">
                  <Calendar className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{formatWibDate(req.proposedStart, { weekday: "short" })}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <Clock className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    {formatWibTime(req.proposedStart)} –{" "}
                    {formatWibTime(req.proposedEnd)} WIB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Reason Quote Box */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 px-1 text-sm font-medium">
              <AlertTriangle className="size-3.5 text-amber-600" />
              <span>Candidate's Reason</span>
            </Label>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3.5 text-xs leading-relaxed text-amber-950 italic dark:bg-amber-950/20 dark:text-amber-200">
              "{req.reason}"
            </div>
          </div>

          {/* Reviewer Note */}
          <div className="space-y-1.5">
            <Label htmlFor="review-note" className="px-1 text-sm font-medium">
              Reviewer Notes
            </Label>
            <Textarea
              id="review-note"
              placeholder="Add review notes (e.g. Schedule confirmed with interviewers)..."
              rows={2}
              maxLength={100}
              disabled={isSubmitting}
              aria-invalid={Boolean(rejectError)}
              aria-describedby={rejectError ? "review-note-error" : undefined}
              value={reviewNotes}
              onChange={(e) => {
                setReviewNotes(e.target.value)
                if (rejectError) setRejectError("")
              }}
              className="min-h-18 resize-y rounded-2xl border-0 bg-muted px-4 py-2.5 text-xs text-foreground shadow-none outline-none placeholder:text-muted-foreground focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary"
            />
            {rejectError && (
              <p
                id="review-note-error"
                role="alert"
                className="px-1 text-xs text-destructive"
              >
                {rejectError}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-2 border-t border-border bg-card">
          <CancelButton
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => void handleReview("reject")}
            className="h-10 cursor-pointer gap-1.5 rounded-full border-rose-300 bg-rose-50 px-4 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/50"
          >
            {submittingDecision === "reject" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <XCircle className="size-4" />}
            <span>{submittingDecision === "reject" ? "Declining..." : "Decline"}</span>
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleReview("approve")}
            className="h-10 cursor-pointer gap-1.5 rounded-full border-0 bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            {submittingDecision === "approve" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CheckCircle2 className="size-4" />}
            <span>{submittingDecision === "approve" ? "Approving..." : "Approve Request"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
