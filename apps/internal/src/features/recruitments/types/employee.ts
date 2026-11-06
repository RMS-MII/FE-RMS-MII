// =====================================================================
// Matches Employee table in Document/ERD.sql
// =====================================================================

export interface Employee {
  id: string
  managerId?: string | null
  departmentId: string
  departmentName?: string
  employeeNumber: string
  fullName: string
  email: string
  gender?: "Male" | "Female" | string
  jobTitle?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string | null
}
