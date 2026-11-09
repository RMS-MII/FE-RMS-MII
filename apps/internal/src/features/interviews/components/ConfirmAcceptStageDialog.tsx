import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CancelButton, SaveButton } from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import { safeFormatDate } from "@/shared/lib/format"
import { Check } from "lucide-react"
import type { StageInvitationItem } from "../types"

export interface ConfirmAcceptStageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: StageInvitationItem
  onConfirm: () => Promise<void>
}

export function ConfirmAcceptStageDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: ConfirmAcceptStageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const handleConfirm = async () => {
    if (isSubmitting) return
    setError(null)
    setIsSubmitting(true)
    try {
      await onConfirm()
    } catch (error) {
      setError(
        getApiError(
          error,
          "Failed to accept this invitation. Please try again."
        ).message
      )
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto rounded-2xl bg-card p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border p-6 pr-12 pb-4">
          <DialogTitle className="text-base font-semibold">
            Accept stage invitation
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Confirm your assignment as an interviewer for this selection stage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">
                Recruitment batch
              </dt>
              <dd className="font-medium text-foreground">
                {item.recruitmentName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Selection stage</dt>
              <dd className="font-medium text-foreground">{item.stageName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Period</dt>
              <dd className="text-foreground">
                {safeFormatDate(item.startDate)} –{" "}
                {safeFormatDate(item.endDate)}
              </dd>
            </div>
          </dl>
          <p className="text-sm leading-relaxed text-muted-foreground">
            HR can schedule interview sessions with you after you accept this
            assignment.
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft p-3 text-sm text-danger"
            >
              {error}
            </p>
          )}
        </div>
        <DialogFooter className="m-0 gap-2 border-t border-border bg-card px-6 py-4">
          <CancelButton
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          />
          <SaveButton
            icon={<Check className="size-4" aria-hidden />}
            isLoading={isSubmitting}
            loadingText="Accepting..."
            onClick={() => void handleConfirm()}
          >
            Accept invitation
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
