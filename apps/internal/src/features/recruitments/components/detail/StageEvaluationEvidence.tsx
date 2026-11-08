import {
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  MessageSquare,
  XCircle,
} from "lucide-react"
import { EmptyState, StatusBadge } from "@/shared/components"
import type { Tone } from "@/shared/components"
import { cn } from "@/shared/lib/utils"
import type { CandidateApplicationItem } from "../../types"

export interface StageEvaluationEvidenceProps {
  application: CandidateApplicationItem
  stageIndex?: number
}

const stageStatusMeta: Record<string, { label: string; tone: Tone }> = {
  in_progress: { label: "In Progress", tone: "info" },
  passed: { label: "Passed", tone: "success" },
  accepted: { label: "Accepted", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  rejected: { label: "Rejected", tone: "danger" },
  pending: { label: "Pending", tone: "warning" },
  upcoming: { label: "Upcoming", tone: "neutral" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
}

export function StageEvaluationEvidence({
  application,
  stageIndex,
}: StageEvaluationEvidenceProps) {
  const targetIndex = stageIndex ?? application.currentStageIndex
  const stage = application.applicationStages[targetIndex]

  if (!stage) {
    return (
      <EmptyState
        icon={<FileCheck2 className="size-6" aria-hidden />}
        title="No stage details available"
        description="Selection-stage evaluations will appear here when available."
        className="px-0 py-8"
      />
    )
  }

  const isTest = stage.stageType === "test"
  const isInterview = stage.stageType === "interview"
  const isScreening = stage.stageType === "screening"
  const passing =
    stage.passingScore ?? stage.testEvaluation?.passingScore ?? null
  const score = stage.totalScore ?? stage.testEvaluation?.score ?? null
  const canCompareScore = score !== null && passing !== null
  const meetsPassing = canCompareScore && score >= passing
  const scoreTone: Tone = !canCompareScore
    ? "neutral"
    : meetsPassing
      ? "success"
      : "danger"
  const status = stageStatusMeta[stage.status] ?? {
    label: stage.status,
    tone: "neutral" as const,
  }
  const assessments = stage.interviewAssessments ?? []
  const duration = stage.testEvaluation?.durationMinutes
  const attemptedQuestions = stage.testEvaluation?.attemptedQuestions
  const totalQuestions = stage.testEvaluation?.totalQuestions
  const questionSummary =
    attemptedQuestions != null && totalQuestions != null
      ? attemptedQuestions + " of " + totalQuestions + " answered"
      : attemptedQuestions != null
        ? attemptedQuestions + " answered"
        : totalQuestions != null
          ? totalQuestions + " questions"
          : "Not available"

  return (
    <section className="space-y-6" aria-label="Stage evaluation">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0 space-y-1">
          <h4 className="text-sm leading-5 font-semibold text-foreground">
            Stage {stage.stageIndex + 1}: {stage.stageName}
          </h4>
          {stage.stageTypeName && (
            <p className="text-xs text-muted-foreground">
              {stage.stageTypeName}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          {score !== null && (
            <StatusBadge tone={scoreTone}>
              Score: {score}
              {passing !== null ? " / " + passing + " min" : ""}
            </StatusBadge>
          )}
        </div>
      </div>

      {isTest && (
        <div className="space-y-4">
          <dl className="grid gap-4 rounded-xl bg-muted/50 p-4 sm:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Test score</dt>
              <dd className="text-sm font-medium text-foreground tabular-nums">
                {score !== null ? score + " / 100" : "Not evaluated"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Duration</dt>
              <dd className="text-sm font-medium text-foreground tabular-nums">
                {duration != null ? duration + " min" : "Not available"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Questions</dt>
              <dd className="text-sm font-medium text-foreground tabular-nums">
                {questionSummary}
              </dd>
            </div>
          </dl>

          <div
            className={cn(
              "flex items-start gap-3 rounded-xl p-4",
              !canCompareScore
                ? "bg-muted/50 text-muted-foreground"
                : meetsPassing
                  ? "bg-success-soft text-success"
                  : "bg-danger-soft text-danger"
            )}
          >
            {!canCompareScore ? (
              <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : meetsPassing ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {score === null
                  ? "Not evaluated"
                  : passing === null
                    ? "Score available"
                    : meetsPassing
                      ? "Meets the passing criteria"
                      : "Below the minimum passing score"}
              </p>
              <p className="text-xs leading-relaxed">
                {score === null
                  ? "Test results have not been recorded for this stage."
                  : passing === null
                    ? "No passing score has been configured for this stage."
                    : "Passing score: " +
                      passing +
                      ". Candidate score: " +
                      score +
                      "."}
              </p>
            </div>
          </div>
        </div>
      )}

      {isInterview && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h5 className="text-sm font-semibold text-foreground">
              Interviewer assessments
            </h5>
            <span className="text-xs text-muted-foreground">
              {assessments.length}{" "}
              {assessments.length === 1 ? "evaluation" : "evaluations"}
            </span>
          </div>

          {assessments.length > 0 ? (
            <div className="space-y-4">
              {assessments.map((assessment) => {
                const recommendationTone: Tone =
                  assessment.recommendation === "Strong Hire" ||
                  assessment.recommendation === "Recommend"
                    ? "success"
                    : assessment.recommendation === "Do Not Recommend"
                      ? "danger"
                      : "neutral"
                return (
                  <article
                    key={assessment.id}
                    className="space-y-3 border-b border-border pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {assessment.interviewerName}
                        </p>
                        {assessment.interviewerRole && (
                          <p className="text-xs text-muted-foreground">
                            {assessment.interviewerRole}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone="neutral">
                          {assessment.score != null
                            ? "Score: " + assessment.score + "/100"
                            : "Not rated"}
                        </StatusBadge>
                        <StatusBadge tone={recommendationTone}>
                          {assessment.recommendation}
                        </StatusBadge>
                      </div>
                    </div>
                    <p className="text-sm leading-6 whitespace-pre-wrap text-foreground">
                      {assessment.notes?.trim() ||
                        "No feedback notes provided."}
                    </p>
                  </article>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={<MessageSquare className="size-6" aria-hidden />}
              title="No interviewer feedback yet"
              description="Interviewer assessments will appear here once available."
              className="rounded-xl bg-muted/40 px-4 py-6"
            />
          )}
        </div>
      )}

      {isScreening && (
        <div className="space-y-4">
          <h5 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileCheck2 className="size-4 text-primary" aria-hidden />
            Document screening
          </h5>
          <dl className="divide-y divide-border rounded-xl border border-border">
            <div className="flex items-start gap-3 p-4">
              <FileText
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0 space-y-1">
                <dt className="text-sm font-medium text-foreground">
                  Curriculum Vitae (CV)
                </dt>
                <dd className="text-xs leading-relaxed break-all text-muted-foreground">
                  {application.candidateCv || "No CV provided"}
                </dd>
              </div>
            </div>
            <div className="space-y-1 p-4">
              <dt className="text-sm font-medium text-foreground">Education</dt>
              <dd className="text-xs leading-relaxed text-muted-foreground">
                {application.candidateEducation ||
                  application.candidateInstitution ||
                  "Education details not provided"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {!isTest && !isInterview && !isScreening && (
        <p className="rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
          No evaluation evidence is available for this stage.
        </p>
      )}

      {(stage.notes || stage.feedback) && (
        <div className="space-y-3 border-t border-border pt-4">
          {stage.notes && (
            <div className="space-y-1">
              <h5 className="text-sm font-semibold text-foreground">
                Stage notes
              </h5>
              <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                {stage.notes}
              </p>
            </div>
          )}
          {stage.feedback && (
            <div className="space-y-1">
              <h5 className="text-sm font-semibold text-foreground">
                Feedback
              </h5>
              <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                {stage.feedback}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
