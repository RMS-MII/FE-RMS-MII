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
        <h2>{assignments ? "Assigned work" : "Interview schedule"}</h2>
        <span className="count">{sessions.length}</span>
      </div>
      {!sessions.length ? (
        <div className="empty">
          <Icon size={28} />
          <h3>
            {assignments ? "No take-home tasks yet" : "No interviews yet"}
          </h3>
          <p>
            {assignments
              ? "Your interviewer’s assignments will appear here."
              : "Scheduled interviews will appear here."}
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
                    {s.isSubmitted ? "Submitted" : "Not submitted"}
                  </span>
                ) : (
                  <Status value={s.status} />
                )}
              </div>
              <dl className="session-list-meta">
                <div>
                  <dt>
                    {assignments ? "Submission deadline" : "Interview time"}
                  </dt>
                  <dd>
                    {date(assignments ? s.endedSubmissionAt : s.scheduledStart)}
                    {!assignments && <> – {date(s.scheduledEnd)}</>}
                  </dd>
                </div>
                <div>
                  <dt>Interviewer</dt>
                  <dd>{s.interviewers.join(", ") || "To be confirmed"}</dd>
                </div>
                {!assignments && (
                  <div>
                    <dt>Format</dt>
                    <dd>
                      {s.isOnline
                        ? "Online"
                        : s.location || "Location to be confirmed"}
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
                        Open materials <ArrowUpRight size={15} />
                      </a>
                    )}
                    <Button
                      id={`submission-${s.id}`}
                      onClick={() => onSubmissionChange(s.id)}
                    >
                      View submission
                    </Button>
                  </div>
                ) : (
                  <>
                    <a
                      className={buttonVariants({
                        variant: s.canConfirm ? "default" : "outline",
                      })}
                      href={`${prefix}/sessions/${s.id}`}
                    >
                      {s.canConfirm ? "Review invitation" : "View interview"}{" "}
                      <ArrowRight size={15} />
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
