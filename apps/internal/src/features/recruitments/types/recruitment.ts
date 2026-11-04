import type { Tone } from "@/shared/components"
import type { Department } from "./department"
import type { BatchStage, Stage } from "./stage"

// =====================================================================
// Matches RecruitmentBatch table in Document/ERD.sql
// =====================================================================

export type RecruitmentStatus = "draft" | "running" | "completed" | "closed"

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

