import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CancelButton, SaveButton } from "@/shared/components"

interface StartApplicationStageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  stageName: string
  isTest: boolean
  isSubmitting: boolean
  disabled: boolean
  error: string | null
  onConfirm: () => void
}

export function StartApplicationStageDialog({
  open,
  onOpenChange,
  candidateName,
  stageName,
  isTest,
  isSubmitting,
  disabled,
  error,
  onConfirm,
}: StartApplicationStageDialogProps) {
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
            Start next stage
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Start the next eligible selection stage for {candidateName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 p-6 text-sm">
          <p className="font-medium text-foreground">{stageName}</p>
          <p className="leading-relaxed text-muted-foreground">
            The next stage is determined by the application progress and the
            configured stage sequence.
          </p>
          {isTest && (
            <p className="leading-relaxed text-muted-foreground">
              Starting this test stage also triggers the candidate invitation
              email.
            </p>
          )}
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
            disabled={disabled || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Starting..."
            onClick={onConfirm}
          >
            Start Stage
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
