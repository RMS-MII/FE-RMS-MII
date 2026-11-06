import { baseApi } from "@/shared/api/base-api"
import type { CurrentUserDto, LoginRequest, LoginResponse } from "../types"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    getMe: builder.query<CurrentUserDto, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
  }),
})

export const {
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi
