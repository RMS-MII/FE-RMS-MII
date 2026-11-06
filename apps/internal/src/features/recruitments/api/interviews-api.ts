import { baseApi } from "@/shared/api/base-api"
import type {
  BatchInterviewSessionDto,
  ScheduleInterviewSessionRequest,
  RescheduleRequestDto,
  ReviewRescheduleRequest,
} from "../types"

export interface GetBatchInterviewSessionsParams {
  search?: string
  stageId?: string
  isOnline?: boolean
  date?: string
}

export const interviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBatchInterviewSessions: builder.query<
      BatchInterviewSessionDto[],
      { batchId: string; params?: GetBatchInterviewSessionsParams }
    >({
      query: ({ batchId, params }) => ({
        url: `/batches/${batchId}/interview-sessions`,
        method: "GET",
        params: params
          ? {
              search: params.search || undefined,
              stageId: params.stageId || undefined,
              isOnline: params.isOnline !== undefined ? params.isOnline : undefined,
              date: params.date || undefined,
            }
          : undefined,
      }),
      providesTags: (_result, _err, { batchId }) => [
        { type: "Interview" as const, id: `BATCH_${batchId}` },
        { type: "Interview" as const, id: "LIST" },
      ],
    }),

    scheduleInterviewSession: builder.mutation<
      any,
      { applicationStageId: string; body: ScheduleInterviewSessionRequest; batchId?: string }
    >({
      query: ({ applicationStageId, body }) => ({
        url: `/application-stages/${applicationStageId}/interview-sessions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { batchId }) => [
        { type: "Interview" as const, id: "LIST" },
        ...(batchId ? [{ type: "Interview" as const, id: `BATCH_${batchId}` }] : []),
        { type: "Recruitment" as const, id: "LIST" },
      ],
    }),

    getRescheduleRequests: builder.query<
      RescheduleRequestDto[],
      { status?: number | string; sessionId?: string } | void
    >({
      query: (params) => ({
        url: "/reschedule-requests",
        method: "GET",
        params: params
          ? {
              status: params.status !== undefined ? params.status : undefined,
              sessionId: params.sessionId || undefined,
            }
          : undefined,
      }),
      providesTags: [{ type: "Interview", id: "RESCHEDULE_LIST" }],
    }),

    reviewRescheduleRequest: builder.mutation<
      any,
      { id: string; body: ReviewRescheduleRequest; batchId?: string }
    >({
      query: ({ id, body }) => ({
        url: `/reschedule-requests/${id}/review`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { batchId }) => [
        { type: "Interview" as const, id: "LIST" },
        { type: "Interview" as const, id: "RESCHEDULE_LIST" },
        ...(batchId ? [{ type: "Interview" as const, id: `BATCH_${batchId}` }] : []),
      ],
    }),
  }),
})

export const {
  useGetBatchInterviewSessionsQuery,
  useLazyGetBatchInterviewSessionsQuery,
  useScheduleInterviewSessionMutation,
  useGetRescheduleRequestsQuery,
  useLazyGetRescheduleRequestsQuery,
  useReviewRescheduleRequestMutation,
} = interviewsApi

