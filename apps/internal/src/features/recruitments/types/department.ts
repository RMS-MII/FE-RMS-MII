// =====================================================================
// Matches Department in BE-RMS-MII API & Document/ERD.sql
// =====================================================================

export interface Department {
  id: string
  parentDepartmentId?: string | null
  parentDepartmentName?: string | null
  code: string
  name: string
  description?: string | null
  createdAt?: string
  updatedAt?: string | null
}

export interface GetDepartmentsParams {
  search?: string
}
