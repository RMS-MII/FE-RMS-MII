import { baseApi } from "@/shared/api/base-api"
import type {
  Recruitment,
  PagedResult,
  GetBatchesParams,
  CreateBatchRequest,
  BatchStage,
  UpdateBatchStagesRequest,
  AssignInterviewersRequest,
} from "../types"

export const recruitmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBatches: builder.query<PagedResult<Recruitment>, GetBatchesParams | void>({
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
              ...result.items.map(({ id }) => ({ type: "Recruitment" as const, id })),
              { type: "Recruitment", id: "LIST" },
            ]
          : [{ type: "Recruitment", id: "LIST" }],
    }),
    getBatchById: builder.query<Recruitment, string>({
      query: (id) => `/batches/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Recruitment", id }],
    }),
    createBatch: builder.mutation<Recruitment, CreateBatchRequest>({
      query: (body) => ({
        url: "/batches",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Recruitment", id: "LIST" }],
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
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Recruitment", id },
        { type: "Recruitment", id: "LIST" },
      ],
    }),
    assignStageInterviewers: builder.mutation<
      any,
      { batchId: string; stageId: string; body: AssignInterviewersRequest }
    >({
      query: ({ batchId, stageId, body }) => ({
        url: `/batches/${batchId}/stages/${stageId}/interviewers`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { batchId }) => [
        { type: "Recruitment", id: batchId },
      ],
    }),
  }),
})

export const {
  useGetBatchesQuery,
  useGetBatchByIdQuery,
  useLazyGetBatchesQuery,
  useLazyGetBatchByIdQuery,
  useCreateBatchMutation,
  useUpdateBatchStagesMutation,
  useAssignStageInterviewersMutation,
} = recruitmentsApi
