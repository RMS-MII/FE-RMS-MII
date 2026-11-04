import type { Employee } from "./employee"

// =====================================================================
// Matches BatchStage, StageType, StageEmployee tables in Document/ERD.sql
// =====================================================================

export type LegacyStageType = "screening" | "test" | "interview" | "offering"
export type StageType = LegacyStageType

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

export type StageEmployeeStatus = "pending" | "accepted" | "declined"

export interface StageInterviewerAssignment {
  employeeId: string
  status: StageEmployeeStatus
  note?: string
}

/** UI pipeline stage with ERD BatchStage metadata */
export interface Stage {
  id: string
  name: string
  type: StageType
  durationDays: number
  ownerId?: string
  interviewerIds?: string[]
  assignedInterviewers?: StageInterviewerAssignment[]
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

export type StageState = "done" | "current" | "upcoming" | "halted"

export interface PipelineItem {
  name: string
  count?: number
  state: StageState
  note?: string
}

