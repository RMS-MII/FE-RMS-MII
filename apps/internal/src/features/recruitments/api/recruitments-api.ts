import { baseApi } from "@/shared/api/base-api"
import type {
  Recruitment,
  PagedResult,
  GetBatchesParams,
  CreateBatchRequest,
  UpdateBatchStatusRequest,
  BatchStage,
  BatchStageWithInterviewers,
  UpdateBatchStagesRequest,
  AssignInterviewersRequest,
  AssignInterviewersResponse,
  BatchStageTransitionDto,
  BatchDashboardResponse,
} from "../types"

export const recruitmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBatches: builder.query<
      PagedResult<Recruitment>,
      GetBatchesParams | void
    >({
      query: (params) => ({
        url: "/batches",
        method: "GET",
        params: params
          ? {
              search: params.search || undefined,
              status: params.status !== undefined ? params.status : undefined,
              departmentId: params.departmentId || undefined,
              page: params.page || 1,
              pageSize: params.pageSize || 10,
            }
          : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Recruitment" as const,
                id,
              })),
              { type: "Recruitment", id: "LIST" },
            ]
          : [{ type: "Recruitment", id: "LIST" }],
    }),
    getBatchById: builder.query<Recruitment, string>({
      query: (id) => `/batches/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Recruitment", id }],
    }),
    getBatchDashboard: builder.query<BatchDashboardResponse, void>({
      query: () => ({
        url: "/batches/dashboard",
        method: "GET",
      }),
      providesTags: () => [{ type: "Recruitment", id: "DASHBOARD" }],
    }),
    getBatchStages: builder.query<BatchStageWithInterviewers[], string>({
      query: (id) => `/batches/${id}/stages`,
      providesTags: (_result, _err, id) => [{ type: "Stage", id }],
    }),
    createBatch: builder.mutation<Recruitment, CreateBatchRequest>({
      query: (body) => ({
        url: "/batches",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) =>
        result ? [{ type: "Recruitment", id: "LIST" }] : [],
    }),
    updateBatchStatus: builder.mutation<
      Recruitment,
      { id: string; body: UpdateBatchStatusRequest }
    >({
      query: ({ id, body }) => ({
        url: `/batches/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, _err, { id }) =>
        result
          ? [
              { type: "Recruitment", id },
              { type: "Recruitment", id: "LIST" },
              { type: "Candidate", id: `APPLICATION_BATCH_${id}` },
            ]
          : [],
    }),
    updateBatchStages: builder.mutation<
      BatchStage[],
      { id: string; body: UpdateBatchStagesRequest }
    >({
      query: ({ id, body }) => ({
        url: `/batches/${id}/stages`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, _err, { id }) =>
        result
          ? [
              { type: "Stage", id },
              { type: "Recruitment", id },
              { type: "Recruitment", id: "LIST" },
              { type: "Candidate", id: `APPLICATION_BATCH_${id}` },
              { type: "Interview", id: `BATCH_${id}` },
              { type: "Interview", id: "INVITATIONS" },
              { type: "Interview", id: "INTERVIEWER_DASHBOARD" },
              { type: "Interview", id: "AVAILABLE_INTERVIEWERS" },
            ]
          : [],
    }),
    assignStageInterviewers: builder.mutation<
      AssignInterviewersResponse,
      { batchId: string; stageId: string; body: AssignInterviewersRequest }
    >({
      query: ({ batchId, stageId, body }) => ({
        url: `/batches/${batchId}/stages/${stageId}/interviewers`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _err, { batchId }) =>
        result
          ? [
              { type: "Stage", id: batchId },
              { type: "Recruitment", id: batchId },
              { type: "Candidate", id: `APPLICATION_BATCH_${batchId}` },
              { type: "Interview", id: `BATCH_${batchId}` },
              { type: "Interview", id: "INVITATIONS" },
              { type: "Interview", id: "INTERVIEWER_DASHBOARD" },
              { type: "Interview", id: "AVAILABLE_INTERVIEWERS" },
            ]
          : [],
    }),
    activateBatchStage: builder.mutation<
      BatchStageTransitionDto,
      { batchId: string; stageId: string }
    >({
      query: ({ batchId, stageId }) => ({
        url: `/batches/${batchId}/stages/${stageId}/activate`,
        method: "POST",
      }),
      invalidatesTags: (result, _err, { batchId }) =>
        result
          ? [
              { type: "Stage", id: batchId },
              { type: "Recruitment", id: batchId },
              { type: "Recruitment", id: "LIST" },
              { type: "Candidate", id: `BATCH_${batchId}` },
              { type: "Candidate", id: `APPLICATION_BATCH_${batchId}` },
              { type: "Interview", id: `BATCH_${batchId}` },
            ]
          : [],
    }),
    completeBatchStage: builder.mutation<
      BatchStageTransitionDto,
      { batchId: string; stageId: string }
    >({
      query: ({ batchId, stageId }) => ({
        url: `/batches/${batchId}/stages/${stageId}/complete`,
        method: "POST",
      }),
      invalidatesTags: (result, _err, { batchId }) =>
        result
          ? [
              { type: "Stage", id: batchId },
              { type: "Recruitment", id: batchId },
              { type: "Recruitment", id: "LIST" },
              { type: "Candidate", id: `BATCH_${batchId}` },
              { type: "Candidate", id: `APPLICATION_BATCH_${batchId}` },
              { type: "Candidate", id: "LIST" },
              { type: "Interview", id: `BATCH_${batchId}` },
              { type: "OfferingLetter", id: "LIST" },
            ]
          : [],
    }),
  }),
})

export const {
  useGetBatchesQuery,
  useGetBatchByIdQuery,
  useGetBatchDashboardQuery,
  useGetBatchStagesQuery,
  useLazyGetBatchesQuery,
  useLazyGetBatchByIdQuery,
  useCreateBatchMutation,
  useUpdateBatchStatusMutation,
  useUpdateBatchStagesMutation,
  useAssignStageInterviewersMutation,
  useActivateBatchStageMutation,
  useCompleteBatchStageMutation,
} = recruitmentsApi
