import type {
  ApplicationDetailDto,
  ApplicationStageRecapDto,
  CandidateApplicationDetailItem,
  CandidateApplicationStageItem,
  StageInterviewAssessmentItem,
} from "../types"
import {
  mapApplicationStageStatus,
  mapApplicationStatus,
  mapFinalResultStatus,
  mapRecommendation,
} from "./statusAdapters"

/** Parse the invariant .NET TimeSpan format: [days.]hh:mm:ss[.fffffff]. */
export function parseTimeSpanMinutes(
  value: string | null | undefined
): number | null {
  if (value == null) return null
  const parts =
    /^(?:(\d+)\.)?(\d{2}):([0-5]\d):([0-5]\d)(?:\.(\d{1,7}))?$/.exec(value)
  if (!parts) return null
  const hours = Number(parts[2])
  if (hours > 23) return null
  const seconds = Number(parts[4]) + Number(`0.${parts[5] ?? "0"}`)
  const minutes =
    Number(parts[1] ?? 0) * 1440 + hours * 60 + Number(parts[3]) + seconds / 60
  return Number.isFinite(minutes) ? minutes : null
}

function mapAssessments(
  stage: ApplicationStageRecapDto
): StageInterviewAssessmentItem[] {
  const employees = new Map(
    stage.interviewers.map((employee) => [employee.employeeId, employee])
  )
  return stage.interviewSessions.flatMap((session) =>
    session.interviewers.flatMap((interviewer) => {
      const assessment = interviewer.assessment
      if (!assessment) return []
      const employee = employees.get(interviewer.employeeId)
      const recommendation = mapRecommendation(assessment.recommendation)
      const labels = {
        StronglyRecommend: "Strongly Recommend",
        Recommend: "Recommend",
        Consider: "Consider",
        NotRecommend: "Not Recommend",
      } as const
      return [
        {
          id: assessment.id,
          employeeId: interviewer.employeeId,
          sessionInterviewId: interviewer.id,
          interviewSessionId: session.id,
          sessionName: session.sessionName,
          scheduledStart: session.scheduledStart,
          interviewerName:
            interviewer.employeeName ||
            employee?.fullName ||
            "Name not available",
          interviewerEmail: employee?.email,
          interviewerRole: employee?.jobTitle ?? "",
          score: assessment.score,
          recommendation: recommendation ? labels[recommendation] : "Unknown",
          apiRecommendation: assessment.recommendation,
          notes: assessment.notes ?? "",
          assessedAt: assessment.updatedAt ?? assessment.createdAt,
        },
      ]
    })
  )
}

function mapStage(
  stage: ApplicationStageRecapDto,
  index: number
): CandidateApplicationStageItem {
  const category = String(stage.stageCategory ?? "").toLowerCase()
  const stageType =
    category === "1" || category === "test"
      ? "test"
      : category === "2" || category === "interview"
        ? "interview"
        : "other"
  const evaluationReady =
    stageType === "test"
      ? mapApplicationStageStatus(stage.status) === "submitted" ||
        (stage.isCompleted && stage.isAttempts)
      : stageType === "interview"
        ? (() => {
            const sessions = stage.interviewSessions.filter(
              (session) =>
                !["3", "rescheduled"].includes(
                  String(session.status).toLowerCase()
                )
            )
            const activeAssignments = sessions.flatMap((session) =>
              session.interviewers.filter(
                (interviewer) =>
                  !["3", "cancelled"].includes(
                    String(interviewer.status).toLowerCase()
                  )
              )
            )
            return (
              sessions.length > 0 &&
              activeAssignments.length > 0 &&
              activeAssignments.every((interviewer) => interviewer.assessment)
            )
          })()
        : false
  return {
    stageIndex: index,
    sequence: stage.sequence,
    stageId: stage.batchStageId,
    batchStageId: stage.batchStageId,
    lifecycleStatus: stage.lifecycleStatus,
    applicationStageId: stage.applicationStageId,
    apiStatus: stage.status,
    stageName: stage.stageName,
    stageType,
    stageTypeName: stage.stageTypeName ?? undefined,
    passingScore: stage.passingScore,
    status: stage.isStarted
      ? mapApplicationStageStatus(stage.status)
      : "upcoming",
    isStarted: stage.isStarted,
    isCompleted: stage.isCompleted,
    isPassed: stage.isPassed,
    isAttempts: stage.isAttempts,
    evaluationReady,
    totalScore: stage.totalScore,
    startDate: stage.startDate,
    endDate: stage.endDate,
    startedAt: stage.startedAt,
    endAt: stage.endAt,
    completedAt: stage.completedAt,
    notes: stage.notes,
    testEvaluation:
      stageType === "test"
        ? {
            totalQuestions: null, // The recap contains recorded answers, not the complete question bank.
            attemptedQuestions: null,
            passingScore: stage.passingScore,
            score: stage.totalScore,
            durationMinutes: parseTimeSpanMinutes(stage.durationTest),
            answers: stage.testAnswers,
          }
        : undefined,
    interviewAssessments: mapAssessments(stage),
  }
}

export function mapApplicationRecap(
  dto: ApplicationDetailDto
): CandidateApplicationDetailItem {
  const stages = [...dto.stages]
    .sort((a, b) => a.sequence - b.sequence)
    .map(mapStage)
  const summary = dto.summary
  let currentStageIndex = summary.currentBatchStageId
    ? stages.findIndex(
        (stage) => stage.batchStageId === summary.currentBatchStageId
      )
    : -1
  if (currentStageIndex < 0 && summary.currentApplicationStageId) {
    currentStageIndex = stages.findIndex(
      (stage) => stage.applicationStageId === summary.currentApplicationStageId
    )
  }
  const currentStage = stages[currentStageIndex]
  const candidate = dto.candidate
  return {
    id: dto.id,
    isStandalone: dto.isStandalone,
    candidateId: dto.candidateId,
    recruitmentBatchId: dto.recruitmentBatchId,
    codeApplication: dto.codeApplication,
    appliedAt: dto.appliedAt ?? dto.createdAt ?? "",
    status: mapApplicationStatus(dto.status),
    finalStatus: mapFinalResultStatus(dto.finalResultStatus),
    note: dto.notes,
    rejectReason:
      mapApplicationStatus(dto.status) === "rejected" ? dto.notes : null,
    fileOfferingLetter: dto.fileOfferingLetter,
    offeringLetterStatus:
      dto.offeringLetterStatus != null
        ? String(dto.offeringLetterStatus)
        : null,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    candidatePhone: candidate.phoneNumber,
    candidateEducation: candidate.education,
    candidateInstitution: candidate.institution,
    candidateGpa: candidate.gpa != null ? String(candidate.gpa) : null,
    candidateCv: candidate.cv,
    candidatePortfolio: candidate.portfolio,
    currentStageIndex,
    currentStageName:
      summary.currentStageName ??
      currentStage?.stageName ??
      (summary.isAllStagesCompleted
        ? "All stages completed"
        : "No active stage"),
    currentStageStatus: currentStage?.status ?? "unknown",
    currentStageScore: currentStage?.totalScore ?? null,
    applicationStages: stages,
    batch: dto.batch,
    summary,
  }
}
