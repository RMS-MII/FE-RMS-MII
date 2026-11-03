export type RecruitmentStatus = "draft" | "running" | "completed" | "closed"
export type StageType = "screening" | "test" | "interview" | "offering"

export interface Stage {
  id: string
  name: string
  type: StageType
  durationDays: number
  ownerId: string
}

export interface Recruitment {
  id: string
  code: string
  name: string
  division: string
  location: string
  quota: number
  openDate: string
  closeDate: string
  status: RecruitmentStatus
  currentStage: number
  ownerId: string
  description: string
  stages: Stage[]
}

export type StageState = "done" | "current" | "upcoming" | "halted"

export interface PipelineItem {
  name: string
  count?: number
  state: StageState
  note?: string
}

