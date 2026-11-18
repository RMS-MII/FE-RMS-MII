import type {
  ApplicationStatusValue,
  FinalResultStatusValue,
  OfferingLetterStatusValue,
  ApplicationStageStatusValue,
  RecommendationValue,
  StageCategoryValue,
} from "./api-status"
import type {
  ApplicationStageRecapDto,
  ApplicationRecapSummaryDto,
  RecruitmentBatchSummaryDto,
  CandidateAnswerRecapDto,
} from "./application-recap"

// =====================================================================
// Matches BatchApplications & ApplicationStage tables in Document/ERD.sql
// =====================================================================

export interface CandidateDto {
  id: string
  fullName: string
  gender?: "Male" | "Female" | 1 | 2 | null
  email: string
  phoneNumber?: string | null
  birthDate?: string | null
  cv?: string | null
  portfolio?: string | null
  education?: string | null
  institution?: string | null
  address?: string | null
  expectedSalary?: number | null
  gpa?: number | null
  createdAt?: string
  updatedAt?: string | null
}

export interface BatchApplicationListItemDto {
  expectedSalary?: number | null
  id: string
  isStandalone?: boolean
  candidateId: string
  recruitmentBatchId: string
  codeApplication: string
  appliedAt?: string | null
  finalResultStatus?: FinalResultStatusValue | null
  status: ApplicationStatusValue
  notes?: string | null
  offeringLetterStatus?: OfferingLetterStatusValue | null
  fileOfferingLetter?: string | null
  createdAt?: string
  updatedAt?: string | null
  currentStageId?: string | null
  currentStageName?: string | null
  currentStageStatus?: ApplicationStageStatusValue | null
  candidate?: CandidateDto | null
}

export interface GetBatchApplicationsParams {
  id: string
  search?: string
  status?: ApplicationStatusValue
  stageId?: string
  page?: number
  pageSize?: number
  sortBy?: "name" | "code" | "stage" | "status" | "appliedAt"
  order?: "asc" | "desc"
}

export interface ApplicationDetailDto extends BatchApplicationListItemDto {
  candidate: CandidateDto
  batch: RecruitmentBatchSummaryDto
  stages: ApplicationStageRecapDto[]
  summary: ApplicationRecapSummaryDto
}

export interface RegisterCandidateItem {
  fullName: string
  gender?: number
  email: string
  phoneNumber?: string
  birthDate?: string
  cv?: string
  portfolio?: string
  education?: string
  institution?: string
  address?: string
  expectedSalary?: number
  gpa?: number
}

export interface RegisterCandidatesCommand {
  batchId: string
  candidates: RegisterCandidateItem[]
}

export interface EvaluateStageCommand {
  status: "Prioritized" | "Considered" | "Rejected" | "Dropped"
  notes?: string | null
}

export interface SetFinalResultCommand {
  finalResultStatus: "Accepted" | "Rejected"
  notes: string
}

export interface ApplicationStageDto {
  id: string
  batchApplicationId: string
  batchStageId: string
  batchStageName: string
  stageTypeId: string
  stageTypeName: string | null
  stageCategory: StageCategoryValue | null
  passingScore: number | null
  status: ApplicationStageStatusValue
  totalScore: number | null
  startedAt: string
  endAt: string
  completedAt: string | null
  notes: string | null
  isAttempts: boolean
  durationTest: string | null
  createdAt: string
  updatedAt: string | null
}

/** Matches BatchApplications table in ERD.sql */
export interface BatchApplication {
  id: string
  candidateId: string
  recruitmentBatchId: string
  codeApplication: string
  appliedAt?: string | null
  finalStatus?: string | null
  status?: string | null
  note?: string | null
  fileOfferingLetter?: string | null
  offeringLetterStatus?: string | null
  createdAt?: string
  updatedAt?: string | null
}

/** Matches ApplicationStage table in ERD.sql */
export interface ApplicationStageEntity {
  id: string
  batchApplicationId: string
  batchStageId: string
  status?: "pending" | "in_progress" | "passed" | "failed" | string | null
  totalScore?: number | null
  startedAt?: string | null
  endedAt?: string | null
  completedAt?: string | null
  notes?: string | null
  isAttempts?: boolean
  durationTest?: number | null
  createdAt?: string
  updatedAt?: string | null
}

export interface StageInterviewAssessmentItem {
  id: string
  interviewerId?: string
  employeeId?: string
  sessionInterviewId?: string
  interviewSessionId?: string
  sessionName?: string
  scheduledStart?: string
  interviewerEmail?: string
  interviewerName: string
  interviewerRole: string
  score: number
  recommendation:
    | "Strong Hire"
    | "Recommend"
    | "Do Not Recommend"
    | "Neutral"
    | "Strongly Recommend"
    | "Consider"
    | "Not Recommend"
    | "Unknown"
  apiRecommendation?: RecommendationValue
  notes: string
  assessedAt?: string
}

export interface StageTestEvaluationItem {
  totalQuestions?: number | null
  attemptedQuestions?: number | null
  passingScore: number | null
  score: number | null
  durationMinutes: number | null
  answers?: CandidateAnswerRecapDto[]
  submittedAt?: string
  /** Rekap skor DISC per trait untuk tes psikotest. */
  discSummaries?: DiscSummaryItem[]
}

export interface DiscSummaryItem {
  trait: string
  totalMost: number
  totalLeast: number
  difference: number
}

export interface CandidateApplicationStageItem {
  stageIndex: number
  sequence?: number
  /** Configuration ID used for UI navigation only. */
  stageId: string
  batchStageId: string
  lifecycleStatus?: "Inactive" | "Active" | "Completed" | 0 | 1 | 2
  /** Execution ID; null until the application stage has started. */
  applicationStageId: string | null
  apiStatus?: ApplicationStageStatusValue | null
  isStarted?: boolean
  isCompleted?: boolean
  isPassed?: boolean
  isAttempts?: boolean
  /** Whether recorded BE data satisfies the category-specific stage evaluation preconditions. */
  evaluationReady?: boolean
  startDate?: string
  endDate?: string
  endAt?: string | null
  stageName: string
  stageType?: string
  stageTypeName?: string
  passingScore?: number | null
  status:
    | "pending"
    | "in_progress"
    | "passed"
    | "failed"
    | "upcoming"
    | "withdrawn"
    | string
  totalScore?: number | null
  startedAt?: string | null
  completedAt?: string | null
  notes?: string | null
  feedback?: string | null
  testEvaluation?: StageTestEvaluationItem
  interviewAssessments?: StageInterviewAssessmentItem[]
}

export type ApplicationStageItem = CandidateApplicationStageItem

export interface CandidateApplicationDetailItem extends CandidateApplicationItem {
  batch: RecruitmentBatchSummaryDto
  summary: ApplicationRecapSummaryDto
}

/** Rich view model joining BatchApplications, Candidates, and ApplicationStages */
export interface CandidateApplicationItem {
  expectedSalary?: number | null
  id: string // BatchApplication.Id
  isStandalone?: boolean
  candidateId: string
  recruitmentBatchId: string
  codeApplication: string // e.g. "APP-2026-001"
  appliedAt: string
  status:
    "in_progress" | "pending" | "accepted" | "rejected" | "withdrawn" | string
  finalStatus?: "accepted" | "rejected" | "pending" | string | null
  rejectReason?: string | null
  note?: string | null
  fileOfferingLetter?: string | null
  offeringLetterStatus?: string | null

  // Candidate Profile fields (from Candidates table)
  candidateName: string
  candidateEmail: string
  candidatePhone?: string | null
  candidateEducation?: string | null
  candidateInstitution?: string | null
  candidateGpa?: string | null
  candidateCv?: string | null
  candidatePortfolio?: string | null

  // Stage progress fields (from ApplicationStage & BatchStage)
  currentStageIndex: number
  currentStageName: string
  currentStageScore?: number | null
  currentStageStatus:
    | "pending"
    | "in_progress"
    | "passed"
    | "failed"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | string
  applicationStages: CandidateApplicationStageItem[]
}
