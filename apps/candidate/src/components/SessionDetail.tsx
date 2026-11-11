import { useRef, useState } from "react"
import type { FormEvent } from "react"
import { CalendarDays, MapPin, ArrowUpRight, Users, Check } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { DatePicker } from "@workspace/ui/components/date-picker"
import { TimePicker } from "@workspace/ui/components/time-picker"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { request, date, labels, safeUrl } from "../api"
import type { Session } from "../api"
import { Status } from "./Status"
import { prefix } from "../route"
export function SessionDetail({
  session: s,
  refresh,
}: {
  session: Session
  refresh: () => Promise<void>
}) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false)

  const [schedule, setSchedule] = useState({
    startDate: "",
    startTime: "",
    endTime: "",
  })

  const [busy, setBusy] = useState(false)

  const [message, setMessage] = useState("")

  const [error, setError] = useState("")

  const lock = useRef(false)

  async function mutate(action: "confirm" | "reschedule", body: object) {
    if (lock.current) return

    lock.current = true
    setBusy(true)
    setError("")
    setMessage("")

    try {
      await request(`${prefix}/sessions/${s.id}/${action}`, body)
      setMessage(
        action === "confirm"
          ? "Kehadiran Anda berhasil dikonfirmasi."
          : "Permintaan terkirim. Tunggu keputusan tim HR."
      )
      setRescheduleOpen(false)
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
    if (!schedule.startDate || !schedule.startTime || !schedule.endTime) {
      setError("Lengkapi tanggal dan jam mulai serta selesai.")
      return
    }
    const start = new Date(`${schedule.startDate}T${schedule.startTime}`)
    const end = new Date(`${schedule.startDate}T${schedule.endTime}`)
    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      start <= new Date() ||
      end <= start
    ) {
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
          <Dialog
            open={rescheduleOpen}
            onOpenChange={(open) => {
              if (busy) return
              setError("")
              if (open) setMessage("")
              setRescheduleOpen(open)
            }}
          >
            <DialogTrigger render={<Button variant="outline" disabled={busy} />}>
              Ajukan reschedule
            </DialogTrigger>
            <DialogContent
              className="max-h-[90dvh] overflow-y-auto rounded-2xl p-6 sm:max-w-lg"
              showCloseButton={!busy}
            >
              <DialogHeader>
                <DialogTitle>Ajukan reschedule</DialogTitle>
                <DialogDescription>
                  {s.sessionName} dijadwalkan pada {date(s.scheduledStart)}.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 text-sm" onSubmit={reschedule}>
                <div className="grid gap-2">
                  <label htmlFor="reschedule-start-date">Tanggal usulan</label>
                  <DatePicker
                    id="reschedule-start-date"
                    value={schedule.startDate}
                    minDate={new Date().toLocaleDateString("en-CA")}
                    placeholder="Pilih tanggal usulan"
                    disabled={busy}
                    onChange={(value) => {
                      setSchedule({ ...schedule, startDate: value })
                      setError("")
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <label htmlFor="reschedule-start-time">Jam mulai</label>
                    <TimePicker
                      id="reschedule-start-time"
                      value={schedule.startTime}
                      disabled={busy}
                      placeholder="Pilih jam"
                      onChange={(value) => {
                        setSchedule({ ...schedule, startTime: value })
                        setError("")
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="reschedule-end-time">Jam selesai</label>
                    <TimePicker
                      id="reschedule-end-time"
                      value={schedule.endTime}
                      minTime={schedule.startTime || undefined}
                      disabled={busy}
                      placeholder="Pilih jam"
                      onChange={(value) => {
                        setSchedule({ ...schedule, endTime: value })
                        setError("")
                      }}
                    />
                  </div>
                </div>
                <label>
                  Alasan
                  <Textarea
                    className="mt-2 min-h-20 resize-y"
                    placeholder="Ceritakan alasan Anda mengajukan perubahan jadwal…"
                    name="reason"
                    maxLength={100}
                    required
                    disabled={busy}
                    rows={3}
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  Gunakan zona waktu perangkat Anda (
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}). Tim HR
                  akan meninjau usulan jadwal baru.
                </p>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    disabled={busy}
                    type="button"
                    onClick={() => {
                      setError("")
                      setRescheduleOpen(false)
                    }}
                  >
                    Batal
                  </Button>
                  <Button disabled={busy} type="submit">
                    {busy ? "Mengirim…" : "Kirim usulan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && !rescheduleOpen && (
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
  )
}
