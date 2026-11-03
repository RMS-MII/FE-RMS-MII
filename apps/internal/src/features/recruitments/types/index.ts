export type RecruitmentStatus = "draft" | "running" | "completed" | "closed"
export type StageType = "screening" | "test" | "interview" | "offering"

export interface Stage {
  id: string
  name: string
  type: StageType
  durationDays: number
  ownerId: string
}

/** Matches Department table in ERD.sql */
export interface Department {
  id: string
  parentDepartmentId?: string | null
  code: string
  name: string
  description?: string
}

/** Matches RecruitmentBatch table in ERD.sql with UI mapped fields */
export interface Recruitment {
  id: string
  /** BatchCode in ERD.sql */
  code: string
  /** Name in ERD.sql */
  name: string
  /** Department.Name in ERD.sql */
  division: string
  departmentId?: string
  location: string
  quota: number
  /** StartDate in ERD.sql */
  openDate: string
  /** EndDate in ERD.sql */
  closeDate: string
  /** Status in ERD.sql */
  status: RecruitmentStatus
  currentStage: number
  ownerId: string
  /** Description in ERD.sql */
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

export interface CreateRecruitmentFormData {
  name: string
  departmentId: string
  description: string
  openDate: string
  closeDate: string
}
