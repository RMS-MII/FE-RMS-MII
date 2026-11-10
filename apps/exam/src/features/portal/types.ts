export type StatusValue = string | number

export interface CandidateTasks {
  candidateId: string
  candidateName: string
  candidateEmail: string
  applications: CandidateApplicationTask[]
}

export interface CandidateApplicationTask {
  id: string
  codeApplication: string
  recruitmentBatchId: string
  batchName: string
  departmentId: string
  departmentName: string
  status: StatusValue
  finalResultStatus: StatusValue | null
  offeringLetterStatus: StatusValue
  fileOfferingLetter: string | null
  appliedAt: string
  stages: CandidateStageTask[]
}

export interface CandidateStageTask {
  applicationStageId: string
  batchStageId: string
  stageName: string
  stageTypeId: string
  stageTypeName: string
  stageCategory: StatusValue | null
  status: StatusValue
  startedAt: string
  endAt: string
  attemptStartedAt: string | null
  completedAt: string | null
  isAttempts: boolean
  durationTest: string | null
  canTakeTest: boolean
  canConfirmSchedule: boolean
  canUploadSubmission: boolean
  canRequestReschedule: boolean
  sessions: CandidateSessionTask[]
}

export interface CandidateSessionTask {
  id: string
  sessionName: string
  scheduledStart: string
  scheduledEnd: string
  isOnline: boolean
  location: string | null
  meetingUrl: string | null
  status: StatusValue
  endedSubmissionAt: string | null
  fileSubmission: string | null
  isSubmitted: boolean
  canConfirm: boolean
  canUploadSubmission: boolean
  canRequestReschedule: boolean
}
