// =====================================================================
// Matches InterviewSession, SessionInterview, InterviewAssessment, 
// and RescheduleRequest tables in Document/ERD.sql
// =====================================================================

export type InterviewSessionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rescheduled"

export type InterviewMode = "online" | "onsite"

export type RescheduleRequestStatus = "pending" | "approved" | "rejected"

/** Matches InterviewSession table in ERD.sql */
export interface InterviewSession {
  id: string
  applicationStageId: string
  sessionName: string
  scheduledStart: string
  scheduledEnd: string
  isOnline: boolean
  location?: string | null
  meetingUrl?: string | null
  status: InterviewSessionStatus
  createdAt?: string
  updatedAt?: string | null
  createdBy?: string | null
  fileSubmission?: string | null
  endedSubmissionAt?: string | null
}

/** Matches SessionInterview table in ERD.sql */
export interface SessionInterview {
  id: string
  stageEmployeeId: string
  interviewSessionId: string
  status?: "assigned" | "accepted" | "declined" | "completed" | string | null
  createdAt?: string
  updatedAt?: string | null
}

/** Matches InterviewAssessment table in ERD.sql */
export interface InterviewAssessment {
  id: string
  sessionInterviewId: string
  notes?: string | null
  recommendation?: "Strong Hire" | "Recommend" | "Neutral" | "Do Not Recommend" | string | null
  score?: number | null
  createdAt?: string
  updatedAt?: string | null
}

/** Matches RescheduleRequest table in ERD.sql */
export interface RescheduleRequest {
  id: string
  interviewSessionId: string
  requesterEmail: string
  proposedStart: string
  proposedEnd: string
  reason?: string | null
  status: RescheduleRequestStatus
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewNotes?: string | null
}

// ---------------------------------------------------------------------
// UI View Models for Tab Interviews
// ---------------------------------------------------------------------

export interface InterviewerAssignmentItem {
  id: string // SessionInterview.Id
  stageEmployeeId?: string
  employeeId: string
  employeeName: string
  employeeEmail: string
  role?: string
  status: "assigned" | "accepted" | "declined" | "completed" | "pending"
  assessment?: {
    id: string
    score: number
    recommendation: "Strong Hire" | "Recommend" | "Neutral" | "Do Not Recommend" | string
    notes?: string
    assessedAt?: string
  } | null
}

export interface RescheduleRequestItem {
  id: string
  interviewSessionId: string
  requesterEmail: string
  proposedStart: string
  proposedEnd: string
  reason: string
  status: RescheduleRequestStatus
  reviewedBy?: string | null
  reviewedByName?: string | null
  reviewedAt?: string | null
  reviewNotes?: string | null
}

/**
 * Rich view model for Tab Interviews:
 * Combines InterviewSession, ApplicationStage, Candidate, Interviewers, and RescheduleRequest.
 * Focuses on schedule, logistics, meeting link/room, and reschedule workflow.
 */
export interface InterviewSessionItem {
  id: string // InterviewSession.Id
  applicationStageId: string
  recruitmentBatchId: string
  stageId: string
  stageName: string
  sessionName: string
  scheduledStart: string
  scheduledEnd: string
  isOnline: boolean
  location?: string | null
  meetingUrl?: string | null
  status: InterviewSessionStatus
  fileSubmission?: string | null
  endedSubmissionAt?: string | null

  // Candidate logistics (clean and non-redundant)
  candidateId: string
  candidateName: string
  candidateEmail: string
  candidateAvatar?: string
  codeApplication: string

  // Assigned interviewers & assessment status
  interviewers: InterviewerAssignmentItem[]

  // Reschedule request if any
  rescheduleRequest?: RescheduleRequestItem | null
}

export interface InterviewFilterParams {
  search?: string
  stageId?: string
  status?: string
  mode?: "all" | "online" | "onsite"
  date?: string
}

