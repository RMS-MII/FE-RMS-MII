import { useState, useMemo, useCallback } from "react"
import type {
  Recruitment,
  InterviewSessionItem,
  BatchInterviewSessionDto,
} from "../types"
import {
  mapInterviewSessionStatus,
  mapSessionInterviewStatus,
} from "../utils/statusAdapters"
import {
  useGetBatchInterviewSessionsQuery,
  useReviewRescheduleRequestMutation,
} from "../api/interviews-api"
import { getRecruitmentAddRestriction } from "../utils/recruitmentUtils"
import { getRecruitmentInterviewStages } from "../utils/stageUtils"

export {
  mapInterviewSessionStatus as mapBackendStatusToSessionStatus,
  mapSessionInterviewStatus as mapInterviewerStatus,
} from "../utils/statusAdapters"

export function mapDtoToSessionItem(
  dto: BatchInterviewSessionDto,
  recruitmentBatchId: string
): InterviewSessionItem {
  return {
    id: dto.id,
    applicationStageId: dto.applicationStageId,
    recruitmentBatchId: dto.recruitmentBatchId || recruitmentBatchId,
    stageId: dto.batchStageId,
    batchStageId: dto.batchStageId,
    apiStatus: dto.status,
    stageName: dto.stageName,
    sessionName: dto.sessionName,
    scheduledStart: dto.scheduledStart,
    scheduledEnd: dto.scheduledEnd,
    isOnline: dto.isOnline,
    location: dto.location,
    meetingUrl: dto.meetingUrl,
    status: mapInterviewSessionStatus(dto.status),
    candidateId: dto.candidateId || "",
    candidateName: dto.candidateName,
    candidateEmail: dto.candidateEmail,
    codeApplication: dto.codeApplication || "",
    interviewers: (dto.interviewers || []).map((inv) => ({
      id: inv.sessionInterviewId,
      stageEmployeeId: inv.stageEmployeeId,
      employeeId: inv.employeeId,
      employeeName: inv.fullName,
      employeeEmail: inv.email,
      role: inv.jobTitle || "Interviewer",
      status: mapSessionInterviewStatus(inv.status),
      apiStatus: inv.status,
      assessment: null,
    })),
    rescheduleRequest:
      dto.hasPendingReschedule &&
      dto.pendingRescheduleId &&
      dto.proposedStart &&
      dto.proposedEnd
        ? {
            id: dto.pendingRescheduleId,
            interviewSessionId: dto.id,
            requesterEmail: dto.candidateEmail,
            proposedStart: dto.proposedStart,
            proposedEnd: dto.proposedEnd,
            reason: dto.rescheduleReason ?? "",
            status: "pending",
          }
        : null,
  }
}

export interface UseInterviewsTabProps {
  recruitment: Recruitment
  onScheduleInterview?: () => void
  onReviewReschedule?: (session: InterviewSessionItem) => void
}

const IS_GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function useInterviewsTab({
  recruitment,
  onScheduleInterview,
  onReviewReschedule,
}: UseInterviewsTabProps) {
  const scheduleRestriction = getRecruitmentAddRestriction(
    recruitment,
    "interview"
  )
  const canScheduleInterview = !scheduleRestriction

  const isRealBatch = useMemo(
    () => IS_GUID_REGEX.test(recruitment.id),
    [recruitment.id]
  )

  // API query for batch interview sessions
  const {
    currentData: apiSessions,
    error: apiError,
    isLoading: isApiLoading,
    isFetching: isApiFetching,
    isError: isApiError,
    refetch,
  } = useGetBatchInterviewSessionsQuery(
    { batchId: recruitment.id },
    { skip: !isRealBatch }
  )

  const [reviewRescheduleMutation] = useReviewRescheduleRequestMutation()

  // The query remains authoritative; failed or pending mutations do not rewrite its data.
  const sessions = useMemo(
    () =>
      (apiSessions ?? []).map((dto) =>
        mapDtoToSessionItem(dto, recruitment.id)
      ),
    [apiSessions, recruitment.id]
  )

  // Filter states
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [modeFilter, setModeFilter] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isFilterPendingReschedule, setIsFilterPendingReschedule] =
    useState<boolean>(false)

  // Dialog states
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false)
  const [sessionToReschedule, setSessionToReschedule] =
    useState<InterviewSessionItem | null>(null)
  const [rescheduleSessionToReview, setRescheduleSessionToReview] =
    useState<InterviewSessionItem | null>(null)
  const [isReviewRescheduleOpen, setIsReviewRescheduleOpen] =
    useState<boolean>(false)

  // Pending reschedules count
  const pendingReschedules = useMemo(
    () => sessions.filter((s) => s.rescheduleRequest?.status === "pending"),
    [sessions]
  )

  // Available interview stages in this batch
  const interviewStages = useMemo(() => {
    return getRecruitmentInterviewStages(recruitment)
  }, [recruitment])

  // Dropdown filter options
  const stageFilterItems = useMemo(() => {
    return [
      { label: "All Stages", value: "all" },
      ...interviewStages.map((stg) => ({
        label: stg.name,
        value: stg.id,
      })),
    ]
  }, [interviewStages])

  const statusFilterItems = useMemo(() => {
    return [
      { label: "All Status", value: "all" },
      { label: "Scheduled", value: "scheduled" },
      { label: "Pending Confirmation", value: "pending_confirmation" },
      { label: "Accepted by Interviewer", value: "accepted_by_interviewer" },
      { label: "Accepted by Candidate", value: "accepted_by_candidate" },
      { label: "Rescheduled", value: "rescheduled" },
    ]
  }, [])

  const modeFilterItems = useMemo(() => {
    return [
      { label: "All Modes", value: "all" },
      { label: "Online Only", value: "online" },
      { label: "Onsite Only", value: "onsite" },
    ]
  }, [])

  // Filtered interview sessions for calendar and table
  const filteredSessions = useMemo(() => {
    let result = [...sessions]

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.candidateName.toLowerCase().includes(q) ||
          s.candidateEmail.toLowerCase().includes(q) ||
          s.codeApplication.toLowerCase().includes(q) ||
          s.sessionName.toLowerCase().includes(q) ||
          (s.location && s.location.toLowerCase().includes(q))
      )
    }

    // Stage filter
    if (stageFilter !== "all") {
      result = result.filter(
        (s) => s.stageId === stageFilter || s.stageName === stageFilter
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter)
    }

    // Mode filter
    if (modeFilter === "online") {
      result = result.filter((s) => s.isOnline)
    } else if (modeFilter === "onsite") {
      result = result.filter((s) => !s.isOnline)
    }

    return result
  }, [sessions, search, stageFilter, statusFilter, modeFilter])

  // Handlers
  const handleOpenScheduleNew = useCallback(() => {
    if (!canScheduleInterview) return
    setSessionToReschedule(null)
    setIsScheduleOpen(true)
    onScheduleInterview?.()
  }, [canScheduleInterview, onScheduleInterview])

  const handleOpenAdjustSchedule = useCallback(
    (session: InterviewSessionItem) => {
      setSessionToReschedule(session)
      setIsScheduleOpen(true)
    },
    []
  )

  const handleSaveSession = () => {
    // Real scheduling is implemented in phase 03, after application-stage eligibility.
    throw new Error("Interview scheduling is not connected yet.")
  }

  const handleOpenReviewReschedule = useCallback(
    (session: InterviewSessionItem) => {
      setRescheduleSessionToReview(session)
      setIsReviewRescheduleOpen(true)
      onReviewReschedule?.(session)
    },
    [onReviewReschedule]
  )

  const reviewReschedule = useCallback(
    async (
      sessionId: string,
      decision: "Approved" | "Rejected",
      notes?: string
    ) => {
      const requestId = sessions.find((session) => session.id === sessionId)
        ?.rescheduleRequest?.id
      if (!requestId)
        throw new Error(
          "Refresh the interview list before reviewing this request."
        )
      await reviewRescheduleMutation({
        id: requestId,
        body: { decision, reviewNotes: notes?.trim() || undefined },
        batchId: recruitment.id,
      }).unwrap()
      setIsFilterPendingReschedule(false)
    },
    [sessions, recruitment.id, reviewRescheduleMutation]
  )

  const handleApproveReschedule = useCallback(
    async (
      sessionId: string,
      _proposedStart: string,
      _proposedEnd: string,
      notes?: string
    ) => {
      await reviewReschedule(sessionId, "Approved", notes)
    },
    [reviewReschedule]
  )

  const handleRejectReschedule = useCallback(
    async (sessionId: string, notes: string) => {
      await reviewReschedule(sessionId, "Rejected", notes)
    },
    [reviewReschedule]
  )

  const handleSelectDate = useCallback((date: string | null) => {
    setSelectedDate(date)
    setIsFilterPendingReschedule(false)
  }, [])

  const handleTogglePendingReschedule = useCallback(() => {
    setIsFilterPendingReschedule((prev) => !prev)
    setSelectedDate(null)
  }, [])

  const handleClearDateFilter = useCallback(() => {
    setSelectedDate(null)
    setIsFilterPendingReschedule(false)
  }, [])

  return {
    canScheduleInterview,
    scheduleRestriction,
    sessions,
    filteredSessions,
    pendingReschedules,
    isRealBatch,
    isLoading: isRealBatch && (isApiLoading || (isApiFetching && !apiSessions)),
    isFetching: isRealBatch && isApiFetching,
    isError: isRealBatch && isApiError,
    apiError,
    refetch,

    // Filter states & options
    search,
    setSearch,
    stageFilter,
    setStageFilter,
    stageFilterItems,
    statusFilter,
    setStatusFilter,
    statusFilterItems,
    modeFilter,
    setModeFilter,
    modeFilterItems,
    selectedDate,
    isFilterPendingReschedule,

    // Dialog states
    isScheduleOpen,
    setIsScheduleOpen,
    sessionToReschedule,
    setSessionToReschedule,
    rescheduleSessionToReview,
    isReviewRescheduleOpen,
    setIsReviewRescheduleOpen,

    // Action handlers
    handleSelectDate,
    handleTogglePendingReschedule,
    handleClearDateFilter,
    handleOpenScheduleNew,
    handleOpenAdjustSchedule,
    handleSaveSession,
    handleOpenReviewReschedule,
    handleApproveReschedule,
    handleRejectReschedule,
  }
}
