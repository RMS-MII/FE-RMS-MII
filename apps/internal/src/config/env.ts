import { z } from "zod"

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default("http://localhost:5160/api"),
  VITE_APP_TITLE: z.string().default("Rekrutin"),
})

export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
})

