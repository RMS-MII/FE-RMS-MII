import type { StageEmployeeStatusValue } from "@/features/recruitments"

export interface InterviewerInvitationDto {
  id: string // StageEmployeeId
  batchId: string
  batchCode: string
  batchName: string
  stageId: string // BatchStageId
  stageName: string
  stageTypeName: string
  stageStartDate: string
  stageEndDate: string
  status: StageEmployeeStatusValue
  statusName: string
  note: string | null
  assignedAt: string
  respondedAt: string | null
}

export interface RespondInvitationRequest {
  response: "Accepted" | "Declined"
  note: string | null
}

export interface RespondInvitationResponse {
  invitationId: string
  batchId: string
  batchName: string
  stageId: string
  stageName: string
  status: StageEmployeeStatusValue
  statusName: string
  note: string | null
  respondedAt: string
}

export interface GetInterviewerInvitationsParams {
  status?: "Pending" | "Accepted" | "Declined"
}
