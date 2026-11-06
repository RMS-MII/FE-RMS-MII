import type { Stage, LegacyStageType, StageTypeDto } from "../types"
import type { EditableStage } from "../components/stages/types"

/** Reorder an array from one index to another (immutable). */
export function reorderArray<T>(list: T[], startIndex: number, endIndex: number): T[] {
  if (
    startIndex < 0 ||
    startIndex >= list.length ||
    endIndex < 0 ||
    endIndex >= list.length ||
    startIndex === endIndex
  ) {
    return list
  }
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

/** Formats stage category (enum or string) into human-readable label */
export function formatStageCategory(category: number | string | undefined | null): string {
  if (category === undefined || category === null) return "General"
  if (typeof category === "number") {
    switch (category) {
      case 1:
        return "Test"
      case 2:
        return "Interview"
      case 3:
        return "Offering"
      default:
        return "General"
    }
  }
  const str = String(category).trim()
  if (str === "1") return "Test"
  if (str === "2") return "Interview"
  if (str === "3") return "Offering"
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/** Converts backend stage category (number or string) to frontend LegacyStageType */
export function stageCategoryToLegacyType(
  category: number | string | undefined | null
): LegacyStageType {
  if (category === undefined || category === null) return "screening"
  const str = String(category).toLowerCase()
  if (str === "1" || str.includes("test")) return "test"
  if (str === "2" || str.includes("interview")) return "interview"
  if (str === "3" || str.includes("offering")) return "offering"
  return "screening"
}

/** Map StageTypeId to legacy stage category string using supplied stageTypes list */
export function mapStageTypeToCategory(
  stageTypeId: string,
  stageTypes?: StageTypeDto[]
): LegacyStageType {
  if (!stageTypes || stageTypes.length === 0) return "screening"
  const selectedType = stageTypes.find((st) => st.id === stageTypeId)
  return stageCategoryToLegacyType(selectedType?.stageCategory)
}

/** Link stages into ERD-compliant sequential chain (NextStageId, NULL on last stage) */
export function buildChainedStages(
  stages: EditableStage[],
  recruitmentBatchId: string
): Stage[] {
  return stages.map((s, index) => {
    const next = stages[index + 1]
    return {
      id: s.id || `s-${recruitmentBatchId}-${index + 1}`,
      name: s.name.trim(),
      type: s.type,
      durationDays: s.durationDays,
      ownerId: s.ownerId ?? s.interviewerIds?.[0] ?? "",
      interviewerIds: s.interviewerIds ?? (s.ownerId ? [s.ownerId] : []),
      assignedInterviewers: s.assignedInterviewers,
      batchStageId: `bs-${s.id || `s-${recruitmentBatchId}-${index + 1}`}`,
      recruitmentBatchId,
      stageTypeId: s.stageTypeId,
      nextStageId: next ? next.id : null, // ERD: NULL = last stage
      passingScore: s.passingScore !== null ? Number(s.passingScore) : null,
      startDate: s.startDate || null,
      endDate: s.endDate || null,
      isActive: s.isActive ?? true,
    }
  })
}
