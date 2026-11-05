import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { CancelButton } from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
import { Briefcase, Layers, Calendar, Check } from "lucide-react"
import type { StageInvitationItem } from "../types"

export interface ConfirmAcceptStageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: StageInvitationItem | null
  onConfirm: () => void
}

export function ConfirmAcceptStageDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: ConfirmAcceptStageDialogProps) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 bg-card overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle>Accept Stage Interviewer Role</DialogTitle>
          <DialogDescription>
            Confirm your assignment as an interviewer for this selection stage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl bg-muted/60 p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-medium text-foreground text-sm">
              <Briefcase className="size-4 text-primary shrink-0" />
              <span className="truncate">{item.recruitmentName}</span>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/50 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="size-3.5 shrink-0" />
                <span>
                  Stage: <strong className="text-foreground">{item.stageName}</strong>
                </span>
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {item.department}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              <span>
                Period: <strong className="text-foreground font-medium">{safeFormatDate(item.startDate)} – {safeFormatDate(item.endDate)}</strong>
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground px-1 leading-relaxed">
            By accepting, you will be registered as an active interviewer. HR will be able to schedule candidate interview sessions with you during this stage period.
          </p>
        </div>

        <DialogFooter className="px-9 pb-9 border-t border-border bg-card gap-2">
          <CancelButton onClick={() => onOpenChange(false)} />
          <Button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Check className="size-4" />
            Confirm Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
