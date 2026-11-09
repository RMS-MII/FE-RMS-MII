import {
  Check,
  Clock3,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  FileText,
  ArrowRight,
  CircleCheck,
} from "lucide-react"
import { date, labels, examUrl } from "../api"
import type { Application, Session } from "../api"
import { Status } from "./Status"
import { candidateId, prefix } from "../route"
function SessionLink({ session: s }: { session: Session }) {
  return (
    <a className="session-row" href={`${prefix}/sessions/${s.id}`}>
      <CalendarDays size={18} />
      <div>
        <strong>{s.sessionName}</strong>
        <span>{date(s.scheduledStart)}</span>
        <small>{labels[s.status] || s.status}</small>
      </div>
      <ChevronRight size={16} />
    </a>
  )
}
export function ApplicationView({
  application: a,
}: {
  application: Application
}) {
  const pipeline = a.pipeline?.length
    ? a.pipeline
    : a.stages.map((s) => ({
        batchStageId: s.batchStageId,
        stageName: s.stageName,
      }))
  const sessions = a.stages.flatMap((s) => s.sessions)
  const exams = a.stages.filter((s) => s.canTakeTest)
  const confirmations = sessions.filter((s) => s.canConfirm)
  const submissions = sessions.filter(
    (s) => s.canUploadSubmission && !s.isSubmitted
  )
  const actionCount = exams.length + confirmations.length + submissions.length
  const passed = a.stages.filter((s) =>
    ["Prioritized", "Considered"].includes(s.status)
  ).length
  return (
    <>
      <div className="panel application-header">
        <div>
          <p className="eyebrow">{a.codeApplication}</p>
          <h2>{a.batchName}</h2>
          <p className="muted">{a.departmentName}</p>
        </div>
        <Status value={a.status} />
      </div>
      <section className="panel next-actions" aria-labelledby="action-heading">
        <div className="section-heading">
          <div>
            <h2 id="action-heading">Perlu ditindaklanjuti</h2>
            <p className="muted">Langkah berikutnya untuk lamaran ini.</p>
          </div>
          <span className="action-count">{actionCount} tindakan</span>
        </div>
        {!actionCount && (
          <div className="quiet-state">
            <CircleCheck size={20} />
            <div>
              <strong>Semua sudah ditangani</strong>
              <p>
                Belum ada tindakan yang perlu Anda lakukan. Pantau pembaruan
                dari tim HR.
              </p>
            </div>
          </div>
        )}
        {exams.map((s) => {
          const url = examUrl(candidateId, s.applicationStageId)
          return (
            <div className="action-row" key={s.applicationStageId}>
              <span className="action-icon">
                <FileText size={19} />
              </span>
              <div>
                <strong>{s.stageName}</strong>
                <p>Batas pengerjaan: {date(s.endAt)}</p>
              </div>
              {url ? (
                <a className="primary-link" href={url}>
                  Buka web exam <ArrowUpRight size={15} />
                </a>
              ) : (
                <span className="muted">Lihat tautan pada undangan HR</span>
              )}
            </div>
          )
        })}
        {confirmations.map((s) => (
          <div className="action-row" key={s.id}>
            <span className="action-icon">
              <CalendarDays size={19} />
            </span>
            <div>
              <strong>Konfirmasi {s.sessionName}</strong>
              <p>{date(s.scheduledStart)}</p>
            </div>
            <a className="primary-link" href={`${prefix}/sessions/${s.id}`}>
              Tinjau jadwal <ArrowRight size={15} />
            </a>
          </div>
        ))}
        {submissions.map((s) => (
          <div className="action-row" key={s.id}>
            <span className="action-icon">
              <FileText size={19} />
            </span>
            <div>
              <strong>Kumpulkan tugas take-home</strong>
              <p>
                {s.sessionName} · {date(s.endedSubmissionAt)}
              </p>
            </div>
            <a
              className="primary-link"
              href={`${prefix}/sessions/${s.id}/submission`}
            >
              Kirim tugas <ArrowRight size={15} />
            </a>
          </div>
        ))}
      </section>
      <div className="dashboard-columns">
        <section className="panel timeline">
          <div className="section-heading">
            <h2>Progres seleksi</h2>
            <span className="muted">
              {passed} / {pipeline.length} tahap lolos
            </span>
          </div>
          {!pipeline.length && (
            <p className="muted timeline-empty">
              Tahapan seleksi sedang disiapkan oleh HR.
            </p>
          )}
          <div className="timeline-content">
            {pipeline.map((p, i) => {
              const stage = a.stages.find(
                (s) => s.batchStageId === p.batchStageId
              )
              const complete =
                stage && ["Prioritized", "Considered"].includes(stage.status)
              const current =
                stage && ["InProgress", "Submitted"].includes(stage.status)
              return (
                <article
                  className={`stage ${current ? "stage-current" : ""}`}
                  key={p.batchStageId}
                >
                  <div
                    className={`stage-number ${complete ? "done" : current ? "active" : ""}`}
                  >
                    {complete ? (
                      <Check size={15} />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </div>
                  <div className="stage-body">
                    <div className="stage-title">
                      <h3>{p.stageName}</h3>
                      <Status value={stage?.status || "Upcoming"} />
                    </div>
                    {current && (
                      <p className="muted deadline">
                        <Clock3 size={13} /> Batas tahap: {date(stage.endAt)}
                      </p>
                    )}
                    {stage && stage.sessions.length > 0 && (
                      <details className="stage-details" open={current}>
                        <summary>
                          {stage.sessions.length} jadwal interview
                        </summary>
                        {stage.sessions.map((s) => (
                          <SessionLink key={s.id} session={s} />
                        ))}
                      </details>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
        <aside className="dashboard-side">
          <section className="panel" id="schedules">
            <div className="section-heading">
              <h2>
                <CalendarDays size={17} /> Jadwal interview
              </h2>
            </div>
            <div className="side-content">
              {sessions.length ? (
                [...sessions]
                  .sort((x, y) =>
                    x.scheduledStart.localeCompare(y.scheduledStart)
                  )
                  .map((s) => <SessionLink key={s.id} session={s} />)
              ) : (
                <p className="muted">
                  Belum ada jadwal interview. Jadwal akan muncul setelah
                  ditentukan oleh HR.
                </p>
              )}
            </div>
          </section>
          <section className="panel" id="assignments">
            <div className="section-heading">
              <h2>
                <FileText size={17} /> Tugas take-home
              </h2>
            </div>
            <div className="side-content">
              {sessions.some((s) => s.endedSubmissionAt) ? (
                sessions
                  .filter((s) => s.endedSubmissionAt)
                  .map((s) => (
                    <a
                      className="assignment-row"
                      key={s.id}
                      href={`${prefix}/sessions/${s.id}/submission`}
                    >
                      <strong>{s.sessionName}</strong>
                      <span className="muted">
                        Batas: {date(s.endedSubmissionAt)}
                      </span>
                      <span className="text-link">
                        {s.isSubmitted
                          ? "Lihat pengumpulan"
                          : "Detail pengumpulan"}
                        <ChevronRight size={14} />
                      </span>
                    </a>
                  ))
              ) : (
                <p className="muted">
                  Belum ada penugasan. Detail tugas akan dikirim melalui email
                  interviewer.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}
