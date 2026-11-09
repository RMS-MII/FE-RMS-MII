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
  })

  const data = await response.json().catch(() => null)

  if (!response.ok)
    throw new Error(
      data?.detail ||
        Object.values(data?.errors || {})
          .flat()
          .join(" ") ||
        "Permintaan belum berhasil. Silakan coba lagi."
    )

  return data as T
}

export function safeUrl(value?: string) {
  try {
    const url = new URL(value || "")
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

export function date(value?: string) {
  if (!value) return "—"
  const utc = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : value + "Z"
  return (
    new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(utc)) + " WIB"
  )
}

export const labels: Record<string, string> = {
  InProcess: "Dalam proses",
  InProgress: "Sedang berjalan",
  Submitted: "Sudah dikirim",
  Prioritized: "Lolos",
  Considered: "Lolos",
  Rejected: "Tidak dilanjutkan",
  Dropped: "Tidak dilanjutkan",
  Expired: "Waktu berakhir",
  Accepted: "Diterima",
  PendingConfirmation: "Menunggu interviewer",
  Scheduled: "Terjadwal",
  AcceptedByInterviewer: "Menunggu konfirmasi Anda",
  AcceptedByCandidate: "Kehadiran dikonfirmasi",
  Rescheduled: "Jadwal diganti",
  Pending: "Menunggu keputusan HR",
  Approved: "Disetujui",
  Upcoming: "Belum dimulai",
}

export function examUrl(candidateId: string, stageId: string) {
  const template = import.meta.env.VITE_EXAM_URL_TEMPLATE as string | undefined

  return template
    ? safeUrl(
        template
          .replace("{candidateId}", encodeURIComponent(candidateId))
          .replace("{stageId}", encodeURIComponent(stageId))
      )
    : undefined
}
