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

export interface SubmitTestCommand {
  candidateId: string
  stageId: string
  answers: SubmitTestAnswer[]
}

export interface SubmitTestResult {
  applicationStageId: string
  batchStageId: string
  stageName: string
  status: string | number
  totalScore: number | string | null
  completedAt: string | null
  serverTimeUtc: string
}

export type ExamAnswers = Record<string, string[]>
