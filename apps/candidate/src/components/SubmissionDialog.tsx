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
      setMessage("Tautan tugas berhasil disimpan.")
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pengumpulan tugas gagal.")
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto rounded-2xl p-6 sm:max-w-lg"
        showCloseButton={!busy}
        finalFocus={() => document.getElementById(`submission-${session.id}`)}
      >
        <DialogHeader>
          <DialogTitle>Detail pengumpulan</DialogTitle>
          <DialogDescription>{session.sessionName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-sm">
          <dl>
            <dt className="text-muted-foreground">Batas pengumpulan</dt>
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
              Buka materi take-home <ArrowUpRight size={15} />
            </a>
          ) : (
            <p className="text-muted-foreground">
              Lihat email penugasan untuk materi dan instruksi.
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
                Lihat tugas terkirim <ArrowUpRight size={15} />
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
                Tautan Google Drive
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
              <p className="text-xs text-muted-foreground">
                Pastikan interviewer dapat membuka tautan hasil tugas Anda.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Pengumpulan tugas sudah ditutup.
            </p>
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
              Tutup
            </Button>
            {session.canUploadSubmission && (
              <Button type="submit" disabled={busy}>
                {busy
                  ? "Menyimpan…"
                  : session.isSubmitted
                    ? "Perbarui tautan"
                    : "Kirim tugas"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
