import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query"
import { env } from "@/config/env"
import { logout, setCredentials } from "@/features/auth/store/auth-slice"
import { mapCurrentUserToAuthUser } from "@/features/auth/types"
import { broadcastLogout, refreshSession } from "./auth-session"

interface AuthSliceState {
  auth?: {
    accessToken?: string | null
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.VITE_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as AuthSliceState)?.auth?.accessToken
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const getActiveToken = () => {
    return (api.getState() as AuthSliceState).auth?.accessToken ?? null
  }
  const requestToken = getActiveToken()
  const result = await rawBaseQuery(args, api, extraOptions)
  // A late response from an earlier login must not affect the current session.
  if (requestToken !== getActiveToken()) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        error: "The active session has changed.",
      },
    }
  }

  if (result.error && result.error.status === 401) {
    const url = typeof args === "string" ? args : args.url
    if (!/^\/?auth\/(login|refresh|logout|forgot-password|reset-password)(?:\?|$)/.test(url)) {
      let session
      try {
        session = await refreshSession()
      } catch {
        return { error: { status: "FETCH_ERROR", error: "Unable to refresh session. Please retry." } }
      }
      if (session && requestToken === getActiveToken()) {
        api.dispatch(setCredentials({
          accessToken: session.accessToken,
          tokenType: session.tokenType,
          expiresAt: session.expiresAt,
          user: mapCurrentUserToAuthUser(session.user),
        }))
        return rawBaseQuery(args, api, extraOptions)
      }
      api.dispatch(logout())
      broadcastLogout()
      if (typeof window !== "undefined" && window.location.pathname !== "/login")
        window.location.replace("/login")
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Recruitment",
    "Department",
    "Employee",
    "Stage",
    "Candidate",
    "Interview",
    "Evaluation",
    "OfferingLetter",
    "User",
  ],
  endpoints: () => ({}),
})
