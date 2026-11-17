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
import { InterviewRescheduleFields, type InterviewRescheduleSchedule } from "@workspace/ui/components/interview-reschedule-fields"
import { formatWibDate, formatWibTime, getWibDateKey, parseUtcDateTime, wibToUtcISOString } from "@/shared/lib/utcDateTime"
import { CalendarClock } from "lucide-react"
import type { MyInterviewItem } from "../types"


export interface RequestRescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: MyInterviewItem | null
  onSubmitRequest: (
    sessionId: string,
    proposedStart: string,
    proposedEnd: string,
    reason: string
  ) => void | Promise<void>
  isSubmitting?: boolean
}

export function RequestRescheduleDialog({
  open,
  onOpenChange,
  session,
  onSubmitRequest,
  isSubmitting = false,
}: RequestRescheduleDialogProps) {
  const [schedule, setSchedule] = useState<InterviewRescheduleSchedule>({ date: "", startTime: "", endTime: "" })
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  // Reset the draft each time a different server session is opened for rescheduling.
  useEffect(() => {
    if (open && session) {
      // Default proposed date to 1 day after current schedule
      try {
        const d = parseUtcDateTime(session.scheduledStart)
        const nextDay = new Date(d)
        nextDay.setUTCDate(nextDay.getUTCDate() + 1)
        // This effect intentionally initializes the dialog draft from the selected session.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSchedule({
          date: getWibDateKey(nextDay),
          startTime: formatWibTime(d),
          endTime: formatWibTime(session.scheduledEnd),
        })
      } catch {
        setSchedule({ date: "", startTime: "", endTime: "" })
      }
      setReason("")
      setError("")
    }
  }, [open, session])

  if (!session) return null

  let currentStart: Date | null = null
  let currentEnd: Date | null = null
  try {
    currentStart = parseUtcDateTime(session.scheduledStart)
    currentEnd = parseUtcDateTime(session.scheduledEnd)
  } catch {
    // fallback
  }

  const handleSubmit = async () => {
    if (!schedule.date || !schedule.startTime || !schedule.endTime) {
      setError("Select a date, start time, and end time.")
      return
    }
    if (!reason.trim()) {
      setError("Please provide a reason for the reschedule request.")
      return
    }
    if (reason.trim().length > 100) {
      setError("Reason must be 100 characters or fewer.")
      return
    }

    const proposedStart = new Date(wibToUtcISOString(schedule.date, schedule.startTime))
    const proposedEnd = new Date(wibToUtcISOString(schedule.date, schedule.endTime))
    if (proposedStart <= new Date()) {
      setError("Proposed schedule must be in the future.")
      return
    }
    if (proposedEnd <= proposedStart) {
      setError("End time must be after start time.")
      return
    }

    setError("")
    try {
      await onSubmitRequest(
        session.sessionId,
        proposedStart.toISOString(),
        proposedEnd.toISOString(),
        reason.trim()
      )
      onOpenChange(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit the request.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isSubmitting) onOpenChange(nextOpen) }}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 bg-card overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <DialogTitle>Request Interview Reschedule</DialogTitle>
          </div>
          <DialogDescription>
            Propose a new schedule time for this candidate interview. HR will review and notify the candidate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6 max-h-[72vh] overflow-y-auto">
          {/* Current Schedule Summary */}
          <div className="rounded-2xl border border-border/70 bg-muted/60 p-3.5 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-foreground text-sm">
                  {session.candidateName}
                </span>
                <p className="text-muted-foreground text-[11px]">
                  {session.recruitmentName} • {session.stageName}
                </p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/50 shrink-0">
                {session.isOnline ? "Online" : "Onsite"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] pt-1.5 border-t border-border/50">
              <span className="font-medium text-foreground">
                {currentStart
                  ? formatWibDate(currentStart, { weekday: "short" })
                  : session.scheduledStart}
              </span>
              <span className="font-mono">
                {currentStart && currentEnd
                  ? `• ${formatWibTime(currentStart)} – ${formatWibTime(currentEnd)} WIB`
                  : ""}
              </span>
            </div>
          </div>

          <InterviewRescheduleFields
            id="interviewer-reschedule"
            value={schedule}
            disabled={isSubmitting}
            onChange={(value) => {
              setSchedule(value)
              setError("")
            }}
          />

          {/* Reason Input */}
          <div className="space-y-1.5">
            <Label htmlFor="reschedule-reason" className="text-sm font-medium px-1">
              Reason for Reschedule <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reschedule-reason"
              placeholder="Explain why you need to reschedule this interview session..."
              rows={3}
              value={reason}
              maxLength={100}
              disabled={isSubmitting}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError("")
              }}
              className="min-h-20 rounded-2xl border-0 bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none resize-y"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive px-1 font-medium">{error}</p>
          )}
        </div>

        <DialogFooter className="px-9 pb-9 border-t border-border bg-card gap-2">
          <CancelButton disabled={isSubmitting} onClick={() => onOpenChange(false)} />
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
            className="h-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white px-5 cursor-pointer inline-flex items-center gap-1.5 font-semibold text-xs shadow-xs"
          >
            <CalendarClock className="size-4" />
            {isSubmitting ? "Submitting..." : "Submit Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

