import type { InterviewerInvitationDto } from "./invitations"

export type InterviewerTaskTypeValue =
  | "PendingInvitation"
  | "SessionConfirmation"
  | "PendingAssessment"
  | "TakeHomeReview"
  | "UpcomingSession"
  | 1
  | 2
  | 3
  | 4
  | 5

export type InterviewerDashboardSessionStatusValue =
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

export type InterviewerDashboardInterviewerStatusValue =
  "InProgress" | "Completed" | "Cancelled" | 1 | 2 | 3

export type InterviewerDashboardRecommendation =
  | "StronglyRecommend"
  | "Recommend"
  | "Consider"
  | "NotRecommend"
  | 1
  | 2
  | 3
  | 4
  | null

export interface InterviewerDashboardSummaryDto {
  pendingInvitationsCount: number
  sessionsToConfirmCount: number
  upcomingSessionsCount: number
  pendingAssessmentsCount: number
  takeHomeReviewsCount: number
  completedAssessmentsCount: number
  activeTasksCount: number
  overdueTasksCount: number
}

export interface InterviewerActiveTaskDto {
  taskType: InterviewerTaskTypeValue
  taskTypeName: string
  priority: number
  isActionable: boolean
  isOverdue: boolean
  title: string
  description: string | null
  stageEmployeeId: string | null
  batchId: string | null
  batchName: string
  stageId: string | null
  stageName: string
  applicationStageId: string | null
  interviewSessionId: string | null
  sessionInterviewId: string | null
  sessionName: string | null
  scheduledStart: string | null
  scheduledEnd: string | null
  candidateId: string | null
  candidateName: string | null
  dueAt: string | null
  isLead: boolean
}

export interface InterviewerDashboardPanelMemberDto {
  sessionInterviewId: string
  fullName: string
  email: string
  jobTitle: string
  status: InterviewerDashboardInterviewerStatusValue
  isLead: boolean
}

export interface InterviewerDashboardSessionDto {
  sessionInterviewId: string
  interviewSessionId: string
  sessionName: string
  scheduledStart: string
  scheduledEnd: string
  isOnline: boolean
  meetingUrl: string | null
  location: string | null
  sessionStatus: InterviewerDashboardSessionStatusValue
  sessionStatusName?: string
  interviewerStatus: InterviewerDashboardInterviewerStatusValue
  interviewerStatusName?: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  batchName: string
  stageName: string
  hasTakeHome: boolean
  canAssignTakeHome: boolean
  endedSubmissionAt: string | null
  fileTakeHome: string | null
  fileSubmission: string | null
  isLead: boolean
  panelInterviewers: InterviewerDashboardPanelMemberDto[]
  isAssessmentSubmitted: boolean
  assessmentScore: number | null
  assessmentRecommendation: InterviewerDashboardRecommendation
  assessmentRecommendationName?: string | null
}

export interface InterviewerDashboardDto {
  serverTimeUtc: string
  summary: InterviewerDashboardSummaryDto
  activeTasks: InterviewerActiveTaskDto[]
  upcomingSessions: InterviewerDashboardSessionDto[]
  recentSessions: InterviewerDashboardSessionDto[]
  pendingInvitations: InterviewerInvitationDto[]
}
