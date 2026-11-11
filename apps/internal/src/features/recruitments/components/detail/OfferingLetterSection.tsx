import { useState, type FormEvent } from "react"
import { ExternalLink, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { CancelButton, SaveButton } from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import { useUploadOfferingLetterMutation } from "../../api/applications-api"
import type { CandidateApplicationDetailItem } from "../../types"

function isPending(status: string | null | undefined) {
  const normalized = String(status ?? "").toLowerCase()
  return normalized === "pending" || normalized === "1"
}

export function OfferingLetterSection({
  application,
  readOnly = false,
}: {
  application: CandidateApplicationDetailItem
  readOnly?: boolean
}) {
  const [url, setUrl] = useState(application.fileOfferingLetter ?? "")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [uploadOfferingLetter, { isLoading }] =
    useUploadOfferingLetterMutation()

  const canManageOffering =
    application.status === "accepted" &&
    application.finalStatus === "accepted" &&
    isPending(application.offeringLetterStatus)

  if (readOnly) {
    return application.fileOfferingLetter ? (
      <section className="space-y-2 border-b border-border p-6" aria-labelledby="offering-letter-title">
        <h2 id="offering-letter-title" className="text-base font-semibold text-foreground">
          Offering Letter
        </h2>
        <a
          href={application.fileOfferingLetter}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 break-all text-sm font-medium text-primary hover:underline"
        >
          Open current offering letter
          <ExternalLink className="size-4 shrink-0" aria-hidden />
        </a>
      </section>
    ) : null
  }

  if (!canManageOffering) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError(null)
    setRequestError(null)
    setSuccessMessage(null)

    if (!url.trim() || url.trim().length > 500) {
      setValidationError("Enter an offering letter link of 500 characters or fewer.")
      return
    }
    try {
      const parsed = new URL(url.trim())
      if (parsed.protocol !== "https:" || !parsed.hostname) throw new Error()
    } catch {
      setValidationError("The link must be an absolute HTTPS URL.")
      return
    }

    setIsConfirmOpen(true)
  }

  const handleConfirmSend = async () => {
    setRequestError(null)
    try {
      const result = await uploadOfferingLetter({
        applicationId: application.id,
        fileOfferingLetter: url.trim(),
      }).unwrap()
      setUrl(result.fileOfferingLetter ?? url.trim())
      setIsConfirmOpen(false)
      setSuccessMessage("Offering letter link saved and sent to the candidate.")
    } catch (error) {
      setRequestError(
        getApiError(error, "Unable to send the offering letter. Please try again.")
          .message
      )
    }
  }

  return (
    <section className="space-y-4 border-b border-border p-6" aria-labelledby="offering-letter-title">
      <div className="space-y-1">
        <h2 id="offering-letter-title" className="text-base font-semibold text-foreground">
          Offering Letter
        </h2>
        <p className="text-sm text-muted-foreground">
          Add or update the HTTPS link. Saving sends the link to the candidate by email.
        </p>
      </div>

      {application.fileOfferingLetter && (
        <a
          href={application.fileOfferingLetter}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 break-all text-sm font-medium text-primary hover:underline"
        >
          <span>Open current offering letter</span>
          <ExternalLink className="size-4 shrink-0" aria-hidden />
        </a>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor="offering-letter-url">Offering letter HTTPS URL</Label>
          <Input
            id="offering-letter-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            maxLength={500}
            disabled={isLoading}
            placeholder="https://drive.google.com/file/..."
            aria-invalid={Boolean(validationError)}
          />
          {validationError && (
            <p role="alert" className="text-xs text-destructive">{validationError}</p>
          )}
        </div>
        <SaveButton type="submit" disabled={isLoading || !url.trim()} icon={<Mail className="size-4" aria-hidden />}>
          Save &amp; Send
        </SaveButton>
      </form>

      {requestError && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {requestError}
        </p>
      )}
      {successMessage && (
        <p role="status" className="text-sm text-success">{successMessage}</p>
      )}

      <Dialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!isLoading) setIsConfirmOpen(open)
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send offering letter?</DialogTitle>
            <DialogDescription>
              This will email the offering letter link to {application.candidateName}.
            </DialogDescription>
          </DialogHeader>
          <p className="break-all rounded-xl bg-muted p-3 text-sm text-foreground">{url.trim()}</p>
          {requestError && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
              {requestError}
            </p>
          )}
          <DialogFooter>
            <CancelButton disabled={isLoading} onClick={() => setIsConfirmOpen(false)} />
            <Button
              type="button"
              onClick={() => void handleConfirmSend()}
              disabled={isLoading}
              className="h-10 rounded-full"
            >
              {isLoading ? "Sending..." : "Confirm & Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
