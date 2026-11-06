// =====================================================================
// Matches BatchApplications & ApplicationStage tables in Document/ERD.sql
// =====================================================================

export interface CandidateDto {
  id: string
  fullName: string
  gender?: number | null
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
  id: string
  candidateId: string
  recruitmentBatchId: string
  codeApplication: string
  appliedAt?: string | null
  finalResultStatus?: string | null
  status: number | string
  notes?: string | null
  offeringLetterStatus?: number | null
  fileOfferingLetter?: string | null
  createdAt?: string
  updatedAt?: string | null
  candidate?: CandidateDto | null
}

export interface GetBatchApplicationsParams {
  id: string
  search?: string
  status?: number
  page?: number
  pageSize?: number
}

export interface ApplicationDetailDto {
  id: string
  candidateId: string
  recruitmentBatchId: string
  codeApplication: string
  appliedAt?: string | null
  finalResultStatus?: string | null
  status: number | string
  notes?: string | null
  offeringLetterStatus?: number | null
  fileOfferingLetter?: string | null
  createdAt?: string
  updatedAt?: string | null
  candidate?: CandidateDto | null
  batch?: any
  stages?: any[]
  summary?: any
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
  stageId: string
  status?: number
  notes?: string
}

export interface SetFinalResultCommand {
  applicationId: string
  finalResultStatus?: number
  notes?: string
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
  interviewerName: string
  interviewerRole: string
  score: number
  recommendation: "Strong Hire" | "Recommend" | "Do Not Recommend" | "Neutral"
  notes: string
  assessedAt?: string
}

export interface StageTestEvaluationItem {
  totalQuestions: number
  attemptedQuestions: number
  passingScore: number
  score: number
  durationMinutes: number
  submittedAt?: string
}

export interface CandidateApplicationStageItem {
  stageIndex: number
  stageId: string
  stageName: string
  stageType?: string
  stageTypeName?: string
  passingScore?: number | null
  status: "pending" | "in_progress" | "passed" | "failed" | "upcoming" | "withdrawn" | string
  totalScore?: number | null
  startedAt?: string | null
  completedAt?: string | null
  notes?: string | null
  feedback?: string | null
  testEvaluation?: StageTestEvaluationItem
  interviewAssessments?: StageInterviewAssessmentItem[]
}

export type ApplicationStageItem = CandidateApplicationStageItem

/** Rich view model joining BatchApplications, Candidates, and ApplicationStages */
export interface CandidateApplicationItem {
  id: string // BatchApplication.Id
  candidateId: string
  recruitmentBatchId: string
  codeApplication: string // e.g. "APP-2026-001"
  appliedAt: string
  status: "in_progress" | "pending" | "accepted" | "rejected" | "withdrawn" | string
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
  currentStageStatus: "pending" | "in_progress" | "passed" | "failed" | "accepted" | "rejected" | "withdrawn" | string
  applicationStages: CandidateApplicationStageItem[]
}
