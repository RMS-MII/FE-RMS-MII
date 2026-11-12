import { useEffect, useMemo, useState } from "react"
import { getApiError } from "@/shared/api/api-error"
import {
  useAssignTakeHomeMutation,
  useConfirmInterviewerSessionMutation,
  useGetInterviewerSessionDetailQuery,
  useRequestInterviewerRescheduleMutation,
  useSubmitInterviewerAssessmentMutation,
} from "../api/interviewer-api"
import type { AssignTakeHomePayload, SubmitAssessmentPayload } from "../types"
import { mapInterviewerSession } from "../utils/interviewerSessionAdapter"

export function useInterviewerSessionDetail(sessionInterviewId: string) {
  const query = useGetInterviewerSessionDetailQuery(sessionInterviewId, {
    refetchOnMountOrArgChange: true,
  })
  const [assignTakeHome, { isLoading: isSavingTakeHome }] =
    useAssignTakeHomeMutation()
  const [submitAssessment, { isLoading: isSavingAssessment }] =
    useSubmitInterviewerAssessmentMutation()
  const [confirmSession, { isLoading: isConfirming }] =
    useConfirmInterviewerSessionMutation()
  const [requestReschedule, { isLoading: isRequestingReschedule }] =
    useRequestInterviewerRescheduleMutation()
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)

  useEffect(() => {
    const refresh = () => void query.refetch()
    window.addEventListener("focus", refresh)
    return () => window.removeEventListener("focus", refresh)
  }, [query.refetch])

  const session = useMemo(() => {
    if (!query.currentData) return null
    const mapped = mapInterviewerSession(query.currentData.session)
    if (mapped.assessment)
      mapped.assessment.notes = query.currentData.assessmentNotes ?? ""
    return mapped
  }, [query.currentData])

  const saveTakeHome = async (payload: AssignTakeHomePayload) => {
    if (!session) return
    try {
      const result = await assignTakeHome({
        sessionId: session.sessionId,
        body: payload,
      }).unwrap()
      setNotice(result.message)
    } catch (error) {
      throw new Error(
        getApiError(error, "Unable to save the take-home assignment.").message
      )
    }
  }

  const saveAssessment = async (payload: SubmitAssessmentPayload) => {
    if (!session) return
    try {
      await submitAssessment({
        sessionInterviewId: session.id,
        body: payload,
      }).unwrap()
      setNotice("Assessment saved.")
    } catch (error) {
      throw new Error(
        getApiError(error, "Unable to save the assessment.").message
      )
    }
  }

  const acceptSchedule = async () => {
    if (!session?.isLead) return
    setActionError(null)
    try {
      await confirmSession(session.id).unwrap()
      setConfirmOpen(false)
      setNotice("Interview schedule confirmed.")
    } catch (error) {
      setActionError(getApiError(error).message)
    }
  }

  const submitReschedule = async (
    interviewSessionId: string,
    proposedStart: string,
    proposedEnd: string,
    reason: string
  ) => {
    try {
      await requestReschedule({
        interviewSessionId,
        proposedStart,
        proposedEnd,
        reason,
      }).unwrap()
      setRescheduleOpen(false)
      setNotice("Reschedule request submitted for HR review.")
    } catch (error) {
      throw new Error(getApiError(error).message)
    }
  }

  return {
    ...query,
    detail: query.currentData,
    session,
    notice,
    setNotice,
    actionError,
    setActionError,
    confirmOpen,
    setConfirmOpen,
    rescheduleOpen,
    setRescheduleOpen,
    isSavingTakeHome,
    isSavingAssessment,
    isConfirming,
    isRequestingReschedule,
    saveTakeHome,
    saveAssessment,
    acceptSchedule,
    submitReschedule,
  }
}
