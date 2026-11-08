import { useId } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
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
import { CancelButton, SaveButton } from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import {
  declineStageSchema,
  type DeclineStageValues,
} from "../schemas/invitation-response"
import type { StageInvitationItem } from "../types"

export interface ConfirmDeclineStageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: StageInvitationItem
  onConfirm: (note: string) => Promise<void>
}

export function ConfirmDeclineStageDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: ConfirmDeclineStageDialogProps) {
  const formId = useId()
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<DeclineStageValues>({
    resolver: zodResolver(declineStageSchema),
    defaultValues: { note: "" },
    mode: "onChange",
  })
  const submit = handleSubmit(async (values) => {
    clearErrors("root")
    try {
      await onConfirm(values.note)
    } catch (error) {
      const problem = getApiError(
        error,
        "Failed to decline this invitation. Please try again."
      )
      const noteErrors = Object.entries(problem.fieldErrors)
        .filter(([field]) => field.toLowerCase() === "note")
        .flatMap(([, messages]) => messages)
      if (noteErrors.length)
        setError("note", { type: "server", message: noteErrors.join(" ") })
      else setError("root.server", { type: "server", message: problem.message })
    }
  })
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
            Decline stage invitation
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Provide a reason why you cannot take on this stage assignment.
          </DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          onSubmit={submit}
          className="space-y-4 p-6"
          aria-busy={isSubmitting}
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {item.recruitmentName}
            </p>
            <p className="text-sm text-muted-foreground">{item.stageName}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + "-note"} className="text-sm font-medium">
              Decline reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={formId + "-note"}
              {...register("note")}
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={Boolean(errors.note)}
              aria-describedby={
                formId +
                "-note-help" +
                (errors.note ? " " + formId + "-note-error" : "")
              }
              placeholder="Explain why you cannot participate in this stage..."
              className="min-h-24 resize-y rounded-xl border-0 bg-muted px-4 py-3 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            <p
              id={formId + "-note-help"}
              className="text-xs text-muted-foreground"
            >
              Required, up to 500 characters
            </p>
            {errors.note && (
              <p
                id={formId + "-note-error"}
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.note.message}
              </p>
            )}
          </div>
          {errors.root?.server && (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft p-3 text-sm text-danger"
            >
              {errors.root.server.message}
            </p>
          )}
        </form>
        <DialogFooter className="m-0 gap-2 border-t border-border bg-card px-6 py-4">
          <CancelButton
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          />
          <SaveButton
            type="submit"
            form={formId}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            loadingText="Declining..."
            icon={<X className="size-4" aria-hidden />}
            className="bg-destructive hover:bg-destructive/90"
          >
            Decline invitation
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
