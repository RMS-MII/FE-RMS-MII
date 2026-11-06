import { baseApi } from "@/shared/api/base-api"
import type { Employee } from "../types"

export interface GetEmployeesParams {
  search?: string
  departmentId?: string
  activeOnly?: boolean
}

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], GetEmployeesParams | void>({
      query: (params) => ({
        url: "/employees",
        method: "GET",
        params: params
          ? {
              search: params.search || undefined,
              departmentId: params.departmentId || undefined,
              activeOnly: params.activeOnly !== undefined ? params.activeOnly : undefined,
            }
          : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Employee" as const, id })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),
  }),
})

export const {
  useGetEmployeesQuery,
  useLazyGetEmployeesQuery,
} = employeesApi

