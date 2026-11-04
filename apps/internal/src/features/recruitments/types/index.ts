import type { Tone } from "@/shared/components"

// =====================================================================
// ERD-Compliant Types (Document/ERD.sql)
// =====================================================================

export type RecruitmentStatus = "draft" | "running" | "completed" | "closed"
export type LegacyStageType = "screening" | "test" | "interview" | "offering"
export type StageType = LegacyStageType

/** Matches Department table in ERD.sql */
export interface Department {
  id: string
  parentDepartmentId?: string | null
  code: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string | null
}

/** Matches StageType table in ERD.sql */
export interface StageTypeEntity {
  id: string
  name: string
  description?: string
  stageCategory?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string | null
}

/** Matches Employee table in ERD.sql */
export interface Employee {
  id: string
  managerId?: string | null
  departmentId: string
  employeeNumber: string
  fullName: string
  email: string
  gender?: "Male" | "Female" | string
  jobTitle?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string | null
}

/** Matches BatchStage table in ERD.sql */
export interface BatchStage {
  id: string
  nextStageId?: string | null
  recruitmentBatchId: string
  stageTypeId: string
  stageName: string
  isActive: boolean
  passingScore?: number | null
  startDate?: string | null
  endDate?: string | null
  createdAt?: string
  updatedAt?: string | null
  // UI Relations
  stageType?: StageTypeEntity
  assignees?: Employee[]
}

/** Matches StageEmployee table in ERD.sql */
export interface StageEmployee {
  id: string
  batchStageId: string
  employeeId: string
  status?: string
  isActive: boolean
  note?: string
  createdAt?: string
  updatedAt?: string | null
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

/** UI pipeline stage with ERD BatchStage metadata */
export interface Stage {
  id: string
  name: string
  type: StageType
  durationDays: number
  ownerId: string
  // ERD fields
  batchStageId?: string
  recruitmentBatchId?: string
  stageTypeId?: string
  nextStageId?: string | null
  passingScore?: number | null
  startDate?: string | null
  endDate?: string | null
  isActive?: boolean
}

/**
 * Matches RecruitmentBatch table in ERD.sql
 * Includes convenience aliases for UI components
 */
export interface Recruitment {
  id: string
  batchCode: string
  code?: string
  name: string
  departmentId?: string
  division: string
  department?: Department
  openDate: string
  startDate?: string
  closeDate: string
  endDate?: string
  status: RecruitmentStatus
  description: string
  createdBy?: string
  ownerId: string
  createdAt?: string
  updatedAt?: string | null

  // UI state & display
  location: string
  quota: number
  currentStage: number
  stages: Stage[]
  batchStages?: BatchStage[]
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

export interface RecruitmentStatusMeta {
  label: string
  tone: Tone
}

export type RecruitmentSortKey = "code" | "name" | "stage" | "candidates" | "period" | "status"
export type SortOrder = "asc" | "desc"

export interface RecruitmentListSearchParams {
  search?: string
  status?: RecruitmentStatus
  division?: string
  sortBy?: RecruitmentSortKey
  order?: SortOrder
  page?: number
}

