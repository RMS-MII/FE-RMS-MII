import { mapStageEmployeeStatus } from "@/features/recruitments"
import type { InterviewerInvitationDto, StageInvitationItem } from "../types"

export function mapInterviewerInvitation(
  dto: InterviewerInvitationDto
): StageInvitationItem {
  return {
    id: dto.id,
    batchStageId: dto.stageId,
    stageId: dto.stageId,
    recruitmentId: dto.batchId,
    recruitmentName: dto.batchName,
    recruitmentBatchCode: dto.batchCode,
    stageName: dto.stageName,
    stageTypeName: dto.stageTypeName,
    startDate: dto.stageStartDate,
    endDate: dto.stageEndDate,
    status: mapStageEmployeeStatus(dto.status),
    note: dto.note,
    assignedAt: dto.assignedAt,
    respondedAt: dto.respondedAt,
  }
}
