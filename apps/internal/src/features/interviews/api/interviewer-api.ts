import { baseApi } from "@/shared/api/base-api"
import type {
  GetInterviewerInvitationsParams,
  InterviewerInvitationDto,
  RespondInvitationRequest,
  RespondInvitationResponse,
} from "../types"

export const interviewerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  useGetInterviewerInvitationsQuery,
  useRespondToInterviewerInvitationMutation,
} = interviewerApi
