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
