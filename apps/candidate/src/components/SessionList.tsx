import { CalendarDays, FileText, ArrowRight } from "lucide-react"
import { date } from "../api"
import type { Application } from "../api"
import { prefix } from "../route"
import { Status } from "./Status"

export function SessionList({
  application,
  assignments,
}: {
  application: Application
  assignments: boolean
}) {
  const sessions = application.stages
    .flatMap((stage) =>
      stage.sessions.map((session) => ({ session, stageName: stage.stageName }))
    )
    .filter(({ session }) => !assignments || session.endedSubmissionAt)
    .sort((a, b) =>
      (assignments
        ? a.session.endedSubmissionAt!
        : a.session.scheduledStart
      ).localeCompare(
        assignments ? b.session.endedSubmissionAt! : b.session.scheduledStart
      )
    )
  const Icon = assignments ? FileText : CalendarDays

  return (
    <section className="panel session-list">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{application.codeApplication}</p>
          <h2>{application.batchName}</h2>
          <p className="muted">{application.departmentName}</p>
        </div>
        <span className="action-count">
          {sessions.length} {assignments ? "tugas" : "jadwal"}
        </span>
      </div>
      {assignments && (
        <p className="list-note">
          Detail tugas dikirim melalui email interviewer. Siapkan tautan Google
          Drive hasil pengerjaan untuk dikumpulkan.
        </p>
      )}
      {!sessions.length ? (
        <div className="empty">
          <Icon size={28} />
          <h2>
            {assignments
              ? "Belum ada tugas take-home"
              : "Belum ada jadwal interview"}
          </h2>
          <p>
            {assignments
              ? "Penugasan akan tampil setelah ditentukan oleh interviewer."
              : "Jadwal akan tampil setelah ditentukan oleh tim HR."}
          </p>
        </div>
      ) : (
        <div className="session-list-items">
          {sessions.map(({ session: s, stageName }) => (
            <article className="session-list-item" key={s.id}>
              <div className="session-list-title">
                <span className="action-icon">
                  <Icon size={19} />
                </span>
                <div>
                  <p className="muted">{stageName}</p>
                  <h3>{s.sessionName}</h3>
                </div>
                {assignments ? (
                  <span className={`status ${s.isSubmitted ? "positive" : ""}`}>
                    {s.isSubmitted ? "Sudah dikumpulkan" : "Belum dikumpulkan"}
                  </span>
                ) : (
                  <Status value={s.status} />
                )}
              </div>
              <dl className="session-list-meta">
                <div>
                  <dt>
                    {assignments ? "Batas pengumpulan" : "Waktu interview"}
                  </dt>
                  <dd>
                    {date(assignments ? s.endedSubmissionAt : s.scheduledStart)}
                    {!assignments && <> – {date(s.scheduledEnd)}</>}
                  </dd>
                </div>
                <div>
                  <dt>Interviewer</dt>
                  <dd>{s.interviewers.join(", ") || "Belum ditentukan"}</dd>
                </div>
                {!assignments && (
                  <div>
                    <dt>Pelaksanaan</dt>
                    <dd>
                      {s.isOnline
                        ? "Online"
                        : s.location || "Lokasi belum ditentukan"}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="session-list-footer">
                <span className="muted">
                  {assignments
                    ? "Tugas untuk sesi interview ini"
                    : s.canConfirm
                      ? "Menunggu konfirmasi kehadiran Anda"
                      : "Lihat detail untuk informasi jadwal"}
                </span>
                <a
                  className="primary-link"
                  href={`${prefix}/sessions/${s.id}${assignments ? "/submission" : ""}`}
                >
                  {assignments
                    ? s.isSubmitted
                      ? "Lihat pengumpulan"
                      : "Detail pengumpulan"
                    : "Tinjau jadwal"}
                  <ArrowRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
