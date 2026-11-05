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
import { CancelButton, DatePicker, TimePicker } from "@/shared/components"
import { format, parseISO } from "date-fns"
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
  ) => void
}

export function RequestRescheduleDialog({
  open,
  onOpenChange,
  session,
  onSubmitRequest,
}: RequestRescheduleDialogProps) {
  const [proposedDate, setProposedDate] = useState("")
  const [proposedStartTime, setProposedStartTime] = useState("10:00")
  const [proposedEndTime, setProposedEndTime] = useState("11:00")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open && session) {
      // Default proposed date to 1 day after current schedule
      try {
        const d = parseISO(session.scheduledStart)
        const nextDay = new Date(d)
        nextDay.setDate(nextDay.getDate() + 1)
        setProposedDate(format(nextDay, "yyyy-MM-dd"))
        setProposedStartTime(format(d, "HH:mm"))
        const endD = parseISO(session.scheduledEnd)
        setProposedEndTime(format(endD, "HH:mm"))
      } catch {
        setProposedDate("")
        setProposedStartTime("10:00")
        setProposedEndTime("11:00")
      }
      setReason("")
      setError("")
    }
  }, [open, session])

  if (!session) return null

  let currentStart: Date | null = null
  let currentEnd: Date | null = null
  try {
    currentStart = parseISO(session.scheduledStart)
    currentEnd = parseISO(session.scheduledEnd)
  } catch {
    // fallback
  }

  const handleSubmit = () => {
    if (!proposedDate) {
      setError("Please select a proposed date.")
      return
    }
    if (!proposedStartTime || !proposedEndTime) {
      setError("Please set both proposed start and end times.")
      return
    }
    if (proposedStartTime >= proposedEndTime) {
      setError("End time must be after start time.")
      return
    }
    if (!reason.trim()) {
      setError("Please provide a reason for the reschedule request.")
      return
    }

    const proposedStartISO = `${proposedDate}T${proposedStartTime}:00`
    const proposedEndISO = `${proposedDate}T${proposedEndTime}:00`

    onSubmitRequest(session.id, proposedStartISO, proposedEndISO, reason.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  ? format(currentStart, "EEE, dd MMM yyyy")
                  : session.scheduledStart}
              </span>
              <span className="font-mono">
                {currentStart && currentEnd
                  ? `• ${format(currentStart, "HH:mm")} – ${format(currentEnd, "HH:mm")} WIB`
                  : ""}
              </span>
            </div>
          </div>

          {/* Schedule Comparison / Proposed Schedule Picker */}
          <div className="space-y-3">
            <Label className="text-sm font-medium px-1 flex items-center gap-1.5 text-foreground">
              Proposed New Schedule
            </Label>

            {/* Proposed Date */}
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground font-medium px-1">
                Proposed Date <span className="text-destructive">*</span>
              </span>
              <DatePicker
                id="proposed-date"
                value={proposedDate}
                onChange={(val) => {
                  setProposedDate(val)
                  if (error) setError("")
                }}
                placeholder="Select new date..."
              />
            </div>

            {/* Proposed Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground font-medium px-1">
                  Start Time <span className="text-destructive">*</span>
                </span>
                <TimePicker
                  id="proposed-start-time"
                  value={proposedStartTime}
                  onChange={(val) => {
                    setProposedStartTime(val)
                    if (error) setError("")
                  }}
                  placeholder="hh:mm"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground font-medium px-1">
                  End Time <span className="text-destructive">*</span>
                </span>
                <TimePicker
                  id="proposed-end-time"
                  value={proposedEndTime}
                  onChange={(val) => {
                    setProposedEndTime(val)
                    if (error) setError("")
                  }}
                  minTime={proposedStartTime || undefined}
                  placeholder="hh:mm"
                />
              </div>
            </div>
          </div>

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
          <CancelButton onClick={() => onOpenChange(false)} />
          <Button
            type="button"
            onClick={handleSubmit}
            className="h-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white px-5 cursor-pointer inline-flex items-center gap-1.5 font-semibold text-xs shadow-xs"
          >
            <CalendarClock className="size-4" />
            Submit Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

