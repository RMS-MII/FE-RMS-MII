import { baseApi } from "@/shared/api/base-api"
import type { EmailLogsPage, GetEmailLogsParams } from "../types"

export const emailLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailLogs: builder.query<EmailLogsPage, GetEmailLogsParams>({
      query: (params) => ({
        url: "/email-logs",
        method: "GET",
        params: {
          search: params.search || undefined,
          type: params.type,
          status: params.status,
          from: params.from,
          to: params.to,
          page: params.page,
          pageSize: params.pageSize,
        },
      }),
      providesTags: [{ type: "User", id: "EMAIL_LOGS" }],
    }),
  }),
})

export const { useGetEmailLogsQuery } = emailLogsApi
