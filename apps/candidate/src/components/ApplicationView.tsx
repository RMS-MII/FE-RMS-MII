import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  ListChecks,
} from "lucide-react"
import { date, examUrl, parseDate, type Application } from "../api"
import { Status } from "./Status"
import { candidateId, prefix } from "../route"

export function ApplicationView({
  application,
  asOf,
}: {
  application: Application
  asOf: number
}) {
  const stagesById = new Map(
    application.stages.map((stage) => [stage.batchStageId, stage])
  )
  const pipeline = application.pipeline?.length
    ? application.pipeline
    : application.stages
  const steps = pipeline.map((item) => {
    const stage = stagesById.get(item.batchStageId)
    return {
      ...item,
      stage,
      passed: stage?.status === "Prioritized" || stage?.status === "Considered",
      active: stage?.status === "InProgress" || stage?.status === "Submitted",
    }
  })
  const passed = steps.filter((step) => step.passed).length
  const sessions = application.stages.flatMap((stage) => stage.sessions)
  const exams = application.stages.filter((stage) => stage.canTakeTest)
  const confirmations = sessions.filter((session) => session.canConfirm)
  const submissions = sessions.filter(
    (session) => session.canUploadSubmission && !session.isSubmitted
  )
  const actions = [
    ...confirmations.map((session) => ({
      id: `confirm-${session.id}`,
      icon: CalendarDays,
      title: `Confirm ${session.sessionName}`,
      detail: date(session.scheduledStart),
      label: "Review invitation",
      href: `${prefix}/sessions/${session.id}`,
      external: false,
    })),
    ...exams.map((stage) => ({
      id: stage.applicationStageId,
      icon: FileText,
      title: stage.stageName,
      detail: `Due ${date(stage.endAt)}`,
      label: "Open exam",
      href: examUrl(candidateId, stage.applicationStageId),
      external: true,
    })),
    ...submissions.map((session) => ({
      id: `submit-${session.id}`,
      icon: FileText,
      title: "Submit take-home work",
      detail: `${session.sessionName} · Due ${date(session.endedSubmissionAt)}`,
      label: "View submission",
      href: `${prefix}/assignments?session=${session.id}`,
      external: false,
    })),
  ]
  const upcoming = sessions
    .filter(
      (session) =>
        ["Scheduled", "AcceptedByCandidate"].includes(session.status) &&
        parseDate(session.scheduledStart).getTime() > asOf
    )
    .sort(
      (a, b) =>
        parseDate(a.scheduledStart).getTime() -
        parseDate(b.scheduledStart).getTime()
    )[0]

  return (
    <div className="overview-grid">
      <section className="panel timeline" aria-labelledby="progress-heading">
        <div className="section-heading">
          <h2 id="progress-heading">Application progress</h2>
          {steps.length > 0 && (
            <span className="muted">
              {passed} of {steps.length} stages passed
            </span>
          )}
        </div>
        {steps.length === 0 ? (
          <p className="section-body muted">
            The recruitment team is preparing the hiring stages.
          </p>
        ) : (
          <ol className="timeline-content">
            {steps.map(
              ({ stage, stageName, batchStageId, passed, active }, index) => (
                <li
                  className="stage"
                  key={batchStageId}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={passed ? "stage-number done" : "stage-number"}
                    aria-hidden="true"
                  >
                    {passed ? <Check size={16} /> : index + 1}
                  </span>
                  <div className="stage-body">
                    <div className="stage-title">
                      <h3>{stageName}</h3>
                      <Status value={stage?.status || "Upcoming"} />
                    </div>
                    {active && stage?.endAt && (
                      <p className="stage-deadline muted">
                        <Clock3 size={14} /> Stage deadline {date(stage.endAt)}
                      </p>
                    )}
                  </div>
                </li>
              )
            )}
          </ol>
        )}
      </section>

      <div className="overview-side">
        <section className="panel next-steps" aria-labelledby="actions-heading">
          <div className="section-heading">
            <h2 id="actions-heading">Next steps</h2>
            {actions.length > 0 && (
              <span className="count">{actions.length}</span>
            )}
          </div>
          {actions.length > 0 ? (
            <ul className="task-list">
              {actions.map(
                ({ id, icon: Icon, title, detail, label, href, external }) => (
                  <li key={id} className="task-row">
                    <span className="action-icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p className="muted">{detail}</p>
                      {href ? (
                        <a className="text-link" href={href}>
                          {label}{" "}
                          {external ? (
                            <ArrowUpRight size={14} />
                          ) : (
                            <ArrowRight size={14} />
                          )}
                        </a>
                      ) : (
                        <p className="muted">
                          Use the exam link in your invitation email.
                        </p>
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>
          ) : (
            <div className="quiet-state">
              <span className="action-icon">
                <ListChecks size={19} />
              </span>
              <p>No action needed right now.</p>
            </div>
          )}
        </section>
        {upcoming && (
          <section className="panel" aria-labelledby="upcoming-heading">
            <div className="section-heading">
              <h2 id="upcoming-heading">Upcoming interview</h2>
            </div>
            <div className="task-row">
              <span className="action-icon">
                <CalendarDays size={18} />
              </span>
              <div>
                <h3>{upcoming.sessionName}</h3>
                <p className="muted">{date(upcoming.scheduledStart)}</p>
                <a
                  className="text-link"
                  href={`${prefix}/sessions/${upcoming.id}`}
                >
                  View interview <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
