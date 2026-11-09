import { useRef, useState } from "react"
import type { FormEvent } from "react"
import {
  CalendarDays,
  MapPin,
  ArrowUpRight,
  Users,
  Check,
  FileText,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { request, date, labels, safeUrl } from "../api"
import type { Session } from "../api"
import { Status } from "./Status"
import { route, prefix } from "../route"
export function SessionDetail({
  session: s,
  refresh,
}: {
  session: Session
  refresh: () => Promise<void>
}) {
  const [mode, setMode] = useState<"reschedule" | "submission" | null>(
    route?.[3] ? "submission" : null
  )

  const [link, setLink] = useState(s.fileSubmission || "")

  const [busy, setBusy] = useState(false)

  const [message, setMessage] = useState("")

  const [error, setError] = useState("")

  const lock = useRef(false)

  async function mutate(action: string, body: object) {
    if (lock.current) return

    lock.current = true
    setBusy(true)
    setError("")
    setMessage("")

    try {
      await request(`${prefix}/sessions/${s.id}/${action}`, body)
      setMessage(
        action === "submission"
          ? "Tautan tugas berhasil disimpan."
          : action === "confirm"
            ? "Kehadiran Anda berhasil dikonfirmasi."
            : "Permintaan terkirim. Tunggu keputusan tim HR."
      )
      setMode(null)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Permintaan gagal.")
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  function reschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const f = new FormData(event.currentTarget)
    const start = new Date(String(f.get("start")))
    const end = new Date(String(f.get("end")))
    if (start <= new Date() || end <= start) {
      setError(
        "Pilih waktu mendatang dengan waktu selesai setelah waktu mulai."
      )
      return
    }
    void mutate("reschedule", {
      proposedStart: start.toISOString(),
      proposedEnd: end.toISOString(),
      reason: String(f.get("reason")).trim(),
    })
  }

  return (
    <div className="detail-grid">
      <section className="panel detail">
        <div className="section-heading">
          <h2>{s.sessionName}</h2>
          <Status value={s.status} />
        </div>
        <dl className="facts">
          <div>
            <dt>
              <CalendarDays /> Jadwal interview
            </dt>
            <dd>
              {date(s.scheduledStart)}
              <br />
              <span className="muted">Selesai {date(s.scheduledEnd)}</span>
            </dd>
          </div>
          <div>
            <dt>
              <MapPin /> {s.isOnline ? "Online" : "Lokasi"}
            </dt>
            <dd>
              {s.isOnline ? (
                safeUrl(s.meetingUrl) ? (
                  <a
                    className="text-link"
                    href={safeUrl(s.meetingUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka ruang meeting <ArrowUpRight size={15} />
                  </a>
                ) : (
                  "Tautan meeting menyusul"
                )
              ) : (
                s.location || "Lokasi menyusul"
              )}
            </dd>
          </div>
          <div>
            <dt>
              <Users /> Interviewer
            </dt>
            <dd>{s.interviewers?.join(", ") || "Tim interviewer"}</dd>
          </div>
        </dl>

        {s.reschedule && (
          <div className="notice">
            <strong>
              Reschedule: {labels[s.reschedule.status] || s.reschedule.status}
            </strong>
            <p>
              Usulan: {date(s.reschedule.proposedStart)} –{" "}
              {date(s.reschedule.proposedEnd)}
            </p>
          </div>
        )}

        <div className="actions">
          {s.canConfirm && (
            <Button disabled={busy} onClick={() => void mutate("confirm", {})}>
              <Check size={16} /> Konfirmasi hadir
            </Button>
          )}
          {s.canRequestReschedule && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                setMode(mode === "reschedule" ? null : "reschedule")
              }
            >
              Ajukan reschedule
            </Button>
          )}
        </div>

        {mode === "reschedule" && s.canRequestReschedule && (
          <form className="action-form" onSubmit={reschedule}>
            <h3>Usulkan jadwal lain</h3>
            <p className="muted">
              Waktu mengikuti zona perangkat Anda:{" "}
              {Intl.DateTimeFormat().resolvedOptions().timeZone}. Jadwal baru
              memerlukan persetujuan HR.
            </p>
            <label>
              Mulai
              <Input
                type="datetime-local"
                name="start"
                required
                disabled={busy}
              />
            </label>
            <label>
              Selesai
              <Input
                type="datetime-local"
                name="end"
                required
                disabled={busy}
              />
            </label>
            <label>
              Alasan
              <textarea
                name="reason"
                maxLength={100}
                required
                disabled={busy}
                rows={3}
              />
            </label>
            <Button disabled={busy} type="submit">
              {busy ? "Mengirim…" : "Kirim usulan"}
            </Button>
          </form>
        )}

        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="notice success" role="status">
            {message}
          </div>
        )}
      </section>

      <aside className="panel take-home">
        <div className="task-icon">
          <FileText size={22} />
        </div>
        <h2>Take-home assignment</h2>
        {s.endedSubmissionAt ? (
          <>
            <p className="muted">
              Detail tugas dan instruksi tersedia di email undangan Anda.
            </p>
            <p className="task-deadline">
              Batas pengumpulan<strong>{date(s.endedSubmissionAt)}</strong>
            </p>
            {safeUrl(s.fileSubmission) && (
              <a
                className="text-link"
                href={safeUrl(s.fileSubmission)}
                target="_blank"
                rel="noreferrer"
              >
                Lihat tugas terkirim <ArrowUpRight size={15} />
              </a>
            )}
            {s.canUploadSubmission ? (
              <form
                className="action-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  void mutate("submission", { fileSubmission: link.trim() })
                }}
              >
                <label>
                  Tautan Google Drive
                  <Input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                    maxLength={100}
                    disabled={busy}
                    placeholder="https://drive.google.com/…"
                  />
                </label>
                <p className="muted">
                  Pastikan tautan dapat diakses oleh interviewer. Anda dapat
                  menggantinya sebelum batas pengumpulan.
                </p>
                <Button className="w-full" disabled={busy} type="submit">
                  {busy
                    ? "Menyimpan…"
                    : s.isSubmitted
                      ? "Perbarui tautan"
                      : "Kirim tugas"}
                </Button>
              </form>
            ) : (
              <p className="notice">Pengumpulan tugas sudah ditutup.</p>
            )}
          </>
        ) : (
          <p className="muted">Belum ada tugas take-home untuk sesi ini.</p>
        )}
      </aside>
    </div>
  )
}
