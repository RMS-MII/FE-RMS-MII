import {
  Check,
  Clock3,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
} from "lucide-react"
import { date, labels, examUrl } from "../api"
import type { Application } from "../api"
import { Status } from "./Status"
import { candidateId, prefix } from "../route"
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
      <div className="panel timeline">
        <div className="section-heading">
          <h2>Progres seleksi</h2>
          <span className="muted">
            {
              a.stages.filter((s) =>
                ["Prioritized", "Considered"].includes(s.status)
              ).length
            }{" "}
            / {pipeline.length} tahap lolos
          </span>
        </div>

        {!pipeline.length && (
          <p className="muted">Tahapan seleksi sedang disiapkan oleh HR.</p>
        )}

        {pipeline.map((p, i) => {
          const stage = a.stages.find((s) => s.batchStageId === p.batchStageId)
          const passed =
            stage && ["Prioritized", "Considered"].includes(stage.status)
          const url = stage && examUrl(candidateId, stage.applicationStageId)

          return (
            <article className="stage" key={p.batchStageId}>
              <div
                className={`stage-number ${passed ? "done" : stage ? "active" : ""}`}
              >
                {passed ? <Check size={16} /> : String(i + 1).padStart(2, "0")}
              </div>
              <div className="stage-body">
                <div className="stage-title">
                  <h3>{p.stageName}</h3>
                  <Status value={stage?.status || "Upcoming"} />
                </div>
                {stage && (
                  <>
                    <p className="muted deadline">
                      <Clock3 size={13} /> Batas tahap: {date(stage.endAt)}
                    </p>
                    {stage.canTakeTest &&
                      (url ? (
                        <a className="text-link" href={url}>
                          Buka web exam <ArrowUpRight size={15} />
                        </a>
                      ) : (
                        <p className="notice">
                          Tautan ujian akan tersedia melalui undangan tim HR.
                        </p>
                      ))}
                    {stage.sessions.map((s) => (
                      <a
                        key={s.id}
                        className="session-row"
                        href={`${prefix}/sessions/${s.id}`}
                      >
                        <CalendarDays size={20} />
                        <div>
                          <strong>{s.sessionName}</strong>
                          <span>{date(s.scheduledStart)}</span>
                          <small>
                            {labels[s.status] || s.status}
                            {s.endedSubmissionAt ? " · Take-home" : ""}
                          </small>
                        </div>
                        <ChevronRight size={18} />
                      </a>
                    ))}
                  </>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
