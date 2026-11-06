import { useState, useMemo, useEffect, useCallback } from "react"
import type {
  Recruitment,
  InterviewSessionItem,
  InterviewSessionStatus,
  BatchInterviewSessionDto,
} from "../types"
import { mockInterviewSessions, getRecruitmentInterviewSessions } from "../data/interviewMock"
import {
  useGetBatchInterviewSessionsQuery,
  useReviewRescheduleRequestMutation,
} from "../api/interviews-api"

export function mapBackendStatusToSessionStatus(
  status: number | string | undefined | null
): InterviewSessionStatus {
  if (status === null || status === undefined) return "scheduled"
  const s = String(status).toLowerCase()
  if (
    s === "1" ||
    s === "scheduled" ||
    s === "pendingconfirmation" ||
    s === "2" ||
    s === "acceptedbyinterviewer" ||
    s === "4" ||
    s === "acceptedbycandidate" ||
    s === "5"
  ) {
    return "scheduled"
  }
  if (s === "3" || s === "rescheduled") return "rescheduled"
  if (s === "completed") return "completed"
  if (s === "cancelled") return "cancelled"
  if (s === "in_progress" || s === "inprogress") return "in_progress"
  return "scheduled"
}

export function mapInterviewerStatus(
  status: number | string | undefined | null
): "assigned" | "accepted" | "declined" | "completed" | "pending" {
  if (status === null || status === undefined) return "pending"
  const s = String(status).toLowerCase()
  if (s === "2" || s === "accepted") return "accepted"
  if (s === "3" || s === "declined") return "declined"
  if (s === "completed") return "completed"
  if (s === "assigned") return "assigned"
  return "pending"
}

export function mapDtoToSessionItem(
  dto: BatchInterviewSessionDto,
  recruitmentBatchId: string
): InterviewSessionItem {
  return {
    id: dto.id,
    applicationStageId: dto.applicationStageId,
    recruitmentBatchId: dto.recruitmentBatchId || recruitmentBatchId,
    stageId: dto.batchStageId || "",
    stageName: dto.stageName,
    sessionName: dto.sessionName,
    scheduledStart: dto.scheduledStart,
    scheduledEnd: dto.scheduledEnd,
    isOnline: dto.isOnline,
    location: dto.location,
    meetingUrl: dto.meetingUrl,
    status: mapBackendStatusToSessionStatus(dto.status),
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
      status: mapInterviewerStatus(inv.status),
      assessment: null,
    })),
    rescheduleRequest:
      dto.hasPendingReschedule && dto.pendingRescheduleId
        ? {
            id: dto.pendingRescheduleId,
            interviewSessionId: dto.id,
            requesterEmail: dto.candidateEmail,
            proposedStart: dto.proposedStart || dto.scheduledStart,
            proposedEnd: dto.proposedEnd || dto.scheduledEnd,
            reason: dto.rescheduleReason || "Candidate requested reschedule",
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
  const isRealBatch = useMemo(
    () => IS_GUID_REGEX.test(recruitment.id),
    [recruitment.id]
  )

  // API query for batch interview sessions
  const {
    data: apiSessions,
    isLoading: isApiLoading,
    isFetching: isApiFetching,
    isError: isApiError,
    refetch,
  } = useGetBatchInterviewSessionsQuery(
    { batchId: recruitment.id },
    { skip: !isRealBatch }
  )

  const [reviewRescheduleMutation] = useReviewRescheduleRequestMutation()

  // Initial sessions computation
  const initialSessions = useMemo(() => {
    if (isRealBatch) {
      if (apiSessions) {
        return apiSessions.map((dto) => mapDtoToSessionItem(dto, recruitment.id))
      }
      return []
    }
    const list = getRecruitmentInterviewSessions(recruitment.id)
    return list.length > 0 ? list : mockInterviewSessions
  }, [isRealBatch, apiSessions, recruitment.id])

  const [sessions, setSessions] = useState<InterviewSessionItem[]>(initialSessions)

  // Keep state synchronized when API data or initialSessions change
  useEffect(() => {
    if (isRealBatch) {
      if (apiSessions) {
        setSessions(apiSessions.map((dto) => mapDtoToSessionItem(dto, recruitment.id)))
      }
    } else {
      setSessions(initialSessions)
    }
  }, [isRealBatch, apiSessions, initialSessions, recruitment.id])

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
    if (recruitment.batchStages && recruitment.batchStages.length > 0) {
      return recruitment.batchStages
        .filter((bs) => {
          const cat = (bs.stageCategory || "").toLowerCase()
          const name = (bs.stageName || "").toLowerCase()
          return (
            cat.includes("interview") ||
            name.includes("interview") ||
            name.includes("hr") ||
            name.includes("user")
          )
        })
        .map((bs) => ({ id: bs.id, name: bs.stageName }))
    }
    return (recruitment.stages || []).filter(
      (stg) =>
        stg.type === "interview" ||
        stg.name.toLowerCase().includes("interview") ||
        stg.name.toLowerCase().includes("hr") ||
        stg.name.toLowerCase().includes("user")
    )
  }, [recruitment.batchStages, recruitment.stages])

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
      { label: "Completed", value: "completed" },
      { label: "Rescheduled", value: "rescheduled" },
      { label: "Cancelled", value: "cancelled" },
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
    setSessionToReschedule(null)
    setIsScheduleOpen(true)
    onScheduleInterview?.()
  }, [onScheduleInterview])

  const handleOpenAdjustSchedule = useCallback((session: InterviewSessionItem) => {
    setSessionToReschedule(session)
    setIsScheduleOpen(true)
  }, [])

  const handleSaveSession = useCallback(
    (savedSession: InterviewSessionItem) => {
      if (sessionToReschedule) {
        setSessions((prev) =>
          prev.map((s) => (s.id === savedSession.id ? savedSession : s))
        )
        setSessionToReschedule(null)
      } else {
        setSessions((prev) => [savedSession, ...prev])
      }
      setSelectedDate(savedSession.scheduledStart.slice(0, 10))
      setIsFilterPendingReschedule(false)
    },
    [sessionToReschedule]
  )

  const handleOpenReviewReschedule = useCallback(
    (session: InterviewSessionItem) => {
      setRescheduleSessionToReview(session)
      setIsReviewRescheduleOpen(true)
      onReviewReschedule?.(session)
    },
    [onReviewReschedule]
  )

  const handleApproveReschedule = useCallback(
    async (
      sessionId: string,
      proposedStart: string,
      proposedEnd: string,
      notes?: string
    ) => {
      const target = sessions.find((s) => s.id === sessionId)
      const requestId = target?.rescheduleRequest?.id

      // Optimistic update
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          return {
            ...s,
            scheduledStart: proposedStart,
            scheduledEnd: proposedEnd,
            status: "rescheduled",
            rescheduleRequest: s.rescheduleRequest
              ? {
                  ...s.rescheduleRequest,
                  status: "approved",
                  reviewedAt: new Date().toISOString(),
                  reviewNotes: notes || null,
                }
              : null,
          }
        })
      )
      setSelectedDate(proposedStart.slice(0, 10))
      setIsFilterPendingReschedule(false)

      if (isRealBatch && requestId) {
        try {
          await reviewRescheduleMutation({
            id: requestId,
            body: {
              decision: 1, // Approve
              reviewNotes: notes || undefined,
            },
            batchId: recruitment.id,
          }).unwrap()
          refetch()
        } catch (err) {
          console.error("Failed to approve reschedule request on server:", err)
        }
      }
    },
    [sessions, isRealBatch, recruitment.id, reviewRescheduleMutation, refetch]
  )

  const handleRejectReschedule = useCallback(
    async (sessionId: string, notes: string) => {
      const target = sessions.find((s) => s.id === sessionId)
      const requestId = target?.rescheduleRequest?.id

      // Optimistic update
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          return {
            ...s,
            rescheduleRequest: s.rescheduleRequest
              ? {
                  ...s.rescheduleRequest,
                  status: "rejected",
                  reviewedAt: new Date().toISOString(),
                  reviewNotes: notes,
                }
              : null,
          }
        })
      )
      setIsFilterPendingReschedule(false)

      if (isRealBatch && requestId) {
        try {
          await reviewRescheduleMutation({
            id: requestId,
            body: {
              decision: 2, // Reject
              reviewNotes: notes,
            },
            batchId: recruitment.id,
          }).unwrap()
          refetch()
        } catch (err) {
          console.error("Failed to reject reschedule request on server:", err)
        }
      }
    },
    [sessions, isRealBatch, recruitment.id, reviewRescheduleMutation, refetch]
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
    sessions,
    filteredSessions,
    pendingReschedules,
    isRealBatch,
    isLoading: isRealBatch && isApiLoading,
    isFetching: isRealBatch && isApiFetching,
    isError: isRealBatch && isApiError,
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
