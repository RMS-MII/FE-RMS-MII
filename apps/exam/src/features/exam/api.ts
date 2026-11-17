import type {
  CandidateTest,
  FinishTestResult,
  StartTestResult,
  SubmitAnswerResult,
  SubmitTestAnswer,
} from "./types"
import { candidatePortalUrl } from "@/lib/candidate-portal-url"

export interface ProblemDetails {
  type?: string | null
  title?: string | null
  status?: number | string | null
  detail?: string | null
  instance?: string | null
}

export class ApiError extends Error {
  readonly status: number
  readonly detail?: string
  readonly title?: string

  constructor(
    message: string,
    status: number,
    options?: { detail?: string; title?: string }
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.detail = options?.detail
    this.title = options?.title
  }
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5160/api"
).replace(/\/+$/, "")

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  if (!contentType.includes("application/json") && !contentType.includes("+json")) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

function toApiError(response: Response, body: unknown): ApiError {
  const problem =
    body && typeof body === "object" ? (body as ProblemDetails) : undefined
  const detail = problem?.detail ?? undefined
  const title = problem?.title ?? undefined

  return new ApiError(
    detail ?? title ?? `Permintaan gagal (${response.status})`,
    response.status,
    { detail, title }
  )
}

export async function request<T>(
  path: string,
  init?: RequestInit,
  signal?: AbortSignal,
  redirectOnUnauthorized = true
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    signal,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  })

  const body = await parseBody(response)

  if (!response.ok) {
    if (response.status === 401 && redirectOnUnauthorized) {
      redirectToCandidateLogin()
    }
    throw toApiError(response, body)
  }

  return body as T
}

export function redirectToCandidateLogin() {
  const login = new URL(candidatePortalUrl("/login"))
  login.searchParams.set("next", window.location.pathname + window.location.search)
  login.searchParams.set("exam", "1")
  window.location.assign(login.href)
}

export function getPortalCandidateTest(
  candidateId: string,
  stageId: string,
  signal?: AbortSignal
) {
  return request<CandidateTest>(
    `/portal/${encodeURIComponent(candidateId)}/stages/${encodeURIComponent(stageId)}/test`,
    { method: "GET" },
    signal,
    false
  )
}

export function getExamCandidateTest(
  candidateId: string,
  stageId: string,
  signal?: AbortSignal
) {
  return request<CandidateTest>(
    `/exam/${encodeURIComponent(candidateId)}/stages/${encodeURIComponent(stageId)}/test`,
    { method: "GET" },
    signal,
    false
  )
}

export function startCandidateTest(
  candidateId: string,
  stageId: string,
  signal?: AbortSignal
) {
  return request<StartTestResult>(
    `/portal/${encodeURIComponent(candidateId)}/stages/${encodeURIComponent(stageId)}/test/start`,
    { method: "POST" },
    signal,
    false
  )
}

export function submitCandidateTestAnswer(
  params: {
    candidateId: string
    stageId: string
    answers: SubmitTestAnswer[]
    isDraft?: boolean
  },
  signal?: AbortSignal
) {
  return request<SubmitAnswerResult>(
    `/exam/${encodeURIComponent(params.candidateId)}/stages/${encodeURIComponent(params.stageId)}/test/answers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers: params.answers,
        isDraft: params.isDraft ?? false,
      }),
    },
    signal,
    false
  )
}

export function finishCandidateTest(
  candidateId: string,
  stageId: string,
  signal?: AbortSignal
) {
  return request<FinishTestResult>(
    `/exam/${encodeURIComponent(candidateId)}/stages/${encodeURIComponent(stageId)}/test/finish`,
    {
      method: "POST",
    },
    signal,
    false
  )
}
