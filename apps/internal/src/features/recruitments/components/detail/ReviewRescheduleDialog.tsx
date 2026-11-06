import { useState } from "react"
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
import { format, parseISO } from "date-fns"
import type { InterviewSessionItem } from "../../types"
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calendar,
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
  ) => void
  onReject: (sessionId: string, notes: string) => void
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

  if (!session || !session.rescheduleRequest) return null

  const req = session.rescheduleRequest

  // Format current and proposed datetimes
  const currentStart = parseISO(session.scheduledStart)
  const currentEnd = parseISO(session.scheduledEnd)
  const proposedStart = parseISO(req.proposedStart)
  const proposedEnd = parseISO(req.proposedEnd)

  const handleApprove = () => {
    onApprove(session.id, req.proposedStart, req.proposedEnd, reviewNotes.trim())
    setReviewNotes("")
    setRejectError("")
    onOpenChange(false)
  }

  const handleReject = () => {
    if (!reviewNotes.trim()) {
      setRejectError("Please provide a reason or note when rejecting a reschedule request.")
      return
    }
    onReject(session.id, reviewNotes.trim())
    setReviewNotes("")
    setRejectError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Review Reschedule Request</DialogTitle>
            <span className="font-mono text-xs font-semibold rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 px-2 py-0.5">
              Pending Review
            </span>
          </div>
          <DialogDescription>
            Candidate requested to adjust their interview time. Review the comparison below and make a decision.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Candidate Profile Summary */}
          <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-3.5 border border-border/60">
            <div>
              <p className="font-semibold text-sm text-foreground">
                {session.candidateName}
              </p>
              <p className="text-xs text-muted-foreground">{session.candidateEmail}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {session.stageName}
              </span>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                {session.codeApplication}
              </p>
            </div>
          </div>

          {/* Schedule Comparison Grid */}
          <div className="space-y-2">
            <Label className="text-sm font-medium px-1">Schedule Comparison</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Current Schedule */}
              <div className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Schedule
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground pt-0.5">
                  <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                  <span>{format(currentStart, "EEE, dd MMM yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5 text-muted-foreground shrink-0" />
                  <span>
                    {format(currentStart, "HH:mm")} – {format(currentEnd, "HH:mm")}
                  </span>
                </div>
              </div>

              {/* Proposed Schedule */}
              <div className="rounded-2xl border border-amber-300/80 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-800 p-3.5 space-y-1.5">
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <span>Proposed Schedule</span>
                  <ArrowRight className="size-3" />
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-950 dark:text-amber-100 pt-0.5">
                  <Calendar className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{format(proposedStart, "EEE, dd MMM yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <Clock className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    {format(proposedStart, "HH:mm")} – {format(proposedEnd, "HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Reason Quote Box */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium px-1 flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-amber-600" />
              <span>Candidate's Reason</span>
            </Label>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 text-xs text-amber-950 dark:text-amber-200 italic leading-relaxed">
              "{req.reason}"
            </div>
          </div>

          {/* Reviewer Note */}
          <div className="space-y-1.5">
            <Label htmlFor="review-note" className="text-sm font-medium px-1">
              Reviewer Notes
            </Label>
            <Textarea
              id="review-note"
              placeholder="Add review notes (e.g. Schedule confirmed with interviewers)..."
              rows={2}
              value={reviewNotes}
              onChange={(e) => {
                setReviewNotes(e.target.value)
                if (rejectError) setRejectError("")
              }}
              className="min-h-18 rounded-2xl border-0 bg-muted px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none resize-y"
            />
            {rejectError && (
              <p className="text-xs text-destructive px-1">{rejectError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <CancelButton onClick={() => onOpenChange(false)} />
          <Button
            type="button"
            variant="outline"
            onClick={handleReject}
            className="h-10 gap-1.5 rounded-full border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/50 cursor-pointer text-xs font-semibold px-4"
          >
            <XCircle className="size-4" />
            <span>Decline</span>
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            className="h-10 gap-1.5 rounded-full border-0 bg-primary px-5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="size-4" />
            <span>Approve Request</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

