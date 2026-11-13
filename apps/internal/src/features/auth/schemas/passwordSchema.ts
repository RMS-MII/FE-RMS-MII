import { z } from "zod"

export const passwordSchema = z.string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use no more than 128 characters")
  .regex(/\p{Lu}/u, "Include an uppercase letter")
  .regex(/\p{Ll}/u, "Include a lowercase letter")
  .regex(/\p{Nd}/u, "Include a number")
  .regex(/[^\p{L}\p{N}\s]/u, "Include a symbol")
