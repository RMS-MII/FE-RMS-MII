import type { CandidateTest } from "./types"

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
})

export function parseServerDate(value?: string | null): number {
  if (!value) {
    return Number.NaN
  }

  // Backend mengirim DateTime dari database tanpa penanda timezone (mis.
  // "2026-11-09T03:24:32") padahal nilainya UTC. Tanpa "Z", browser akan
  // membacanya sebagai waktu lokal sehingga bisa selisih beberapa jam.
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)

  return new Date(hasTimezone ? value : `${value}Z`).getTime()
}

export function formatDateTime(value?: string | null): string {
  const timestamp = parseServerDate(value)

  if (Number.isNaN(timestamp)) {
    return "-"
  }

  return dateTimeFormatter.format(new Date(timestamp))
}

export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  const pad = (value: number) => String(value).padStart(2, "0")

  if (days > 0) {
    return `${days} hari ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function parseTimeSpanToMs(value: string | null): number | null {
  if (!value) {
    return null
  }

  const parts = value.split(":")
  const seconds = Number(parts.at(-1) ?? 0)
  const minutes = Number(parts.at(-2) ?? 0)
  const hours = Number(parts.at(-3) ?? 0)

  if ([seconds, minutes, hours].some((part) => Number.isNaN(part))) {
    return null
  }

  return ((hours * 60 + minutes) * 60 + seconds) * 1000
}

export function getTestDeadline(
  test: CandidateTest,
  sessionStartedAt: number | null
): number | null {
  const endAt = parseServerDate(test.endAt)

  if (Number.isNaN(endAt)) {
    return null
  }

  const durationMs = parseTimeSpanToMs(test.durationTest)
  const hasDuration = durationMs !== null && durationMs > 0

  // Tanpa durasi khusus (mis. "00:00:00"): berlaku sampai endAt, tetapi
  // countdown baru aktif setelah kandidat mulai mengerjakan.
  if (!hasDuration) {
    return sessionStartedAt === null ? null : endAt
  }

  // Sebelum kandidat masuk ke soal, durasi belum berjalan.
  if (sessionStartedAt === null) {
    return null
  }

  // endAt tetap menjadi batas keras.
  return Math.min(endAt, sessionStartedAt + durationMs)
}

export function isMultipleChoice(questionType: string): boolean {
  return questionType.toLowerCase().includes("multiple")
}

export function formatQuestionType(questionType: string): string {
  if (isMultipleChoice(questionType)) {
    return "Pilih lebih dari satu"
  }

  return "Pilih satu jawaban"
}

export function formatStageStatus(
  status: string | number | null | undefined
): string {
  if (status === null || status === undefined) {
    return "Selesai"
  }

  if (typeof status === "number") {
    return "Selesai"
  }

  const labels: Record<string, string> = {
    Completed: "Selesai",
    Submitted: "Terkirim",
    InProgress: "Sedang Berjalan",
    Pending: "Menunggu",
    Passed: "Lulus",
    Failed: "Tidak Lulus",
    Rejected: "Tidak Lolos",
    Scheduled: "Terjadwal",
    Cancelled: "Dibatalkan",
    Expired: "Kedaluwarsa",
    NotStarted: "Belum Dimulai",
  }

  return labels[status] ?? status
}

export function getAnsweredCount(
  questions: CandidateTest["questions"],
  answers: Record<string, string[]>
): number {
  return questions.filter((question) => (answers[question.id]?.length ?? 0) > 0)
    .length
}

export function getMissingRequiredQuestions(
  questions: CandidateTest["questions"],
  answers: Record<string, string[]>
) {
  return questions.filter(
    (question) =>
      question.isRequired && (answers[question.id]?.length ?? 0) === 0
  )
}
