// =====================================================================
// Candidate Feature Types (Document/ERD.sql - Candidates Table)
// =====================================================================

export type Gender = "Male" | "Female" | string

/** Matches Candidates table in ERD.sql */
export interface CandidateEntity {
  id: string
  fullName: string
  email: string
  gender?: Gender | null
  phoneNumber?: string | null
  birthDate?: string | null
  cv?: string | null
  expectedSalary?: number | null
  portfolio?: string | null
  education?: string | null
  institution?: string | null
  address?: string | null
  gpa?: string | null
  createdAt: string
  updatedAt?: string | null

  // Aggregated relation fields
  appliedBatchCount: number
  appliedBatches?: {
    applicationId?: string
    batchId: string
    batchCode: string
    batchName: string
    appliedAt: string
    status: string
  }[]
}

export type Candidate = CandidateEntity

export type CandidateSortKey =
  | "name"
  | "education"
  | "gpa"
  | "salary"
  | "batches"
  | "createdAt"

export interface CandidateSearchParams {
  search?: string
  gender?: "all" | "male" | "female"
  batchStatus?: "all" | "applied" | "pool"
  education?: string
  sort?: CandidateSortKey
  order?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export interface CandidateAssignedBatchDto {
  applicationId: string
  batchId: string
  batchCode: string
  batchName: string
  codeApplication?: string
  applicationStatus?: number | string
  finalResultStatus?: string | null
  appliedAt: string
}

export interface CandidateWithBatchesDto {
  id: string
  fullName: string
  gender: number | string
  email: string
  phoneNumber?: string | null
  birthDate?: string | null
  cv?: string | null
  portfolio?: string | null
  education?: string | null
  institution?: string | null
  address?: string | null
  expectedSalary?: number | null
  gpa?: number | null
  createdAt: string
  updatedAt?: string | null
  assignedBatches?: CandidateAssignedBatchDto[]
}

export interface GetCandidatesParams {
  search?: string
  batchId?: string
  page?: number
  pageSize?: number
}
