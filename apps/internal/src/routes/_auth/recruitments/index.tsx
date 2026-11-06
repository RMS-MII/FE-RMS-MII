import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { RecruitmentsListPage } from "@/features/recruitments"

export const recruitmentListSearchSchema = z.object({
  search: z.string().optional().catch(undefined),
  status: z
    .string()
    .optional()
    .catch(undefined),
  division: z.string().optional().catch(undefined),
  sortBy: z
    .enum(["code", "name", "stage", "candidates", "period", "status"])
    .optional()
    .catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(undefined),
})

export type RecruitmentListSearch = z.infer<typeof recruitmentListSearchSchema>

export const Route = createFileRoute("/_auth/recruitments/")({
  validateSearch: (search: Record<string, unknown>): RecruitmentListSearch =>
    recruitmentListSearchSchema.parse(search),
  component: RecruitmentsListPage,
})
