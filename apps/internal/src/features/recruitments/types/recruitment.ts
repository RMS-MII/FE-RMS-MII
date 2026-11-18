import type { Tone } from "@/shared/components"
import type { Department } from "./department"
import type { BatchStage, Stage } from "./stage"

// =====================================================================
// Matches RecruitmentBatch in BE-RMS-MII API & Document/ERD.sql
// =====================================================================

export type BatchStatus = "Draft" | "Open" | "Closed" | 1 | 2 | 3
export type LegacyRecruitmentStatus = "draft" | "running" | "completed" | "closed"
export type RecruitmentStatus = LegacyRecruitmentStatus | BatchStatus

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface GetBatchesParams {
  search?: string
  status?: number
  departmentId?: string
  page?: number
  pageSize?: number
  sortBy?: RecruitmentSortKey
  order?: SortOrder
}

export interface CreateBatchRequest {
  departmentId: string
  name: string
  description?: string
  startDate: string
  endDate: string
}

export interface UpdateBatchStatusRequest {
  status: BatchStatus
  applicationDeadlineAt?: string
}

/**
 * Matches RecruitmentBatch from BE-RMS-MII API
 * Includes convenience aliases for legacy UI compatibility
 */
export interface Recruitment {
  id: string
  departmentId: string
  departmentName?: string
  batchCode: string
  name: string
  description: string
  startDate?: string
  endDate?: string
  applicationDeadlineAt?: string | null
  status: RecruitmentStatus
  createdBy?: string
  createdAt?: string
  updatedAt?: string | null
  batchStages?: BatchStage[]
  currentStageName?: string | null
  activeCandidateCount?: number | null
  canClose?: boolean | null

  // Convenience aliases for UI components / mock compatibility
  code?: string
  division?: string
  department?: Department
  openDate?: string
  closeDate?: string
  ownerId?: string
  location?: string
  quota?: number
  currentStage?: number
  stages?: Stage[]
}

export interface RecruitmentBatchSummary {
  ownerName: string | null
  totalCandidates: number
  activeCandidates: number
  rejectedCandidates: number
  droppedCandidates: number
  interviewSessions: number
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
  status?: string
  division?: string
  sortBy?: RecruitmentSortKey
  order?: SortOrder
  page?: number
}

export function getRecruitmentStatusMeta(status: any): RecruitmentStatusMeta {
  let val = status
  if (val && typeof val === "object") {
    // If the entire recruitment object was passed
    if ("status" in val) {
      val = val.status
    } else if ("name" in val) {
      // If status is an object like { id: 1, name: "Draft" }
      val = val.name
    }
  }

  const str = String(val ?? "").toLowerCase()
  if (str === "draft" || str === "1") {
    return { label: "Draft", tone: "warning" }
  }
  if (str === "open" || str === "running" || str === "2") {
    return { label: "Open", tone: "success" }
  }
  if (str === "closed" || str === "completed" || str === "3") {
    return { label: "Closed", tone: "danger" }
  }
  return { label: str ? String(val) : "Draft", tone: "neutral" }
}
