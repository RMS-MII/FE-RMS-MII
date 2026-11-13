export type UserRole = "HR" | "Interviewer"
export type DataMode = "normal" | "loading" | "empty" | "error"

export interface CurrentUserDto {
  accountId: string
  employeeId: string
  username: string
  fullName: string
  email: string
  role: string
  departmentId: string
  departmentName: string
  jobTitle: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  employeeId?: string
  username?: string
  departmentId?: string
  departmentName?: string
  jobTitle?: string
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  tokenType?: string
  expiresAt?: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  dataMode: DataMode
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresAt: string
  user: CurrentUserDto
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export function mapCurrentUserToAuthUser(dto: CurrentUserDto): AuthUser {
  return {
    id: dto.accountId,
    employeeId: dto.employeeId,
    name: dto.fullName,
    email: dto.email,
    username: dto.username,
    role: dto.role === "HR" ? "HR" : "Interviewer",
    departmentId: dto.departmentId,
    departmentName: dto.departmentName,
    jobTitle: dto.jobTitle,
  }
}
