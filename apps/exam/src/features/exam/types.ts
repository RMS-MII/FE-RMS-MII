export type QuestionType = "SingleChoice" | "MultipleChoice" | string

export interface CandidateTestOption {
  id: string
  optionLabel: string
  optionText: string
  sequenceNumber: number
}

export interface CandidateTestQuestion {
  id: string
  questionText: string
  questionType: QuestionType
  sequenceNumber: number
  isRequired: boolean
  options: CandidateTestOption[]
}

export interface CandidateTest {
  candidateId: string
  candidateName: string
  applicationId: string
  applicationStageId: string
  batchStageId: string
  stageName: string
  stageTypeId: string
  stageTypeName: string
  stageCategory: string
  startedAt: string
  endAt: string
  attemptStartedAt: string | null
  serverTimeUtc: string
  durationTest: string | null
  isAttempts: boolean
  totalQuestions: number
  questions: CandidateTestQuestion[]
}

export interface SubmitTestAnswer {
  questionId: string
  selectedOptionIds: string[]
}

export interface StartTestResult {
  applicationStageId: string
  attemptStartedAt: string
  deadline: string | null
  serverTimeUtc: string
}

export interface SubmitAnswerResult {
  applicationStageId: string
  batchStageId: string
  stageName: string
  submittedAnswerCount: number
  serverTimeUtc: string
}

export interface FinishTestResult {
  applicationStageId: string
  batchStageId: string
  stageName: string
  completedAt: string | null
  serverTimeUtc: string
}

export type ExamAnswers = Record<string, string[]>
export type DevelopmentOutcome = "pass" | "fail"
