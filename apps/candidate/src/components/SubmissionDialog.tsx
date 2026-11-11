import { useRef, useState, type FormEvent } from "react"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { date, request, safeUrl, type Session } from "../api"
import { prefix } from "../route"

export function SubmissionDialog({
  session,
  onClose,
  refresh,
}: {
  session: Session
  onClose: () => void
  refresh: () => Promise<void>
}) {
  const [link, setLink] = useState(session.fileSubmission || "")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const lock = useRef(false)
  const material = safeUrl(session.fileTakeHome)
  const submitted = safeUrl(session.fileSubmission)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError("")
    setMessage("")
    try {
      await request(`${prefix}/sessions/${session.id}/submission`, {
        fileSubmission: link.trim(),
      })
      setMessage("Your submission link was saved.")
      await refresh()
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save your submission. Try again."
      )
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent
        className="portal-dialog max-h-[90dvh] overflow-y-auto rounded-2xl p-6 sm:max-w-lg"
        showCloseButton={!busy}
        finalFocus={() => document.getElementById(`submission-${session.id}`)}
      >
        <DialogHeader>
          <DialogTitle>Take-home submission</DialogTitle>
          <DialogDescription>{session.sessionName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <dl>
            <dt className="text-muted-foreground">Submission deadline</dt>
            <dd className="mt-1 font-medium">
              {date(session.endedSubmissionAt)}
            </dd>
          </dl>
          {material ? (
            <a
              className="text-link"
              href={material}
              target="_blank"
              rel="noreferrer"
            >
              Open materials <ArrowUpRight size={15} />
            </a>
          ) : (
            <p className="text-muted-foreground">
              See your assignment email for materials and instructions.
            </p>
          )}
          {submitted && (
            <p>
              <a
                className="text-link"
                href={submitted}
                target="_blank"
                rel="noreferrer"
              >
                View submitted work <ArrowUpRight size={15} />
              </a>
            </p>
          )}
        </div>
        <form
          className="space-y-4 text-sm"
          onSubmit={(event) => void submit(event)}
        >
          {session.canUploadSubmission ? (
            <div className="space-y-2">
              <label className="font-medium" htmlFor="submission-url">
                Google Drive link
              </label>
              <Input
                id="submission-url"
                type="url"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value)
                  setError("")
                  setMessage("")
                }}
                required
                maxLength={200}
                disabled={busy}
                placeholder="https://drive.google.com/…"
              />
              <p className="text-sm text-muted-foreground">
                Make sure your interviewer has permission to open this link.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Submissions are closed.</p>
          )}
          {error && (
            <p className="text-destructive" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="notice success" role="status">
              {message}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={busy}
            >
              Close
            </Button>
            {session.canUploadSubmission && (
              <Button type="submit" disabled={busy}>
                {busy
                  ? "Saving…"
                  : session.isSubmitted
                    ? "Update submission"
                    : "Submit work"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
