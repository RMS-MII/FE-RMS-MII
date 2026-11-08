import type { Employee } from "./employee"

// =====================================================================
// Matches BatchStage, StageType, StageEmployee tables in Document/ERD.sql
// =====================================================================

export type LegacyStageType =
  | "screening"
  | "interview"
  | "test"
  | "offering"
  | "other"

export type StageType = LegacyStageType

/** Matches StageType table in ERD.sql */
export interface StageTypeDto {
  id: string
  name: string
  description?: string | null
  stageCategory: number | string // 1 = Test, 2 = Interview, etc.
  isActive: boolean
  createdAt?: string
  updatedAt?: string | null
}

/** Matches StageType table in ERD.sql (legacy alias for StageTypeDto) */
export interface StageTypeEntity {
  id: string
  name: string
  description?: string
  stageCategory?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string | null
}

/** Matches BatchStage table in ERD.sql */
export interface BatchStage {
  id: string
  recruitmentBatchId: string
  stageTypeId: string
  stageTypeName?: string
  stageCategory?: string | null
  stageName: string
  isActive: boolean
  passingScore?: number | null
  startDate?: string | null
  endDate?: string | null
  nextStageId?: string | null
  createdAt?: string
  updatedAt?: string | null
  // UI Relations
  stageType?: StageTypeEntity | StageTypeDto
  interviewers?: AssignedInterviewer[]
}

export interface AssignedInterviewer {
  stageEmployeeId: string
  employeeId: string
  fullName: string
  email: string
  jobTitle: string
  departmentName: string
  status: number | string
  statusName?: string
}

export interface BatchStageWithInterviewers extends BatchStage {
  interviewers: AssignedInterviewer[]
}

export interface AssignInterviewersResponse {
  batchId: string
  batchName: string
  stageId: string
  stageName: string
  interviewers: AssignedInterviewer[]
}

/**
 * Rich view model for Recruitment Batch Stages flow.
 * Combines BatchStage, StageType, and assigned StageEmployees.
 */
export interface Stage {
  id: string
  batchStageId?: string
  recruitmentBatchId?: string
  stageTypeId?: string
  stageTypeName?: string | null
  stageCategory?: string | null
  name: string
  type: LegacyStageType
  durationDays: number
  ownerId?: string
  interviewerIds?: string[]
  assignedInterviewers?: StageInterviewerAssignment[]
  assignees?: Employee[]
  passingScore: number | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  nextStageId?: string | null
  sequence?: number
}

/** Matches StageEmployee table in ERD.sql */
export interface StageEmployee {
  id: string
  batchStageId?: string
  stageId?: string
  employeeId: string
  status: StageEmployeeStatus
  note?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string | null
}

export type StageEmployeeStatus = "pending" | "accepted" | "declined"

export interface StageInterviewerAssignment {
  employeeId: string
  status: StageEmployeeStatus
  note?: string
  employeeName?: string
  employeeEmail?: string
  jobTitle?: string
}

export interface UpdateBatchStageItem {
  stageTypeId: string
  stageName: string
  isActive: boolean
  passingScore?: number | null
  startDate: string
  endDate: string
}

export interface UpdateBatchStagesRequest {
  batchId?: string
  stages: UpdateBatchStageItem[]
}

export interface AssignInterviewersRequest {
  interviewerEmployeeIds: string[]
}

export type StageState = "done" | "current" | "upcoming" | "halted"

export interface PipelineItem {
  name: string
  count?: number
  state: StageState
  note?: string
}
