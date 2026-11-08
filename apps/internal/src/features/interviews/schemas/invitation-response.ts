import { z } from "zod"

export const declineStageSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1, "Please provide a reason for declining this assignment.")
    .max(500, "The reason must be 500 characters or fewer."),
})

export type DeclineStageValues = z.infer<typeof declineStageSchema>
