// =====================================================================
// Domain types for Interviewer Role (SessionInterview & InterviewAssessment)
// Matches Document/ERD.sql
// =====================================================================

export type MyInterviewStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "completed"
  | "reschedule_requested"
  | "rescheduled"
  | "cancelled"

export type InterviewMode = "online" | "onsite"

export type AssessmentRecommendation =
  | "Strongly Recommend"
  | "Recommend"
  | "Consider"
  | "Not Recommend"

export type ApiAssessmentRecommendation =
  | "StronglyRecommend"
  | "Recommend"
  | "Consider"
  | "NotRecommend"

export interface InterviewAssessmentItem {
  id?: string // Not provided by the interviewer sessions GET response.
  sessionInterviewId: string
  score: number // 0 - 100
  recommendation: AssessmentRecommendation
  notes?: string
  assessedAt?: string
}

export interface CoInterviewerItem {
  id: string // Employee.Id or SessionInterview.Id
  name: string
  email: string
  avatar?: string
  role?: string // e.g. "Frontend Architect", "Engineering Manager", "Lead HR"
  status: "pending" | "accepted" | "declined"
}

export interface RescheduleRequestItem {
  id: string
  proposedStart: string
  proposedEnd: string
  reason: string
  status: "pending" | "approved" | "rejected"
  requestedAt: string
}

export interface CreateRescheduleRequest {
  interviewSessionId: string
  proposedStart: string
  proposedEnd: string
  reason: string
}

export interface InterviewerRescheduleRequestDto {
  id: string
  interviewSessionId: string
  sessionName: string
  candidateId: string
  candidateName: string
  originalStart: string
  originalEnd: string
  requesterEmail: string
  proposedStart: string
  proposedEnd: string
  reason: string
  status: "Pending" | "Approved" | "Rejected" | 1 | 2 | 3
  statusName: string
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewNotes?: string | null
  createdAt: string
}

export interface MyInterviewItem {
  id: string // SessionInterview.Id
  sessionId: string // InterviewSession.Id
  applicationStageId?: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  candidateAvatar?: string
  codeApplication?: string

  // Recruitment batch & stage info
  recruitmentId?: string
  recruitmentName: string
  recruitmentBatchCode?: string
  stageId?: string
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
  interviewerEmployeeId?: string
  interviewerName: string
  interviewerEmail: string
  declineReason?: string | null

  // Co-interviewers assigned to this same interview session
  coInterviewers?: CoInterviewerItem[]

  // Reschedule request if any (from RescheduleRequest table)
  rescheduleRequest?: RescheduleRequestItem | null

  // Candidate take-home file submission if any (from InterviewSession table)
  fileSubmission?: string | null
  endedSubmissionAt?: string | null

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
  recommendation: ApiAssessmentRecommendation
  notes: string
}

export type InterviewerSessionStatusValue =
  | "Scheduled"
  | "PendingConfirmation"
  | "Rescheduled"
  | "AcceptedByInterviewer"
  | "AcceptedByCandidate"
  | 1
  | 2
  | 3
  | 4
  | 5

export type SessionInterviewStatusValue =
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | 1
  | 2
  | 3

export interface InterviewerSessionDto {
  sessionInterviewId: string
  interviewSessionId: string
  sessionName: string
  scheduledStart: string
  scheduledEnd: string
  isOnline: boolean
  meetingUrl: string | null
  location: string | null
  sessionStatus: InterviewerSessionStatusValue
  sessionStatusName?: string
  interviewerStatus: SessionInterviewStatusValue
  interviewerStatusName?: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  batchName: string
  stageName: string
  hasTakeHome: boolean
  endedSubmissionAt: string | null
  fileSubmission: string | null
  isAssessmentSubmitted: boolean
  assessmentScore: number | null
  assessmentRecommendation: ApiAssessmentRecommendation | number | null
  assessmentRecommendationName?: string | null
}

export interface ConfirmInterviewResponseDto {
  sessionInterviewId: string
  interviewSessionId: string
  sessionName: string
  scheduledStart: string
  scheduledEnd: string
  isOnline: boolean
  meetingUrl: string | null
  location: string | null
  sessionStatus: InterviewerSessionStatusValue
  sessionStatusName?: string
  candidateName: string
  candidateEmail: string
  candidateInvitationEmailSent: boolean
  message: string
}

export interface SubmitInterviewAssessmentDto {
  assessmentId: string
  sessionInterviewId: string
  interviewSessionId: string
  sessionName: string
  candidateId: string
  candidateName: string
  score: number
  recommendation: ApiAssessmentRecommendation | number
  recommendationName?: string
  notes: string | null
  interviewerStatus: SessionInterviewStatusValue
  interviewerStatusName?: string
  createdAt: string
  updatedAt: string | null
}

export type MyInterviewFilterParams = {
  search?: string
  status?: "all" | MyInterviewStatus
  mode?: "all" | "online" | "onsite"
}

// =====================================================================
// Stage Employee Mandate (Level 1: Undangan Pewawancara Tahap Rekrutmen)
// Matches StageEmployee table in Document/ERD.sql
// =====================================================================

export type StageInvitationStatus =
  "pending" | "accepted" | "declined" | "unknown"
export type StageInvitationFilter = "all" | "pending" | "accepted" | "declined"

export interface StageInvitationItem {
  id: string // StageEmployee.Id
  batchStageId: string // BatchStage.Id
  recruitmentId: string // RecruitmentBatch.Id
  recruitmentName: string
  recruitmentBatchCode: string
  stageId: string
  stageName: string
  stageTypeName: string
  startDate: string
  endDate: string
  status: StageInvitationStatus
  assignedAt: string
  respondedAt?: string | null
  note: string | null
}

export * from "./invitations"
