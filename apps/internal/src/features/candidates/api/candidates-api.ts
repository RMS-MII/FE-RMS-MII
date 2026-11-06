import { baseApi } from "@/shared/api/base-api"
import type { PagedResult } from "@/features/recruitments/types"
import type { CandidateWithBatchesDto, GetCandidatesParams } from "../types"

export const candidatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCandidates: builder.query<
      PagedResult<CandidateWithBatchesDto>,
      GetCandidatesParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number> = {
          Page: params?.page ?? 1,
          PageSize: params?.pageSize ?? 50,
        }
        if (params?.search && params.search.trim()) {
          queryParams.Search = params.search.trim()
        }
        if (params?.batchId) {
          queryParams.BatchId = params.batchId
        }
        return {
          url: "/candidates",
          method: "GET",
          params: queryParams,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Candidate" as const, id })),
              { type: "Candidate", id: "TALENT_POOL" },
            ]
          : [{ type: "Candidate", id: "TALENT_POOL" }],
    }),
    getCandidateById: builder.query<CandidateWithBatchesDto, string>({
      query: (id) => `/candidates/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Candidate", id }],
    }),
  }),
})

export const { useGetCandidatesQuery, useGetCandidateByIdQuery } = candidatesApi
