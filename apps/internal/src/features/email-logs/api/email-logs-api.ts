import { baseApi } from "@/shared/api/base-api"
import type { EmailDeliveryStatus, EmailLogsPage, GetEmailLogsParams } from "../types"

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
    retryEmailLog: builder.mutation<{ id: string; status: EmailDeliveryStatus }, string>({
      query: (id) => ({ url: `/email-logs/${id}/retry`, method: "POST" }),
      invalidatesTags: [{ type: "User", id: "EMAIL_LOGS" }],
    }),
  }),
})

export const { useGetEmailLogsQuery, useRetryEmailLogMutation } = emailLogsApi
