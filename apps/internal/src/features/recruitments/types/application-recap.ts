import type {
  ApplicationStageStatusValue,
  BatchStatusValue,
  InterviewSessionStatusValue,
  RecommendationValue,
  SessionInterviewStatusValue,
  StageCategoryValue,
  StageEmployeeStatusValue,
} from "./api-status"

export interface RecruitmentBatchSummaryDto {
  id: string
  departmentId: string
  departmentName: string | null
  batchCode: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: BatchStatusValue
}

export interface StageInterviewerRecapDto {
  id: string // StageEmployeeId
  employeeId: string
  fullName: string
  email: string
  jobTitle: string
  status: StageEmployeeStatusValue
  note: string | null
}

export interface InterviewAssessmentRecapDto {
  id: string
  notes: string | null
  recommendation: RecommendationValue
  score: number
  createdAt: string
  updatedAt: string | null
}

export interface SessionInterviewerRecapDto {
  id: string // SessionInterviewId
  stageEmployeeId: string
  employeeId: string
  employeeName: string
  status: SessionInterviewStatusValue
  assessment: InterviewAssessmentRecapDto | null
}

export interface InterviewSessionRecapDto {
  id: string // InterviewSessionId
  sessionName: string
  scheduledStart: string
  scheduledEnd: string
  isOnline: boolean
  location: string | null
  meetingUrl: string | null
  status: InterviewSessionStatusValue
  fileSubmission: string | null
  endedSubmissionAt: string | null
  interviewers: SessionInterviewerRecapDto[]
}

export interface CandidateAnswerRecapDto {
  id: string
  questionText: string
  questionOptionText: string
  score: number
  createdAt: string
  updatedAt: string | null
}

export interface DiscSummaryRecapDto {
  trait: string
  totalMost: number
  totalLeast: number
  difference: number
}

export interface ApplicationStageRecapDto {
  applicationStageId: string | null
  batchStageId: string
  lifecycleStatus: "Inactive" | "Active" | "Completed" | 0 | 1 | 2
  sequence: number
  stageName: string
  stageTypeId: string
  stageTypeName: string | null
  stageCategory: StageCategoryValue | null
  passingScore: number | null
  startDate: string
  endDate: string
  nextStageId: string | null
  status: ApplicationStageStatusValue | null
  totalScore: number | null
  startedAt: string | null
  endAt: string | null
  completedAt: string | null
  notes: string | null
  isAttempts: boolean
  durationTest: string | null // Serialized TimeSpan, not a duration in minutes.
  isStarted: boolean
  isCompleted: boolean
  isPassed: boolean
  interviewers: StageInterviewerRecapDto[]
  interviewSessions: InterviewSessionRecapDto[]
  testAnswers: CandidateAnswerRecapDto[]
  discSummaries: DiscSummaryRecapDto[]
}

export interface ApplicationRecapSummaryDto {
  totalStages: number
  startedStages: number
  completedStages: number
  passedStages: number
  rejectedStages: number
  currentBatchStageId: string | null
  currentApplicationStageId: string | null
  currentStageName: string | null
  currentStageStatus: ApplicationStageStatusValue | null
  isAllStagesCompleted: boolean
  canFinalize: boolean
}
