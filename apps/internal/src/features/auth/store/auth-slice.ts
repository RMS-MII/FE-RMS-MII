import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { AuthState, AuthUser, DataMode, UserRole } from "../types"

const STORAGE_KEY_TOKEN = "rms_access_token"
const STORAGE_KEY_USER = "rms_user"

const getInitialToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEY_TOKEN)
}

const getInitialUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

const initialToken = getInitialToken()
const initialUser = getInitialUser()

const initialState: AuthState = {
  user: initialUser,
  accessToken: initialToken,
  tokenType: "Bearer",
  expiresAt: null,
  isAuthenticated: Boolean(initialToken),
  isInitializing: false,
  dataMode: "normal",
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string
        tokenType?: string
        expiresAt?: string
        user: AuthUser
      }>
    ) => {
      state.accessToken = action.payload.accessToken
      state.tokenType = action.payload.tokenType ?? "Bearer"
      state.expiresAt = action.payload.expiresAt ?? null
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isInitializing = false

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_TOKEN, action.payload.accessToken)
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(action.payload.user))
      }
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(action.payload))
      }
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.user))
        }
      }
    },
    setDataMode: (state, action: PayloadAction<DataMode>) => {
      state.dataMode = action.payload
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      state.isAuthenticated = true
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_TOKEN, action.payload)
      }
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.tokenType = undefined
      state.expiresAt = null
      state.isAuthenticated = false
      state.isInitializing = false

      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY_TOKEN)
        localStorage.removeItem(STORAGE_KEY_USER)
      }
    },
  },
})

export const {
  setCredentials,
  setUser,
  setRole,
  setDataMode,
  setAccessToken,
  logout,
} = authSlice.actions
