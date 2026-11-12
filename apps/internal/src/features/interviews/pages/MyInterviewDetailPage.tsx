import { useMemo } from "react"
import { MapPin, Video } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { BackButton, ErrorState, Panel, StatusBadge } from "@/shared/components"
import { usePageBreadcrumbs } from "@/shared/components/layout/breadcrumbs-context"
import { getApiError } from "@/shared/api/api-error"
import { formatWibDateTime, formatWibTime } from "@/shared/lib/utcDateTime"
import { ConfirmAcceptInterviewDialog } from "../components/ConfirmAcceptInterviewDialog"
import { RequestRescheduleDialog } from "../components/RequestRescheduleDialog"
import { InterviewTakeHomeSection } from "../components/InterviewTakeHomeSection"
import { InterviewAssessmentSection } from "../components/InterviewAssessmentSection"
import { InterviewCandidateProfile } from "../components/InterviewCandidateProfile"
import { useInterviewerSessionDetail } from "../hooks/useInterviewerSessionDetail"

function isWebLink(value: string | null | undefined) {
  return Boolean(value && /^https?:\/\//i.test(value))
}

export function MyInterviewDetailPage({
  sessionInterviewId,
}: {
  sessionInterviewId: string
}) {
  const state = useInterviewerSessionDetail(sessionInterviewId)
  const { detail, session } = state
  const crumbs = useMemo(
    () => [
      { label: "Dashboard", to: "/dashboard" },
      { label: "My Interviews", to: "/interviews/schedules" },
      { label: detail?.candidate.fullName ?? "Interview Detail" },
    ],
    [detail?.candidate.fullName]
  )
  usePageBreadcrumbs(crumbs)

  if (state.isLoading && !detail) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!detail || !session) {
    const problem = getApiError(state.error, "Unable to load this interview.")
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BackButton
            to="/interviews/schedules"
            label="Back to My Interviews"
          />
          <h1 className="text-2xl font-bold text-foreground">
            Interview Detail
          </h1>
        </div>
        <Panel className="p-8">
          <ErrorState
            title={
              problem.status === 404
                ? "Interview not found"
                : problem.status === 403
                  ? "Access denied"
                  : "Unable to load interview"
            }
            description={problem.message}
            onRetry={
              problem.status === 403 || problem.status === 404
                ? undefined
                : () => void state.refetch()
            }
          />
        </Panel>
      </div>
    )
  }

  const candidate = detail.candidate
  const statusTone =
    session.status === "pending" || session.status === "rescheduled"
      ? "warning"
      : session.status === "accepted"
        ? "success"
        : session.status === "completed"
          ? "info"
          : "neutral"
  const statusLabel =
    session.status === "accepted" && !session.candidateConfirmed
      ? "Awaiting Candidate"
      : session.status === "pending"
        ? "Pending Confirmation"
        : session.status.charAt(0).toUpperCase() + session.status.slice(1)

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <BackButton
            to="/interviews/schedules"
            label="Back to My Interviews"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Interview Detail
            </h1>
            <p className="text-sm text-muted-foreground">
              {session.sessionName} Â· {session.recruitmentName}
            </p>
          </div>
        </div>
        <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
      </div>

      {state.notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {state.notice}
        </div>
      )}
      {state.isError && (
        <div
          role="alert"
          className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          Refresh failed: {getApiError(state.error).message}
        </div>
      )}

      <InterviewCandidateProfile candidate={candidate} />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <InterviewTakeHomeSection
            key={`${session.sessionId}:${session.fileTakeHome ?? ""}:${session.endedSubmissionAt ?? ""}`}
            session={session}
            isSaving={state.isSavingTakeHome}
            onSave={state.saveTakeHome}
          />
          <InterviewAssessmentSection
            key={`${session.id}:${session.assessment?.score ?? ""}:${detail.assessmentNotes ?? ""}`}
            detail={detail}
            session={session}
            isSaving={state.isSavingAssessment}
            onSave={state.saveAssessment}
          />
        </div>
        <Panel>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">
              Session details
            </h2>
          </div>
          <div className="space-y-4 p-5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Schedule</p>
              <p className="font-medium text-foreground">
                {formatWibDateTime(session.scheduledStart)}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {formatWibTime(session.scheduledStart)} -{" "}
                {formatWibTime(session.scheduledEnd)} WIB
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recruitment stage</p>
              <p className="font-medium text-foreground">
                {session.recruitmentName}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.stageName}
              </p>
            </div>
            <div className="flex items-start gap-2">
              {session.isOnline ? (
                <Video className="mt-0.5 size-4 text-muted-foreground" />
              ) : (
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
              )}
              <div>
                <p>
                  {session.isOnline
                    ? "Online interview"
                    : session.location || "Location unavailable"}
                </p>
                {session.isOnline && isWebLink(session.meetingUrl) && (
                  <a
                    href={session.meetingUrl!}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Open meeting link
                  </a>
                )}
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold text-foreground">
                Interview panel
              </p>
              {session.panelInterviewers.map((member) => (
                <p key={member.id} className="mb-1 text-xs text-foreground">
                  {member.name}
                  {member.isCurrent ? " (You)" : ""}
                  {member.isLead ? " Â· Lead" : ""}
                </p>
              ))}
            </div>
            {session.status === "pending" && session.isLead && (
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    state.setActionError(null)
                    state.setConfirmOpen(true)
                  }}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => state.setRescheduleOpen(true)}
                >
                  Request Reschedule
                </Button>
              </div>
            )}
            {session.status === "accepted" && session.isLead && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => state.setRescheduleOpen(true)}
              >
                Request Reschedule
              </Button>
            )}
            {session.status === "pending" && !session.isLead && (
              <p className="text-xs text-muted-foreground">
                Awaiting lead confirmation.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <ConfirmAcceptInterviewDialog
        open={state.confirmOpen}
        onOpenChange={state.setConfirmOpen}
        session={session}
        onConfirm={state.acceptSchedule}
        isLoading={state.isConfirming}
        error={state.actionError}
      />
      <RequestRescheduleDialog
        open={state.rescheduleOpen}
        onOpenChange={state.setRescheduleOpen}
        session={session}
        onSubmitRequest={state.submitReschedule}
        isSubmitting={state.isRequestingReschedule}
      />
    </div>
  )
}
