import { CalendarDays, FileText, ArrowRight, ArrowUpRight } from "lucide-react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { date, safeUrl } from "../api"
import type { Application } from "../api"
import { prefix } from "../route"
import { Status } from "./Status"
import { SubmissionDialog } from "./SubmissionDialog"

export function SessionList({
  application,
  assignments,
  submissionId,
  onSubmissionChange,
  refresh,
}: {
  application: Application
  assignments: boolean
  submissionId: string
  onSubmissionChange: (id: string) => void
  refresh: () => Promise<void>
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
  const submission = assignments
    ? sessions.find(({ session }) => session.id === submissionId)?.session
    : undefined

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
                {assignments ? (
                  <div className="flex flex-wrap gap-2">
                    {safeUrl(s.fileTakeHome) && (
                      <a
                        className={buttonVariants({ variant: "outline" })}
                        href={safeUrl(s.fileTakeHome)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Buka materi take-home <ArrowUpRight size={15} />
                      </a>
                    )}
                    <Button
                      id={`submission-${s.id}`}
                      onClick={() => onSubmissionChange(s.id)}
                    >
                      Detail pengumpulan
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="muted">
                      {s.canConfirm
                        ? "Menunggu konfirmasi kehadiran Anda"
                        : "Lihat detail untuk informasi jadwal"}
                    </span>
                    <a
                      className="primary-link"
                      href={`${prefix}/sessions/${s.id}`}
                    >
                      Tinjau jadwal <ArrowRight size={15} />
                    </a>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {submission && (
        <SubmissionDialog
          key={submission.id}
          session={submission}
          onClose={() => onSubmissionChange("")}
          refresh={refresh}
        />
      )}
    </section>
  )
}
