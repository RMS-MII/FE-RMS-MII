import { request } from "@/features/exam/api"
import type { CandidateTasks } from "./types"

export function getCandidateTasks(candidateId: string, signal?: AbortSignal) {
  return request<CandidateTasks>(
    `/portal/${encodeURIComponent(candidateId)}/tasks`,
    { method: "GET" },
    signal
  )
}
