import { z } from "zod"

export const candidateSortSchema = z.enum([
  "name",
  "code",
  "stage",
  "status",
  "appliedAt",
])
export const candidateStatusFilterSchema = z.enum([
  "in_progress",
  "rejected",
  "dropped",
  "accepted",
])

// Shared by the candidates tab and application URL so returning also works in a new tab.
export const candidateNavigationSearchSchema = z.object({
  stage: z.coerce.number().int().nonnegative().optional().catch(undefined),
  candidateSearch: z.string().optional().catch(undefined),
  candidateStatus: candidateStatusFilterSchema.optional().catch(undefined),
  candidatePage: z.coerce.number().int().positive().optional().catch(undefined),
  candidateSort: candidateSortSchema.optional().catch(undefined),
  candidateDirection: z.enum(["asc", "desc"]).optional().catch(undefined),
})

export const recruitmentDetailSearchSchema =
  candidateNavigationSearchSchema.extend({
    tab: z
      .enum(["summary", "stages", "candidates", "interviews"])
      .optional()
      .catch(undefined),
  })

export type CandidateNavigationSearch = z.infer<
  typeof candidateNavigationSearchSchema
>
export type RecruitmentDetailSearch = z.infer<
  typeof recruitmentDetailSearchSchema
>

export function getCandidateNavigationSearch(
  search: CandidateNavigationSearch
): CandidateNavigationSearch {
  return {
    stage: search.stage,
    candidateSearch: search.candidateSearch,
    candidateStatus: search.candidateStatus,
    candidatePage: search.candidatePage,
    candidateSort: search.candidateSort,
    candidateDirection: search.candidateDirection,
  }
}
