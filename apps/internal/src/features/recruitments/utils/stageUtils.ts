import type { Stage, LegacyStageType } from "../types"
import type { EditableStage } from "../components/stages/types"
import { mockStageTypes } from "../data/mock"

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

/** Standard IT Recruitment pipeline presets */
export const standardStagePresets = [
  {
    stageTypeId: "st-10000000-0000-4000-8000-000000000001",
    name: "Document Screening",
    type: "screening" as LegacyStageType,
    durationDays: 7,
    passingScore: 70,
  },
  {
    stageTypeId: "st-10000000-0000-4000-8000-000000000002",
    name: "Logic & Technical Test",
    type: "test" as LegacyStageType,
    durationDays: 5,
    passingScore: 75,
  },
  {
    stageTypeId: "st-10000000-0000-4000-8000-000000000003",
    name: "HR Interview",
    type: "interview" as LegacyStageType,
    durationDays: 10,
    passingScore: 75,
  },
  {
    stageTypeId: "st-10000000-0000-4000-8000-000000000004",
    name: "User / Technical Interview",
    type: "interview" as LegacyStageType,
    durationDays: 10,
    passingScore: 80,
  },
  {
    stageTypeId: "st-10000000-0000-4000-8000-000000000005",
    name: "Offering Letter",
    type: "offering" as LegacyStageType,
    durationDays: 7,
    passingScore: 100,
  },
]

/** Map StageTypeId to legacy stage category string */
export function mapStageTypeToCategory(stageTypeId: string): LegacyStageType {
  const selectedType = mockStageTypes.find((st) => st.id === stageTypeId)
  const cat = selectedType?.stageCategory?.toLowerCase() ?? ""
  if (cat.includes("test")) return "test"
  if (cat.includes("interview")) return "interview"
  if (cat.includes("offering")) return "offering"
  return "screening"
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
      ownerId: s.ownerId,
      batchStageId: `bs-${s.id || `s-${recruitmentBatchId}-${index + 1}`}`,
      recruitmentBatchId,
      stageTypeId: s.stageTypeId,
      nextStageId: next ? next.id : null, // ERD: NULL = last stage
      passingScore: s.passingScore !== null ? Number(s.passingScore) : null,
      startDate: s.startDate || null,
      endDate: s.endDate || null,
      isActive: s.isActive,
    }
  })
}

