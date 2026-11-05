import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { CancelButton } from "@/shared/components"
import { format, parseISO } from "date-fns"
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { MyInterviewItem } from "../types"

export interface AcceptDeclineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: MyInterviewItem | null
  onAccept: (sessionId: string) => void
  onDecline: (sessionId: string, reason: string) => void
}

export function AcceptDeclineDialog({
  open,
  onOpenChange,
  session,
  onAccept,
  onDecline,
}: AcceptDeclineDialogProps) {
  const [decisionMode, setDecisionMode] = useState<"accept" | "decline">("accept")
  const [declineReason, setDeclineReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset decision mode & reason whenever dialog opens or session changes
  useEffect(() => {
    if (open) {
      setDecisionMode("accept")
      setDeclineReason("")
      setIsSubmitting(false)
    }
  }, [open, session])

  if (!session) return null

  let startDate: Date | null = null
  let endDate: Date | null = null
  try {
    startDate = parseISO(session.scheduledStart)
    endDate = parseISO(session.scheduledEnd)
  } catch {
    // fallback if parsing fails
  }

  const handleConfirmAction = () => {
    setIsSubmitting(true)
    if (decisionMode === "accept") {
      onAccept(session.id)
      onOpenChange(false)
    } else {
      if (!declineReason.trim()) {
        setIsSubmitting(false)
        return
      }
      onDecline(session.id, declineReason.trim())
      onOpenChange(false)
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border text-left">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <span>Interview Assignment</span>
            <span>•</span>
            <span>{session.recruitmentBatchCode}</span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground mt-1">
            Confirm Interview Attendance
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Review candidate summary and schedule time before accepting or declining this interview invitation.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Candidate & Vacancy Brief Card */}
          <div className="rounded-xl bg-muted/60 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    {session.candidateName}
                  </h4>
                  <p className="text-xs text-muted-foreground">{session.candidateEmail}</p>
                </div>
              </div>

              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary shrink-0">
                {session.stageName}
              </span>
            </div>

            {/* Candidate quick metrics */}
            {session.candidateSummary && (
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                {session.candidateSummary.currentJobTitle && (
                  <span className="inline-flex items-center gap-1">
                    {session.candidateSummary.currentJobTitle} ({session.candidateSummary.yearsOfExperience ?? 0} yrs exp)
                  </span>
                )}
                {session.candidateSummary.education && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="size-3 text-muted-foreground" />
                    {session.candidateSummary.education}
                    {session.candidateSummary.gpa ? ` • GPA ${session.candidateSummary.gpa}` : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Schedule & Logistics Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Time Slot */}
            <div className="rounded-xl border border-border/70 p-3 bg-card space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                Schedule Time
              </span>
              <p className="font-semibold text-foreground text-sm">
                {startDate ? format(startDate, "EEEE, dd MMM yyyy") : session.scheduledStart}
              </p>
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="size-3" />
                {startDate && endDate
                  ? `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")} WIB`
                  : "Time to be determined"}
              </p>
            </div>

            {/* Mode & Venue */}
            <div className="rounded-xl border border-border/70 p-3 bg-card space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                Interview Venue
              </span>
              <p className="font-semibold text-foreground text-sm">
                {session.isOnline ? "Virtual" : "Onsite Office"}
              </p>
              {session.isOnline && session.meetingUrl ? (
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono truncate max-w-full"
                >
                  <span className="truncate">{session.meetingUrl}</span>
                  <ExternalLink className="size-2.5 shrink-0" />
                </a>
              ) : (
                <p className="text-xs text-muted-foreground truncate">
                  {session.location || "Office Meeting Room"}
                </p>
              )}
            </div>
          </div>

          {/* Decision Mode Selection */}
          <div className="space-y-3 pt-1">
            <Label className="text-xs font-semibold text-foreground">
              Your Response:
            </Label>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Accept Option Card */}
              <button
                type="button"
                onClick={() => setDecisionMode("accept")}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                  decisionMode === "accept"
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600/30"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                    decisionMode === "accept"
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-foreground">Accept Invitation</h5>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Confirm availability to attend
                  </p>
                </div>
              </button>

              {/* Decline Option Card */}
              <button
                type="button"
                onClick={() => setDecisionMode("decline")}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                  decisionMode === "decline"
                    ? "border-rose-600 bg-rose-500/10 text-rose-950 dark:text-rose-200 ring-2 ring-rose-600/30"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                    decisionMode === "decline"
                      ? "bg-rose-600 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <XCircle className="size-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-foreground">Decline Invitation</h5>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Cannot attend this schedule
                  </p>
                </div>
              </button>
            </div>

            {/* Dynamic Content: Accept vs Decline */}
            {decisionMode === "accept" ? (
              <div className="rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-900  flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Ready to interview this candidate?</p>
                  <p className="text-[11px] opacity-90">
                    By accepting, this interview assignment will be confirmed. You will be able to join the room and submit your assessment score once the session finishes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl bg-rose-50/70 p-3.5 ">
                <div className="flex items-start gap-2 text-rose-800 dark:text-rose-300 text-xs">
                  <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-tight">
                    Please state the reason you cannot attend. HR will immediately be notified so they can assign a replacement panelist or reschedule.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="decline-reason" className="text-xs font-semibold text-foreground">
                    Reason for Declining <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="decline-reason"
                    rows={3}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Provide details on why you are unavailable..."
                    className="text-xs bg-card resize-none rounded-xl border border-border"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-9 pb-9 border-t border-border bg-card gap-2">
          <CancelButton
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </CancelButton>

          {decisionMode === "accept" ? (
            <Button
              type="button"
              onClick={handleConfirmAction}
              disabled={isSubmitting}
              className="h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 cursor-pointer shadow-xs gap-1.5"
            >
              <CheckCircle2 className="size-4" />
              <span>Confirm & Accept</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmAction}
              disabled={isSubmitting || !declineReason.trim()}
              className="h-10 rounded-full font-medium px-5 cursor-pointer shadow-xs gap-1.5"
            >
              <XCircle className="size-4" />
              <span>Submit Decline</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

