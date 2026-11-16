import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { AuthState, AuthUser, DataMode, UserRole } from "../types"

const initialState: AuthState = {
  user: null,
  accessToken: null,
  tokenType: "Bearer",
  expiresAt: null,
  isAuthenticated: false,
  isInitializing: true,
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

    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload
      }
    },
    setDataMode: (state, action: PayloadAction<DataMode>) => {
      state.dataMode = action.payload
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.tokenType = undefined
      state.expiresAt = null
      state.isAuthenticated = false
      state.isInitializing = false

    },
    finishInitialization: (state) => {
      state.isInitializing = false
    },
  },
})

export const {
  setCredentials,
  setUser,
  setRole,
  setDataMode,
  logout,
  finishInitialization,
} = authSlice.actions
