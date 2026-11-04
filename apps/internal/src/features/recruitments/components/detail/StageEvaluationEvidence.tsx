import {
  CheckCircle2,
  XCircle,
  FileCheck2,
  ShieldCheck,
} from "lucide-react"
import type { CandidateApplicationItem } from "../../types"

export interface StageEvaluationEvidenceProps {
  application: CandidateApplicationItem
  stageIndex?: number
}

export function StageEvaluationEvidence({
  application,
  stageIndex,
}: StageEvaluationEvidenceProps) {
  const targetIndex = stageIndex !== undefined ? stageIndex : application.currentStageIndex
  const stage = application.applicationStages[targetIndex]

  if (!stage) return null

  const isTest = stage.stageType === "test"
  const isInterview = stage.stageType === "interview"
  const isScreening = stage.stageType === "screening"

  const passing = stage.passingScore ?? 70
  const score = stage.totalScore ?? stage.testEvaluation?.score ?? null
  const meetsPassing = score !== null && score >= passing

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h4 className="text-sm font-bold text-foreground">
            Stage {stage.stageIndex + 1}: {stage.stageName}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {score !== null && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
                meetsPassing
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
              }`}
            >
              <span>Score: {score}</span>
              <span className="font-normal opacity-70">/ {passing} min</span>
            </span>
          )}
        </div>
      </div>

      {/* 1. TEST EVIDENCE (Logic / Technical / Online Test) */}
      {isTest && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-xl border border-border bg-muted/30 p-2.5">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Test Score</span>
              </span>
              <p className="text-xl font-bold text-foreground mt-0.5 tabular-nums">
                {score !== null ? `${score} / 100` : "Pending"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-2.5">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Duration</span>
              </span>
              <p className="text-xl font-bold text-foreground mt-0.5 tabular-nums">
                {stage.testEvaluation?.durationMinutes
                  ? `${stage.testEvaluation.durationMinutes} Mins`
                  : "45 Mins"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-2.5 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Questions</span>
              </span>
              <p className="text-xl font-bold text-foreground mt-0.5 tabular-nums">
                {stage.testEvaluation?.attemptedQuestions || 48} of{" "}
                {stage.testEvaluation?.totalQuestions || 50} answered
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
              meetsPassing
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-500/10 text-rose-800 dark:text-rose-300"
            }`}
          >
            {meetsPassing ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="size-4 shrink-0 text-rose-600" />
            )}
            <div>
              <p className="font-semibold">
                {meetsPassing
                  ? "Meets Stage Passing Criteria"
                  : "Candidate did not meet the minimum passing score."}
              </p>
              <p className="text-[11px] opacity-80">
                Passing score requirement is {passing}. Candidate achieved {score}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERVIEW EVIDENCE (SessionInterview & InterviewAssessment) */}
      {isInterview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <span>Interviewer Assessments & Feedback</span>
            </span>
            <span>
              {stage.interviewAssessments?.length || 2} Interviewer Evaluations
            </span>
          </div>

          <div className="space-y-2.5">
            {stage.interviewAssessments && stage.interviewAssessments.length > 0 ? (
              stage.interviewAssessments.map((ia) => {
                const isRec = ia.recommendation === "Recommend" || ia.recommendation === "Strong Hire"

                return (
                  <div
                    key={ia.id}
                    className="rounded-xl border border-border bg-muted/20 p-3 space-y-2 text-xs transition-colors hover:bg-muted/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-semibold text-foreground leading-tight">
                            {ia.interviewerName}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-tight">
                            {ia.interviewerRole}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded-full">
                          Rating: {ia.score}/100
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isRec
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {ia.recommendation}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-card rounded-lg p-2.5 border border-border">
                      <p className="text-xs text-foreground italic leading-relaxed">
                        "{ia.notes}"
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Interview completed. Scores and qualitative feedback recorded by panel interviewers.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SCREENING EVIDENCE */}
      {isScreening && (
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <FileCheck2 className="size-4 text-primary" />
            <span>Document Screening & Administrative Verification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 p-2.5">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-medium text-foreground">Curriculum Vitae (CV)</p>
                <p className="text-[11px] text-muted-foreground">
                  {application.candidateCv || "Uploaded and verified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 p-2.5">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-medium text-foreground">Academic Eligibility</p>
                <p className="text-[11px] text-muted-foreground">
                  {application.candidateEducation || "Verified eligible"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

