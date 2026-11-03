import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { AuthState, AuthUser, DataMode, UserRole } from "../types"

// Default mock sesi agar frontend bisa langsung diakses tanpa login
const initialState: AuthState = {
  user: {
    id: "usr-dev-1",
    name: "Fajar Mahendra",
    email: "fajar.mahendra@metrodata.co.id",
    role: "HR",
  },
  accessToken: "mock-dev-token",
  isAuthenticated: true,
  isInitializing: false,
  dataMode: "normal",
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user: AuthUser }>
    ) => {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isInitializing = false
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload
      }
    },
    setDataMode: (state, action: PayloadAction<DataMode>) => {
      state.dataMode = action.payload
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.isInitializing = false
    },
  },
})

export const { setCredentials, setRole, setDataMode, setAccessToken, logout } =
  authSlice.actions
