import type { Recruitment } from "../types"
import { getRecruitmentInterviewStages } from "./stageUtils"

/** Explain why new candidates or interviews cannot be added to a batch. */
export function getRecruitmentAddRestriction(
  recruitment: Recruitment,
  action: "candidate" | "interview"
): string | null {
  const actionLabel = action === "candidate" ? "adding candidates" : "scheduling interviews"
  const stages = recruitment.batchStages ?? recruitment.stages ?? []
  if (stages.length === 0) {
    return `Configure selection stages before ${actionLabel}.`
  }

  const status = String(recruitment.status).trim().toLowerCase()
  if (status !== "open" && status !== "running" && status !== "2") {
    return `This recruitment batch must be Open before ${actionLabel}.`
  }

  if (action === "interview" && getRecruitmentInterviewStages(recruitment).length === 0) {
    return "Configure an interview stage before scheduling interviews."
  }

  return null
}

/** Generate auto-incremented batch code e.g. REC-2026-006 */
export function generateBatchCode(existingCount: number, year = new Date().getFullYear()): string {
  const padIndex = String(existingCount + 1).padStart(3, "0")
  return `REC-${year}-${padIndex}`
}

/** Validate recruitment creation modal input */
export function validateRecruitmentFormData(formData: {
  name: string
  departmentId: string
  openDate: string
  closeDate: string
}): Record<string, string> {
  const errs: Record<string, string> = {}
  if (!formData.name.trim()) errs.name = "Recruitment name is required"
  if (!formData.departmentId) errs.departmentId = "Department is required"
  if (!formData.openDate) errs.openDate = "Start date is required"
  if (!formData.closeDate) errs.closeDate = "End date is required"
  if (formData.openDate && formData.closeDate && formData.closeDate < formData.openDate) {
    errs.closeDate = "End date cannot be earlier than start date"
  }
  return errs
}

/** Format current stage summary label for recruitment list table */
export function formatCurrentStageText(r: Recruitment): string {
  // If batchStages is provided from backend API
  if (r.batchStages && Array.isArray(r.batchStages)) {
    if (r.batchStages.length === 0) return "No stages"
    const statusStr = String(r.status).toLowerCase()
    if (statusStr === "draft" || statusStr === "1") return "Not started"
    if (statusStr === "closed" || statusStr === "3") return "All stages completed"

    const activeStage = r.batchStages.find((s) => s.isActive)
    if (activeStage) return activeStage.stageName || activeStage.stageTypeName || "Active Stage"

    return `${r.batchStages.length} Stages`
  }

  // Fallback for legacy mock
  if (!r.stages || r.stages.length === 0) {
    return "No stages"
  }
  if (r.currentStage === undefined || r.currentStage < 0 || r.status === "draft") {
    return "Not started"
  }
  if (r.currentStage >= r.stages.length || r.status === "completed") {
    return "All stages completed"
  }
  const current = r.stages[r.currentStage]
  return current?.name ?? `Stage ${r.currentStage + 1}`
}
