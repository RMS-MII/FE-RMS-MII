export type UserRole = "HR" | "Interviewer"
export type DataMode = "normal" | "loading" | "empty" | "error"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  dataMode: DataMode
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}
