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
  recommendation: AssessmentRecommendation
  notes: string
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

export type StageInvitationStatus = "pending" | "accepted" | "declined"

export interface StagePanelistItem {
  employeeId: string
  name: string
  role: string
  isYou?: boolean
}

export interface StageInvitationItem {
  id: string // StageEmployee.Id
  batchStageId: string // BatchStage.Id
  recruitmentId: string // RecruitmentBatch.Id
  recruitmentName: string
  recruitmentBatchCode: string
  department: string
  stageId: string
  stageName: string
  stageType: string
  startDate: string
  endDate: string
  status: StageInvitationStatus
  assignedAt: string
  respondedAt?: string | null
  declineReason?: string | null
  estimatedCandidates: number
  assignedPanelists?: StagePanelistItem[]
}
