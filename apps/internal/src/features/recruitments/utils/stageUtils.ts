import type { Recruitment, Stage, LegacyStageType, StageTypeDto } from "../types"
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

/** Get configured interview stages from API data or legacy recruitment data. */
export function getRecruitmentInterviewStages(recruitment: Recruitment): Pick<Stage, "id" | "name">[] {
  const stages = recruitment.batchStages ?? recruitment.stages ?? []
  return stages
    .filter((stage) => {
      const category = "type" in stage ? stage.type : stage.stageCategory
      if (category) return stageCategoryToLegacyType(category) === "interview"
      const name = ("stageName" in stage ? stage.stageName : stage.name).toLowerCase()
      return name.includes("interview") || name.includes("wawancara")
    })
    .map((stage) => ({
      id: stage.id,
      name: "stageName" in stage ? stage.stageName : stage.name,
    }))
}

export function getActiveRecruitmentInterviewStages(recruitment: Recruitment): Pick<Stage, "id" | "name">[] {
  const activeStageIds = new Set(
    (recruitment.batchStages ?? [])
      .filter((stage) => ["active", "1"].includes(String(stage.lifecycleStatus).toLowerCase()))
      .map((stage) => stage.id)
  )
  return getRecruitmentInterviewStages(recruitment).filter((stage) => activeStageIds.has(stage.id))
}

/** Map StageTypeId to legacy stage category string using supplied stageTypes list */
export function mapStageTypeToCategory(
  stageTypeId: string,
  stageTypes?: StageTypeDto[],
  fallback: LegacyStageType = "screening"
): LegacyStageType {
  const category = stageTypes?.find((stageType) => stageType.id === stageTypeId)?.stageCategory
  return category == null ? fallback : stageCategoryToLegacyType(category)
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
    }
  })
}
