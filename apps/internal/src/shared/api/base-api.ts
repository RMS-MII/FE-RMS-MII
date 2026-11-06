import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react"
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query"
import { env } from "@/config/env"

interface AuthSliceState {
  auth?: {
    accessToken?: string | null
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // 1. Ambil dari Redux state
    let token = (getState() as AuthSliceState)?.auth?.accessToken
    // 2. Fallback ambil dari localStorage jika state belum terhidrasi
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("rms_access_token")
    }
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
  const result = await rawBaseQuery(args, api, extraOptions)

  // Tangani 401 Unauthorized
  if (result.error && result.error.status === 401) {
    const isLoginEndpoint =
      (typeof args === "string" && args.includes("/auth/login")) ||
      (typeof args === "object" && args.url?.includes("/auth/login"))

    // Jangan lakukan global reset jika request login itu sendiri yang gagal kredensial
    if (!isLoginEndpoint) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("rms_access_token")
      }
      api.dispatch({ type: "auth/logout" })
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
    "Stage",
    "Candidate",
    "Interview",
    "Evaluation",
    "OfferingLetter",
    "User",
  ],
  endpoints: () => ({}),
})
