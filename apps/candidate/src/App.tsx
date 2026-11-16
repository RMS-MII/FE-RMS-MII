import { useState } from "react"
import { ArrowLeft, BriefcaseBusiness, FileText, RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useCandidateTasks } from "./hooks/useCandidateTasks"
import {
  candidateId,
  interviewSessionId,
  pageTitle,
  portalPage,
  prefix,
  submissionSessionId,
} from "./route"
import { PortalShell } from "./components/PortalShell"
import { ApplicationView } from "./components/ApplicationView"
import { SessionList } from "./components/SessionList"
import { SessionDetail } from "./components/SessionDetail"
import { Status } from "./components/Status"

export function App() {
  const { result, error, loading, refresh } = useCandidateTasks(candidateId, prefix)
  const data = result?.data

  const [selected, setSelected] = useState("")
  const [submissionId, setSubmissionId] = useState(submissionSessionId)

  const app =
    data?.applications.find((a) => a.id === selected) ||
    (interviewSessionId
      ? data?.applications.find((a) =>
          a.stages.some((stage) =>
            stage.sessions.some((s) => s.id === interviewSessionId)
          )
        )
      : undefined) ||
    (portalPage === "assignments"
      ? data?.applications.find((a) =>
          a.stages.some((stage) =>
            stage.sessions.some(
              (s) => s.endedSubmissionAt && s.id === submissionSessionId
            )
          )
        ) ||
        data?.applications.find((a) =>
          a.stages.some((stage) =>
            stage.sessions.some((s) => s.endedSubmissionAt)
          )
        )
      : undefined) ||
    data?.applications[0]

  const session = app?.stages
    .flatMap((stage) => stage.sessions)
    .find((s) => s.id === interviewSessionId)
  const overview = !interviewSessionId && portalPage === "overview"

  return (
    <PortalShell
      data={data}
      selected={app?.id}
      onSelect={(id) => {
        setSelected(id)
        setSubmissionId("")
      }}
    >
      <main className="portal-main" id="main-content" tabIndex={-1}>
        <div className="page-heading">
          <div>
            {session && (
              <a className="back" href={prefix}>
                <ArrowLeft size={15} /> Back to overview
              </a>
            )}
            <div className="heading-title">
              <h1>
                {session?.sessionName ??
                  (overview && app ? app.batchName : pageTitle)}
              </h1>
              {overview && app && <Status value={app.status} />}
              {session && <Status value={session.status} />}
            </div>
            {app && (
              <p className="application-context">
                <BriefcaseBusiness size={15} aria-hidden="true" />
                <span>{overview ? app.departmentName : app.batchName}</span>
                <span className="application-code">{app.codeApplication}</span>
              </p>
            )}
          </div>
          {candidateId && (
            <Button
              className="refresh-button"
              variant="outline"
              disabled={loading}
              onClick={() => void refresh()}
            >
              <RefreshCw size={15} /> Refresh
            </Button>
          )}
        </div>

        {!candidateId ? (
          <div className="panel empty">
            <FileText />
            <h2>Open your invitation link</h2>
            <p>Use the candidate portal link from your recruitment email.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="notice error" role="alert">
                {error}{" "}
                <button onClick={() => void refresh()}>Try again</button>
              </div>
            )}

            {loading && !data && (
              <div className="panel empty" role="status">
                Loading your application…
              </div>
            )}

            {result &&
              (interviewSessionId ? (
                session ? (
                  <>
                    <SessionDetail
                      key={session.id}
                      session={session}
                      refresh={refresh}
                    />
                  </>
                ) : (
                  <div className="panel empty">
                    <h2>Interview not found</h2>
                    <a className="text-link" href={`${prefix}/interviews`}>
                      Back to interviews
                    </a>
                  </div>
                )
              ) : (
                <div id="overview">
                  <section>
                    {app ? (
                      portalPage === "overview" ? (
                        <ApplicationView
                          application={app}
                          asOf={result.fetchedAt}
                        />
                      ) : (
                        <SessionList
                          key={app.id}
                          application={app}
                          assignments={portalPage === "assignments"}
                          submissionId={submissionId}
                          onSubmissionChange={setSubmissionId}
                          refresh={refresh}
                        />
                      )
                    ) : (
                      <div className="panel empty">
                        <h2>No applications yet</h2>
                        <p>
                          Your application will appear when the recruitment team
                          adds it.
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              ))}
          </>
        )}
      </main>
    </PortalShell>
  )
}
