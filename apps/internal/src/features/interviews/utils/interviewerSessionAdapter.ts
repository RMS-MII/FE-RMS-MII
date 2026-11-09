import type {
  AssessmentRecommendation,
  InterviewerSessionDto,
  MyInterviewItem,
} from "../types"

function enumKey(value: string | number): string {
  return String(value).replace(/[_\s-]/g, "").toLowerCase()
}

export function mapAssessmentRecommendation(
  value: InterviewerSessionDto["assessmentRecommendation"]
): AssessmentRecommendation | undefined {
  if (value == null) return undefined
  const recommendations: Record<string, AssessmentRecommendation> = {
    "1": "Strongly Recommend",
    stronglyrecommend: "Strongly Recommend",
    "2": "Recommend",
    recommend: "Recommend",
    "3": "Consider",
    consider: "Consider",
    "4": "Not Recommend",
    notrecommend: "Not Recommend",
  }
  return recommendations[enumKey(value)]
}

export function mapInterviewerSession(
  dto: InterviewerSessionDto
): MyInterviewItem {
  const sessionStatus = enumKey(dto.sessionStatus)
  const interviewerStatus = enumKey(dto.interviewerStatus)
  let status: MyInterviewItem["status"] = "pending"

  if (interviewerStatus === "completed" || interviewerStatus === "2") {
    status = "completed"
  } else if (interviewerStatus === "cancelled" || interviewerStatus === "3") {
    status = "cancelled"
  } else if (sessionStatus === "rescheduled" || sessionStatus === "3") {
    status = "rescheduled"
  } else if (
    sessionStatus === "acceptedbyinterviewer" ||
    sessionStatus === "acceptedbycandidate" ||
    sessionStatus === "4" ||
    sessionStatus === "5"
  ) {
    status = "accepted"
  }

  const recommendation = mapAssessmentRecommendation(dto.assessmentRecommendation)
  const assessment =
    dto.isAssessmentSubmitted &&
    dto.assessmentScore !== null &&
    recommendation
      ? {
          sessionInterviewId: dto.sessionInterviewId,
          score: dto.assessmentScore,
          recommendation,
        }
      : null

  return {
    id: dto.sessionInterviewId,
    sessionId: dto.interviewSessionId,
    applicationStageId: undefined,
    candidateId: dto.candidateId,
    candidateName: dto.candidateName,
    candidateEmail: dto.candidateEmail,
    codeApplication: undefined,
    recruitmentId: undefined,
    recruitmentName: dto.batchName,
    recruitmentBatchCode: undefined,
    stageId: undefined,
    stageName: dto.stageName,
    sessionName: dto.sessionName,
    scheduledStart: dto.scheduledStart,
    scheduledEnd: dto.scheduledEnd,
    isOnline: dto.isOnline,
    meetingUrl: dto.meetingUrl,
    location: dto.location,
    status,
    interviewerEmployeeId: undefined,
    interviewerName: "You",
    interviewerEmail: "",
    coInterviewers: undefined,
    fileSubmission: dto.fileSubmission,
    endedSubmissionAt: dto.endedSubmissionAt,
    assessment,
    candidateSummary: undefined,
  }
}
