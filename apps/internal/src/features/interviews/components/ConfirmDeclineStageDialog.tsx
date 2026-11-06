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
import type { StageInvitationItem } from "../types"

export interface ConfirmDeclineStageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: StageInvitationItem | null
  onConfirm: (reason: string) => void
}

export function ConfirmDeclineStageDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: ConfirmDeclineStageDialogProps) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open) {
      setReason("")
    }
  }, [open, item])

  if (!item) return null

  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 bg-card overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle>Decline Stage Interviewer Role</DialogTitle>
          <DialogDescription>
            Provide a reason why you cannot take on this stage assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl bg-muted/60 p-4 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground text-sm truncate">
                {item.recruitmentName}
              </span>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {item.department}
              </span>
            </div>
            <div className="text-muted-foreground">
              <span>Stage: </span>
              <strong className="text-foreground font-medium">{item.stageName}</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stage-decline-reason" className="text-sm font-medium px-1">
              Decline Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="stage-decline-reason"
              placeholder="Briefly explain why you cannot participate in this recruitment stage..."
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
            className="h-10 rounded-full px-5 cursor-pointer"
          >
            Confirm Decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
