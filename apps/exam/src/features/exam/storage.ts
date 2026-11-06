import type { ExamAnswers } from "./types"

export interface ExamDraft {
  started: boolean
  answers: ExamAnswers
  currentIndex: number
  updatedAt: string
}

const DRAFT_PREFIX = "rms_exam_draft"

function getDraftKey(candidateId: string, stageId: string) {
  return `${DRAFT_PREFIX}:${candidateId}:${stageId}`
}

export function loadExamDraft(
  candidateId: string,
  stageId: string
): ExamDraft | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(getDraftKey(candidateId, stageId))

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<ExamDraft>

    if (
      typeof parsed.started !== "boolean" ||
      typeof parsed.currentIndex !== "number" ||
      !parsed.answers ||
      typeof parsed.answers !== "object"
    ) {
      return null
    }

    return {
      started: parsed.started,
      answers: parsed.answers as ExamAnswers,
      currentIndex: parsed.currentIndex,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function saveExamDraft(
  candidateId: string,
  stageId: string,
  draft: ExamDraft
) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(
      getDraftKey(candidateId, stageId),
      JSON.stringify(draft)
    )
  } catch {
    // Penyimpanan lokal bisa gagal (mode privat/kuota penuh). Abaikan saja.
  }
}

export function clearExamDraft(candidateId: string, stageId: string) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.removeItem(getDraftKey(candidateId, stageId))
  } catch {
    // Abaikan kegagalan penyimpanan lokal.
  }
}
