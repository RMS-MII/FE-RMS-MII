import type { Recruitment } from "../types"

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
  if (r.stages.length === 0) {
    return "No stages"
  }
  if (r.currentStage < 0 || r.status === "draft") {
    return "Not started"
  }
  if (r.currentStage >= r.stages.length || r.status === "completed") {
    return "All stages completed"
  }
  const current = r.stages[r.currentStage]
  return current?.name ?? `Stage ${r.currentStage + 1}`
}

