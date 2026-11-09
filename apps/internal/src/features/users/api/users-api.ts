import { baseApi } from "@/shared/api/base-api"
import type { GetUsersParams, UsersPageResult } from "../types"

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersPageResult, GetUsersParams>({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params: {
          search: params.search || undefined,
          role: params.role || undefined,
          isActive: params.isActive,
          page: params.page,
          pageSize: params.pageSize,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ accountId }) => ({
                type: "User" as const,
                id: accountId,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
  }),
})

export const { useGetUsersQuery } = usersApi
