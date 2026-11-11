import { baseApi } from "@/shared/api/base-api"
import type {
  ApiAssessmentRecommendation,
  AssignTakeHomePayload,
  ConfirmInterviewResponseDto,
  InterviewerSessionDto,
  SubmitInterviewAssessmentDto,
  GetInterviewerInvitationsParams,
  InterviewerInvitationDto,
  RespondInvitationRequest,
  RespondInvitationResponse,
  CreateRescheduleRequest,
  InterviewerRescheduleRequestDto,
} from "../types"

export const interviewerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    assignTakeHome: builder.mutation<
      { emailSent: boolean; message: string },
      { sessionId: string; body: AssignTakeHomePayload }
    >({
      query: ({ sessionId, body }) => ({
        url: `/interview-sessions/${sessionId}/take-home`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => result
        ? [
            { type: "Interview", id: "INTERVIEWER_SESSIONS" },
            { type: "Interview", id: "INTERVIEWER_DASHBOARD" },
            { type: "Candidate", id: "APPLICATION_DETAILS" },
          ]
        : [],
    }),
    requestInterviewerReschedule: builder.mutation<
      InterviewerRescheduleRequestDto,
      CreateRescheduleRequest
    >({
      query: (body) => ({ url: "/reschedule-requests", method: "POST", body }),
      invalidatesTags: (result) => result
        ? [
            { type: "Interview", id: "INTERVIEWER_SESSIONS" },
            { type: "Interview", id: "INTERVIEWER_DASHBOARD" },
            { type: "Interview", id: "RESCHEDULE_LIST" },
            { type: "Candidate", id: "APPLICATION_DETAILS" },
          ]
        : [],
    }),
    getInterviewerSessions: builder.query<
      InterviewerSessionDto[],
      {
        status?: "InProgress" | "Completed" | "Cancelled" | 1 | 2 | 3
        sessionStatus?:
          | "Scheduled"
          | "PendingConfirmation"
          | "Rescheduled"
          | "AcceptedByInterviewer"
          | "AcceptedByCandidate"
          | 1
          | 2
          | 3
          | 4
          | 5
        from?: string
        to?: string
        pendingActionOnly?: boolean
      } | void
    >({
      query: (params) => ({
        url: "/interviewer/sessions",
        params: params ?? undefined,
      }),
      providesTags: [{ type: "Interview", id: "INTERVIEWER_SESSIONS" }],
    }),
    confirmInterviewerSession: builder.mutation<
      ConfirmInterviewResponseDto,
      string
    >({
      query: (sessionInterviewId) => ({
        url: `/session-interviews/${sessionInterviewId}/confirm`,
        method: "POST",
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Interview", id: "INTERVIEWER_SESSIONS" },
              { type: "Interview", id: "INTERVIEWER_DASHBOARD" },
            ]
          : [],
    }),
    submitInterviewerAssessment: builder.mutation<
      SubmitInterviewAssessmentDto,
      {
        sessionInterviewId: string
        body: {
          score: number
          recommendation: ApiAssessmentRecommendation
          notes: string
        }
      }
    >({
      query: ({ sessionInterviewId, body }) => ({
        url: `/session-interviews/${sessionInterviewId}/assessment`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Interview", id: "INTERVIEWER_SESSIONS" },
              { type: "Interview", id: "INTERVIEWER_DASHBOARD" },
              { type: "Candidate", id: "APPLICATION_DETAILS" },
              { type: "Candidate", id: "LIST" },
            ]
          : [],
    }),
    getInterviewerInvitations: builder.query<
      InterviewerInvitationDto[],
      GetInterviewerInvitationsParams
    >({
      query: (params) => ({ url: "/interviewer/invitations", params }),
      providesTags: [{ type: "Interview", id: "INVITATIONS" }],
    }),
    respondToInterviewerInvitation: builder.mutation<
      RespondInvitationResponse,
      { invitationId: string; body: RespondInvitationRequest }
    >({
      query: ({ invitationId, body }) => ({
        url: `/interviewer/invitations/${invitationId}/respond`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Interview", id: "INVITATIONS" },
              { type: "Interview", id: "INTERVIEWER_DASHBOARD" },
              { type: "Interview", id: "AVAILABLE_INTERVIEWERS" },
              { type: "Stage", id: result.batchId },
              { type: "Recruitment", id: result.batchId },
              { type: "Recruitment", id: "LIST" },
              { type: "Candidate", id: `APPLICATION_BATCH_${result.batchId}` },
              { type: "Interview", id: `BATCH_${result.batchId}` },
            ]
          : [],
    }),
  }),
})

export const {
  useGetInterviewerSessionsQuery,
  useAssignTakeHomeMutation,
  useRequestInterviewerRescheduleMutation,
  useConfirmInterviewerSessionMutation,
  useSubmitInterviewerAssessmentMutation,
  useGetInterviewerInvitationsQuery,
  useRespondToInterviewerInvitationMutation,
} = interviewerApi
