import { baseApi } from "@/shared/api/base-api"
import type { Department, GetDepartmentsParams } from "../types"

export const departmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<Department[], GetDepartmentsParams | void>({
      query: (params) => ({
        url: "/departments",
        method: "GET",
        params: params?.search ? { search: params.search } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Department" as const, id })),
              { type: "Department", id: "LIST" },
            ]
          : [{ type: "Department", id: "LIST" }],
    }),
  }),
})

export const {
  useGetDepartmentsQuery,
  useLazyGetDepartmentsQuery,
} = departmentsApi

