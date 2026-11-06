import { baseApi } from "@/shared/api/base-api"
import type { StageTypeDto } from "../types"

export interface GetStageTypesParams {
  category?: number
  activeOnly?: boolean
}

export interface CreateStageTypeRequest {
  name: string
  description?: string | null
  stageCategory: number
  isActive?: boolean
}

export const stageTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStageTypes: builder.query<StageTypeDto[], GetStageTypesParams | void>({
      query: (params) => ({
        url: "/stage-types",
        method: "GET",
        params: params
          ? {
              category: params.category !== undefined ? params.category : undefined,
              activeOnly: params.activeOnly !== undefined ? params.activeOnly : undefined,
            }
          : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Stage" as const, id })),
              { type: "Stage", id: "TYPE_LIST" },
            ]
          : [{ type: "Stage", id: "TYPE_LIST" }],
    }),
    getStageTypeById: builder.query<StageTypeDto, string>({
      query: (id) => `/stage-types/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Stage", id }],
    }),
    createStageType: builder.mutation<StageTypeDto, CreateStageTypeRequest>({
      query: (body) => ({
        url: "/stage-types",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Stage", id: "TYPE_LIST" }],
    }),
  }),
})

export const {
  useGetStageTypesQuery,
  useLazyGetStageTypesQuery,
  useGetStageTypeByIdQuery,
  useCreateStageTypeMutation,
} = stageTypesApi

