// API enum names follow WEBAPI/Entities/Enums/Enums.cs. Numeric values support legacy responses.
export type BatchStatusValue = "Draft" | "Open" | "Closed" | 1 | 2 | 3
export type ApplicationStatusValue =
  "InProcess" | "Rejected" | "Dropped" | "Accepted" | 1 | 2 | 3 | 4
export type FinalResultStatusValue = "Accepted" | "Rejected" | 1 | 2
export type OfferingLetterStatusValue =
  "Pending" | "Approved" | "Rejected" | "Negotiate" | 1 | 2 | 3 | 4
export type ApplicationStageStatusValue =
  | "InProgress"
  | "Submitted"
  | "Expired"
  | "Prioritized"
  | "Considered"
  | "Rejected"
  | "Dropped"
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
export type StageEmployeeStatusValue =
  "Pending" | "Accepted" | "Declined" | 1 | 2 | 3
export type SessionInterviewStatusValue =
  "InProgress" | "Completed" | "Cancelled" | 1 | 2 | 3
export type InterviewSessionStatusValue =
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
export type RescheduleStatusValue =
  "Pending" | "Approved" | "Rejected" | 1 | 2 | 3
export type RecommendationValue =
  | "StronglyRecommend"
  | "Recommend"
  | "Consider"
  | "NotRecommend"
  | 1
  | 2
  | 3
  | 4
export type StageCategoryValue = "Test" | "Interview" | 1 | 2
