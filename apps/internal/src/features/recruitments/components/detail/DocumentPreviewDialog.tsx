import { ExternalLink } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

export type DocumentPreviewKind = "cv" | "portfolio"

export interface DocumentPreviewState {
  open: boolean
  kind: DocumentPreviewKind
  candidateName: string
  value: string | null | undefined
}

export const emptyDocumentPreviewState: DocumentPreviewState = {
  open: false,
  kind: "cv",
  candidateName: "",
  value: null,
}

function getWebUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null
  } catch {
    return null
  }
}

interface DocumentPreviewDialogProps {
  state: DocumentPreviewState
  onOpenChange: (open: boolean) => void
}

export function DocumentPreviewDialog({
  state,
  onOpenChange,
}: DocumentPreviewDialogProps) {
  const { open, kind, candidateName, value } = state
  const label = kind === "cv" ? "CV" : "Portfolio"
  const url = getWebUrl(value)
  const hasValue = Boolean(value && String(value).trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border p-6 pr-12 pb-4">
          <DialogTitle className="text-base font-semibold">
            {label} Preview
            {candidateName ? ` · ${candidateName}` : ""}
          </DialogTitle>
          <DialogDescription>
            {hasValue
              ? url
                ? "Document preview. If it doesn't display, open it in a new tab."
                : "A document value is available, but it is not a web link that can be previewed."
              : `No ${label} is available for this candidate.`}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto p-6">
          {!hasValue ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center text-sm text-muted-foreground">
              No {label} to display.
            </div>
          ) : url ? (
            <div className="space-y-3">
              <iframe
                src={url}
                title={`${label} Preview ${candidateName}`.trim()}
                className="h-[60vh] w-full rounded-xl border border-border bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Some sites restrict embedding in an iframe. Use the
                “Open in new tab” button if the preview is blank.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{label} Data</p>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm break-all whitespace-pre-wrap text-muted-foreground">
                {String(value)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border bg-card px-6 py-4 sm:justify-between">
          <div>
            {url ? (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 rounded-full"
                nativeButton={false}
                render={<a href={url} target="_blank" rel="noreferrer" />}
              >
                <ExternalLink className="size-4" aria-hidden />
                Open in new tab
              </Button>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}