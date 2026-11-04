// =====================================================================
// Domain types for Interviewer Role (SessionInterview & InterviewAssessment)
// Matches Document/ERD.sql
// =====================================================================

export type MyInterviewStatus = "pending" | "accepted" | "declined" | "completed"

export type InterviewMode = "online" | "onsite"

export type AssessmentRecommendation =
  | "Strong Hire"
  | "Recommend"
  | "Neutral"
  | "Do Not Recommend"

export interface InterviewAssessmentItem {
  id: string // InterviewAssessment.Id
  sessionInterviewId: string
  score: number // 0 - 100
  recommendation: AssessmentRecommendation
  notes: string
  assessedAt: string
}

export interface MyInterviewItem {
  id: string // SessionInterview.Id
  sessionId: string // InterviewSession.Id
  applicationStageId: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  candidateAvatar?: string
  codeApplication: string

  // Recruitment batch & stage info
  recruitmentId: string
  recruitmentName: string
  recruitmentBatchCode: string
  stageId: string
  stageName: string

  // Timing & Logistics
  sessionName: string
  scheduledStart: string
  scheduledEnd: string
  isOnline: boolean
  meetingUrl?: string | null
  location?: string | null

  // Interviewer assignment status
  status: MyInterviewStatus
  interviewerEmployeeId: string
  interviewerName: string
  interviewerEmail: string
  declineReason?: string | null

  // Result assessment if completed
  assessment?: InterviewAssessmentItem | null

  // Candidate summary for quick review
  candidateSummary?: {
    currentJobTitle?: string
    yearsOfExperience?: number
    skills?: string[]
    resumeUrl?: string
    gpa?: number
    education?: string
  }
}

export interface SubmitAssessmentPayload {
  score: number
  recommendation: AssessmentRecommendation
  notes: string
}

export interface MyInterviewFilterParams {
  search?: string
  status?: "all" | MyInterviewStatus
  mode?: "all" | "online" | "onsite"
}

