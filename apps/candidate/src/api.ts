export interface Session {
  id: string
  sessionName: string
  scheduledStart: string
  scheduledEnd: string

  status: string
  isOnline: boolean
  location?: string
  meetingUrl?: string

  endedSubmissionAt?: string
  fileTakeHome?: string
  fileSubmission?: string
  isSubmitted: boolean

  canConfirm: boolean
  canRequestReschedule: boolean
  canUploadSubmission: boolean

  interviewers: string[]
  reschedule?: { status: string; proposedStart: string; proposedEnd: string }
}

export interface Stage {
  applicationStageId: string
  batchStageId: string
  stageName: string
  status: string
  endAt: string
  canTakeTest: boolean
  sessions: Session[]
}

export interface Application {
  id: string
  codeApplication: string
  batchName: string
  departmentName: string
  status: string
  stages: Stage[]
  pipeline: { batchStageId: string; stageName: string; nextStageId?: string }[]
}

export interface Tasks {
  candidateId: string
  candidateName: string
  candidateEmail: string
  applications: Application[]
}

const base = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5160/api"
).replace(/\/$/, "")

export async function request<T>(
  path: string,
  body?: object,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    signal,
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch((error: unknown) => {
    if (signal?.aborted) throw error
    throw new Error("Could not connect. Check your connection and try again.")
  })

  if (!response.ok) {
    if (path.startsWith("/portal/jobs/") && response.status < 500) {
      const problem = (await response.json().catch(() => null)) as {
        detail?: string
        errors?: Record<string, string[]>
      } | null
      const validationMessage = Object.values(problem?.errors ?? {})
        .flat()
        .join(" ")
      throw new Error(
        problem?.detail ||
          validationMessage ||
          "Could not submit your application. Try again."
      )
    }

    if (response.status === 404 || response.status === 403) {
      throw new Error(
        "This link is unavailable. Check your recruitment email for the latest link."
      )
    }

    if ([400, 409, 422].includes(response.status)) {
      if (path.endsWith("/submission"))
        throw new Error(
          "Could not save your work. Check the link and the submission deadline."
        )
      if (path.endsWith("/reschedule"))
        throw new Error(
          "Could not reschedule. Check your proposed time and refresh to see the latest interview status."
        )
      if (path.endsWith("/confirm"))
        throw new Error(
          "This interview could not be confirmed. Refresh to see the latest schedule."
        )
    }

    throw new Error("Something went wrong. Please try again.")
  }

  return response.json().catch(() => {
    if (body === undefined)
      throw new Error("Could not load your application. Try again.")
    return null
  }) as Promise<T>
}

export function safeUrl(value?: string) {
  try {
    const url = new URL(value || "")
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

const jakartaDateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
})

export function parseDate(value: string) {
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : value + "Z")
}

export function date(value?: string) {
  return value ? `${jakartaDateTime.format(parseDate(value))} WIB` : "—"
}

export const labels: Record<string, string> = {
  InProcess: "In progress",
  InProgress: "In progress",
  Submitted: "Submitted",
  Prioritized: "Passed",
  Considered: "Passed",
  Rejected: "Not selected",
  Dropped: "Not selected",
  Expired: "Expired",
  Accepted: "Accepted",
  PendingConfirmation: "Awaiting interviewer",
  Scheduled: "Scheduled",
  AcceptedByInterviewer: "Confirmation needed",
  AcceptedByCandidate: "Confirmed",
  Rescheduled: "Rescheduled",
  Pending: "Awaiting review",
  Approved: "Approved",
  Upcoming: "Not started",
}

export function examUrl(candidateId: string, stageId: string) {
  const template =
    import.meta.env.DEV &&
    "http://localhost:5174/portal/{candidateId}/stages/{stageId}/test"

  return template
    ? safeUrl(
        template
          .replace("{candidateId}", encodeURIComponent(candidateId))
          .replace("{stageId}", encodeURIComponent(stageId))
      )
    : undefined
}
