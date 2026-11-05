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
import { Clock } from "lucide-react"
import type { MyInterviewItem } from "../types"

export interface ConfirmDeclineInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: MyInterviewItem | null
  onConfirm: (reason: string) => void
}

export function ConfirmDeclineInterviewDialog({
  open,
  onOpenChange,
  session,
  onConfirm,
}: ConfirmDeclineInterviewDialogProps) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open) {
      setReason("")
    }
  }, [open, session])

  if (!session) return null

  let startDate: Date | null = null
  let endDate: Date | null = null
  try {
    startDate = parseISO(session.scheduledStart)
    endDate = parseISO(session.scheduledEnd)
  } catch {
    // fallback
  }

  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 bg-card overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle>Decline Interview Schedule</DialogTitle>
          <DialogDescription>
            Provide a reason why you cannot attend this scheduled interview session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          {/* Summary card */}
          <div className="rounded-2xl bg-muted/60 p-4 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-foreground text-sm">
                  {session.candidateName}
                </span>
                <p className="text-muted-foreground text-[11px]">
                  {session.recruitmentName} • {session.stageName}
                </p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/50 shrink-0">
                {session.isOnline ? "Online" : "Onsite"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px] pt-1 border-t border-border/40">
              <Clock className="size-3 text-primary" />
              <span>
                {startDate
                  ? format(startDate, "EEE, dd MMM yyyy")
                  : session.scheduledStart}
              </span>
              <span>
                {startDate && endDate
                  ? `• ${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")} WIB`
                  : ""}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interview-decline-reason" className="text-sm font-medium px-1">
              Decline Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="interview-decline-reason"
              placeholder="Explain why you cannot attend this interview session..."
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-20 rounded-2xl border-0 bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none resize-y"
            />
          </div>
        </div>

        <DialogFooter className="px-9 pb-9 border-t border-border bg-card gap-2">
          <CancelButton onClick={() => onOpenChange(false)} />
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="h-10 border-none rounded-full px-5 cursor-pointer"
          >
            Confirm Decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

