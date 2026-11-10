import type {
  CandidateTest,
  StartTestResult,
  SubmitTestCommand,
  SubmitTestResult,
} from "./types"

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

  if (!contentType.includes("application/json")) {
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
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    signal,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  })

  const body = await parseBody(response)

  if (!response.ok) {
    throw toApiError(response, body)
  }

  return body as T
}

export function getCandidateTest(
  candidateId: string,
  stageId: string,
  signal?: AbortSignal
) {
  return request<CandidateTest>(
    `/portal/${encodeURIComponent(candidateId)}/stages/${encodeURIComponent(stageId)}/test`,
    { method: "GET" },
    signal
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
    signal
  )
}

export function submitCandidateTest(
  command: SubmitTestCommand,
  signal?: AbortSignal
) {
  return request<SubmitTestResult>(
    `/portal/${encodeURIComponent(command.candidateId)}/stages/${encodeURIComponent(command.stageId)}/test/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    },
    signal
  )
}
