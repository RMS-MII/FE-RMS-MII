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
  credentials: "include", // Cookie HttpOnly untuk refresh token
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as AuthSliceState)?.auth?.accessToken
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    return headers
  },
})

// Serialized refresh mutex: cegah beberapa 401 memicu refresh bersamaan
let isRefreshing = false
let refreshSubscribers: Array<(token: string | null) => void> = []

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback)
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true

      try {
        const refreshResult = await rawBaseQuery(
          { url: "/auth/refresh", method: "POST" },
          api,
          extraOptions
        )

        if (refreshResult.data) {
          const newAccessToken = (
            refreshResult.data as { accessToken: string }
          ).accessToken

          // Dispatch action auth secara decoupling (tanpa impor statis modul features/)
          api.dispatch({ type: "auth/setAccessToken", payload: newAccessToken })
          isRefreshing = false
          onRefreshed(newAccessToken)

          // Ulangi request awal dengan token baru
          result = await rawBaseQuery(args, api, extraOptions)
        } else {
          isRefreshing = false
          onRefreshed(null)
          api.dispatch({ type: "auth/logout" })
        }
      } catch {
        isRefreshing = false
        onRefreshed(null)
        api.dispatch({ type: "auth/logout" })
      }
    } else {
      // Tunggu hingga proses refresh selesai
      const token = await new Promise<string | null>((resolve) => {
        addRefreshSubscriber((newToken) => {
          resolve(newToken)
        })
      })

      if (token) {
        result = await rawBaseQuery(args, api, extraOptions)
      }
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
    "Stage",
    "Candidate",
    "Interview",
    "Evaluation",
    "OfferingLetter",
    "User",
  ],
  endpoints: () => ({}),
})
