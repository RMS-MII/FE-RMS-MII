import type { LegacyStageType, StageInterviewerAssignment } from "../../types"

export interface EditableStage {
  tempId: string
  id: string
  stageTypeId: string
  name: string
  type: LegacyStageType
  durationDays: number
  ownerId?: string
  interviewerIds: string[]
  assignedInterviewers?: StageInterviewerAssignment[]
  passingScore: number | null
  startDate: string
  endDate: string
  isActive: boolean
}

