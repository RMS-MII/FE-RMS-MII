import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { CandidatesListPage } from "@/features/candidates"

export const candidateListSearchSchema = z.object({
  search: z.string().optional().catch(undefined),
  gender: z.enum(["all", "male", "female"]).optional().catch(undefined),
  batchStatus: z.enum(["all", "applied", "pool"]).optional().catch(undefined),
  sort: z
    .enum(["name", "education", "gpa", "salary", "batches", "createdAt"])
    .optional()
    .catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(undefined),
  pageSize: z.coerce.number().int().positive().optional().catch(undefined),
})

export type CandidateListSearch = z.infer<typeof candidateListSearchSchema>

export const Route = createFileRoute("/_auth/candidates/")({
  validateSearch: (search: Record<string, unknown>): CandidateListSearch =>
    candidateListSearchSchema.parse(search),
  component: CandidatesListPage,
})
