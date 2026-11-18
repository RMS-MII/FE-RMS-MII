import { baseApi } from "@/shared/api/base-api"
import type {
  BatchInterviewSessionDto,
  ScheduleInterviewSessionRequest,
  RescheduleRequestDto,
  ReviewRescheduleRequest,
  RescheduleStatusValue,
  AvailableInterviewerDto,
} from "../types"
import { applicationTags } from "./cache-tags"

export interface GetBatchInterviewSessionsParams {
  search?: string
  stageId?: string
  isOnline?: boolean
  date?: string
}

export interface InterviewCandidateOption {
  applicationId: string
  codeApplication: string
  candidateName: string
  candidateEmail: string
}

export const interviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInterviewCandidates: builder.query<InterviewCandidateOption[], { batchId: string; search: string }>({
      query: ({ batchId, search }) => ({
        url: `/batches/${batchId}/interview-candidates`,
        params: search ? { search } : undefined,
      }),
      providesTags: (_result, _error, { batchId }) => [
        { type: "Candidate", id: `BATCH_${batchId}` },
        { type: "Interview", id: `BATCH_${batchId}` },
        { type: "Stage", id: batchId },
      ],
    }),
    getAvailableInterviewers: builder.query<AvailableInterviewerDto[], string>({
      query: (applicationStageId) =>
        `/application-stages/${applicationStageId}/available-interviewers`,
      providesTags: (_result, _error, applicationStageId) => [
        { type: "Interview" as const, id: "AVAILABLE_INTERVIEWERS" },
        { type: "Interview" as const, id: `AVAILABLE_${applicationStageId}` },
      ],
    }),
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
              isOnline:
                params.isOnline !== undefined ? params.isOnline : undefined,
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
      BatchInterviewSessionDto,
      {
        applicationStageId: string
        body: ScheduleInterviewSessionRequest
        batchId?: string
        applicationId?: string
      }
    >({
      query: ({ applicationStageId, body }) => ({
        url: `/application-stages/${applicationStageId}/interview-sessions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _err, { batchId, applicationId }) =>
        result
          ? [
              ...applicationTags(
                applicationId,
                batchId ?? result.recruitmentBatchId
              ),
              { type: "Interview" as const, id: "LIST" },
              { type: "Interview" as const, id: "INTERVIEWER_DASHBOARD" },
              { type: "Interview" as const, id: "AVAILABLE_INTERVIEWERS" },
              ...(batchId
                ? [{ type: "Interview" as const, id: `BATCH_${batchId}` }]
                : []),
              { type: "Recruitment" as const, id: "LIST" },
            ]
          : [],
    }),

    getRescheduleRequests: builder.query<
      RescheduleRequestDto[],
      { status?: RescheduleStatusValue; sessionId?: string } | void
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
      RescheduleRequestDto,
      {
        id: string
        body: ReviewRescheduleRequest
        batchId?: string
        applicationId?: string
      }
    >({
      query: ({ id, body }) => ({
        url: `/reschedule-requests/${id}/review`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _err, { batchId, applicationId }) =>
        result
          ? [
              ...applicationTags(applicationId, batchId),
              { type: "Interview" as const, id: "LIST" },
              { type: "Interview" as const, id: "RESCHEDULE_LIST" },
              ...(batchId
                ? [{ type: "Interview" as const, id: `BATCH_${batchId}` }]
                : []),
            ]
          : [],
    }),
  }),
})

export const {
  useGetInterviewCandidatesQuery,
  useGetAvailableInterviewersQuery,
  useGetBatchInterviewSessionsQuery,
  useLazyGetBatchInterviewSessionsQuery,
  useScheduleInterviewSessionMutation,
  useGetRescheduleRequestsQuery,
  useLazyGetRescheduleRequestsQuery,
  useReviewRescheduleRequestMutation,
} = interviewsApi
