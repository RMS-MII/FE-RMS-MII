export interface UserAccount {
  accountId: string
  employeeId: string
  username: string
  fullName: string
  email: string
  employeeNumber: string
  jobTitle: string
  departmentId: string
  departmentName: string
  roleId: string
  role: string
  isActive: boolean
  employeeIsActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string | null
}

export interface UsersPageResult {
  items: UserAccount[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface GetUsersParams {
  search?: string
  role?: string
  isActive?: boolean
  page: number
  pageSize: number
}
