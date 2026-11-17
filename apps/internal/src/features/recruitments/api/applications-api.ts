import { baseApi } from "@/shared/api/base-api"
import type { PagedResult } from "../types"
import type {
  BatchApplicationListItemDto,
  GetBatchApplicationsParams,
  ApplicationDetailDto,
  RegisterCandidatesCommand,
  EvaluateStageCommand,
  SetFinalResultCommand,
  ApplicationStageDto,
} from "../types/application"
import { applicationTags } from "./cache-tags"

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBatchApplications: builder.query<
      PagedResult<BatchApplicationListItemDto>,
      GetBatchApplicationsParams
    >({
      query: ({ id, search, status, stageId, page = 1, pageSize = 10 }) => ({
        url: `/batches/${id}/applications`,
        method: "GET",
        params: {
          Search: search || undefined,
          Status: status !== undefined ? status : undefined,
          StageId: stageId || undefined,
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
      providesTags: (result, _err, id) => [
        { type: "Candidate", id: `APPLICATION_${id}` },
        { type: "Candidate", id: "APPLICATION_DETAILS" },
        ...(result
          ? [
              {
                type: "Candidate" as const,
                id: `APPLICATION_BATCH_${result.recruitmentBatchId}`,
              },
            ]
          : []),
      ],
    }),
    startApplicationStage: builder.mutation<
      ApplicationStageDto,
      { applicationId: string; batchId: string }
    >({
      query: ({ applicationId }) => ({
        url: `/applications/${applicationId}/stages/start`,
        method: "POST",
      }),
      invalidatesTags: (result, _error, { applicationId, batchId }) =>
        result ? applicationTags(applicationId, batchId) : [],
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
      invalidatesTags: (result, _err, { batchId }) =>
        result
          ? [
              { type: "Candidate", id: `BATCH_${batchId}` },
              { type: "Candidate", id: "LIST" },
              { type: "Candidate", id: "TALENT_POOL" },
              { type: "Recruitment", id: batchId },
              { type: "Recruitment", id: "LIST" },
            ]
          : [],
    }),
    evaluateStage: builder.mutation<
      ApplicationStageDto,
      {
        applicationStageId: string
        body: EvaluateStageCommand
        batchId?: string
      }
    >({
      query: ({ applicationStageId, body }) => ({
        url: `/application-stages/${applicationStageId}/evaluate`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _err, { batchId }) =>
        result ? applicationTags(result.batchApplicationId, batchId) : [],
    }),
    setFinalResult: builder.mutation<
      BatchApplicationListItemDto,
      { applicationId: string; body: SetFinalResultCommand }
    >({
      query: ({ applicationId, body }) => ({
        url: `/applications/${applicationId}/final-result`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, _err, { applicationId }) =>
        result ? applicationTags(applicationId, result.recruitmentBatchId) : [],
    }),
    uploadOfferingLetter: builder.mutation<
      BatchApplicationListItemDto,
      { applicationId: string; fileOfferingLetter: string }
    >({
      query: ({ applicationId, fileOfferingLetter }) => ({
        url: `/applications/${applicationId}/offering-letter`,
        method: "POST",
        body: { fileOfferingLetter },
      }),
      invalidatesTags: (result, _err, { applicationId }) =>
        result
          ? [
              ...applicationTags(applicationId, result.recruitmentBatchId),
              { type: "OfferingLetter", id: "LIST" },
            ]
          : [],
    }),
  }),
})

export const {
  useGetBatchApplicationsQuery,
  useLazyGetBatchApplicationsQuery,
  useGetApplicationByIdQuery,
  useStartApplicationStageMutation,
  useRegisterCandidatesMutation,
  useEvaluateStageMutation,
  useSetFinalResultMutation,
  useUploadOfferingLetterMutation,
} = applicationsApi
