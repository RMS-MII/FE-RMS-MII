// =====================================================================
// Matches Department table in Document/ERD.sql
// =====================================================================

export interface Department {
  id: string
  parentDepartmentId?: string | null
  code: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string | null
}

