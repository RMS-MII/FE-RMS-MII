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
import { format, parseISO } from "date-fns"
import {
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import type { MyInterviewItem } from "../types"

export interface ConfirmAcceptInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: MyInterviewItem | null
  onConfirm: () => void
}

export function ConfirmAcceptInterviewDialog({
  open,
  onOpenChange,
  session,
  onConfirm,
}: ConfirmAcceptInterviewDialogProps) {
  if (!session) return null

  let startDate: Date | null = null
  let endDate: Date | null = null
  try {
    startDate = parseISO(session.scheduledStart)
    endDate = parseISO(session.scheduledEnd)
  } catch {
    // fallback
  }

  const hasCoInterviewers =
    session.coInterviewers && session.coInterviewers.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 bg-card overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle>Accept Interview Schedule</DialogTitle>
          <DialogDescription>
            Confirm your attendance for this interview session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6 max-h-[72vh] overflow-y-auto">
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
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/50 shrink-0">
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
          {/* Co-Interviewers Panel */}
          {hasCoInterviewers && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                <span>Interview Panel (Co-Interviewers)</span>
              </div>
              <div className="space-y-1.5 pt-0.5">
                {session.coInterviewers!.map((co) => (
                  <div
                    key={co.id}
                    className="flex items-center justify-between gap-2 text-xs border border-border rounded-full px-2.5 py-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {co.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-foreground block truncate">
                          {co.name}
                        </span>
                        {co.role && (
                          <span className="text-xs text-muted-foreground block truncate">
                            {co.role}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {co.status === "accepted" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="size-3" />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertCircle className="size-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground px-1 leading-relaxed">
            By accepting, you confirm your availability to conduct this session and submit the candidate evaluation score once finished.
          </p>
        </div>

        <DialogFooter className="px-9 pb-9 border-t border-border bg-card gap-2">
          <CancelButton onClick={() => onOpenChange(false)} />
          <Button
            type="button"
            onClick={onConfirm}
            className="h-10 border-none rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Check className="size-4" />
            Confirm Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
