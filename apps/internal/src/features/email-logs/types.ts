export type EmailDeliveryStatus = "Sent" | "Failed"

export type EmailType =
  | "StageInvitation"
  | "InterviewerInvitation"
  | "InterviewInvitation"
  | "RescheduleRequest"
  | "RescheduleResult"
  | "TakeHome"
  | "Rejection"
  | "FinalResult"

export interface EmailLog {
  id: string
  senderEmail: string
  recipientEmail: string
  type: EmailType
  subject: string
  status: EmailDeliveryStatus
  attemptedAt: string
  sentAt: string | null
  errorMessage: string | null
}

export interface EmailLogsPage {
  items: EmailLog[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface GetEmailLogsParams {
  search?: string
  type?: EmailType
  status?: EmailDeliveryStatus
  from?: string
  to?: string
  page: number
  pageSize: number
}
