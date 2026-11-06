import { baseApi } from "@/shared/api/base-api"
import type { PagedResult } from "../types"
import type {
  BatchApplicationListItemDto,
  GetBatchApplicationsParams,
  ApplicationDetailDto,
  RegisterCandidatesCommand,
  EvaluateStageCommand,
  SetFinalResultCommand,
} from "../types/application"

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBatchApplications: builder.query<
      PagedResult<BatchApplicationListItemDto>,
      GetBatchApplicationsParams
    >({
      query: ({ id, search, status, page = 1, pageSize = 10 }) => ({
        url: `/batches/${id}/applications`,
        method: "GET",
        params: {
          Search: search || undefined,
          Status: status !== undefined ? status : undefined,
          Page: page,
          PageSize: pageSize,
        },
      }),
      providesTags: (_result, _err, { id }) => [
        { type: "Candidate", id: `BATCH_${id}` },
        { type: "Candidate", id: "LIST" },
      ],
    }),
    getApplicationById: builder.query<ApplicationDetailDto, string>({
      query: (id) => `/applications/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Candidate", id }],
    }),
    registerCandidates: builder.mutation<
      BatchApplicationListItemDto[],
      { batchId: string; candidates: RegisterCandidatesCommand["candidates"] }
    >({
      query: ({ batchId, candidates }) => ({
        url: `/batches/${batchId}/applications`,
        method: "POST",
        body: {
          candidates,
        },
      }),
      invalidatesTags: (_result, _err, { batchId }) => [
        { type: "Candidate", id: `BATCH_${batchId}` },
        { type: "Candidate", id: "LIST" },
        { type: "Candidate", id: "TALENT_POOL" },
        { type: "Recruitment", id: batchId },
      ],
    }),
    evaluateStage: builder.mutation<
      any,
      { stageId: string; body: EvaluateStageCommand }
    >({
      query: ({ stageId, body }) => ({
        url: `/application-stages/${stageId}/evaluate`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Candidate", id: "LIST" }],
    }),
    setFinalResult: builder.mutation<
      any,
      { applicationId: string; body: SetFinalResultCommand }
    >({
      query: ({ applicationId, body }) => ({
        url: `/applications/${applicationId}/final-result`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { applicationId }) => [
        { type: "Candidate", id: applicationId },
        { type: "Candidate", id: "LIST" },
      ],
    }),
  }),
})

export const {
  useGetBatchApplicationsQuery,
  useGetApplicationByIdQuery,
  useRegisterCandidatesMutation,
  useEvaluateStageMutation,
  useSetFinalResultMutation,
} = applicationsApi
