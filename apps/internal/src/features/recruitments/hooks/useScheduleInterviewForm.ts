import { useState, useMemo, useEffect, type FormEvent } from "react"
import type { SearchComboboxOption } from "@/shared/components"
import { addMinutesToTime, isTimeBefore } from "@/shared/lib/timeUtils"
import { formatWibTime, getWibDateKey, wibToUtcISOString } from "@/shared/lib/utcDateTime"
import { getApiError } from "@/shared/api/api-error"
import type { Recruitment, InterviewSessionItem, ScheduleInterviewSessionRequest } from "../types"
import type { BatchApplicationListItemDto } from "../types/application"
import { getRecruitmentAddRestriction } from "../utils/recruitmentUtils"
import { mapApplicationStatus, mapApplicationStageStatus } from "../utils/statusAdapters"
import { useLazyGetBatchApplicationsQuery, useGetApplicationByIdQuery } from "../api/applications-api"
import { useGetAvailableInterviewersQuery } from "../api/interviews-api"

export interface ScheduleInterviewFormOptions {
  open: boolean
  onOpenChange: (open: boolean) => void
  recruitment: Recruitment
  onSchedule: (input: {
    applicationId?: string
    applicationStageId: string
    body: ScheduleInterviewSessionRequest
  }) => void | Promise<void>
  existingSessions?: InterviewSessionItem[]
  sessionToReschedule?: InterviewSessionItem | null
}

export function useScheduleInterviewForm({
  open,
  onOpenChange,
  recruitment,
  onSchedule,
  existingSessions = [],
  sessionToReschedule = null,
}: ScheduleInterviewFormOptions) {
  const isRescheduleMode = Boolean(sessionToReschedule)
  const scheduleRestriction = getRecruitmentAddRestriction(recruitment, "interview")
  const minScheduleDate = getWibDateKey(new Date())

  // Interview stage options
  const [candidateId, setCandidateId] = useState("")
  const [applicationStageId, setApplicationStageId] = useState("")
  const [loadApplications, { isFetching: isApplicationsLoading }] =
    useLazyGetBatchApplicationsQuery()
  const [allApplications, setAllApplications] = useState<
    BatchApplicationListItemDto[]
  >([])
  const applications = allApplications
  const selectedApplication = applications.find((item) => item.id === candidateId)
  const {
    currentData: applicationDetail,
    isFetching: isApplicationLoading,
    isError: isApplicationError,
    error: applicationError,
  } = useGetApplicationByIdQuery(candidateId, {
      skip: !open || !candidateId || isRescheduleMode,
    })
  const eligibleStages = useMemo(
    () =>
      (applicationDetail?.stages ?? []).filter(
        (stage) =>
          String(stage.stageCategory).toLowerCase() === "interview" ||
          String(stage.stageCategory) === "2"
      ).filter(
        (stage) => stage.applicationStageId &&
          stage.isStarted &&
          mapApplicationStageStatus(stage.status) === "in_progress"
      ),
    [applicationDetail]
  )
  const eligibleStageOptions = useMemo(
    () => {
      const options = eligibleStages.flatMap((stage) => stage.applicationStageId
        ? [{ label: stage.stageName, value: stage.applicationStageId }]
        : [])
      if (isRescheduleMode && sessionToReschedule?.applicationStageId &&
        !options.some((option) => option.value === sessionToReschedule.applicationStageId)) {
        options.push({ label: sessionToReschedule.stageName, value: sessionToReschedule.applicationStageId })
      }
      return options
    },
    [eligibleStages, isRescheduleMode, sessionToReschedule]
  )
  const selectedStage = useMemo(
    () => isRescheduleMode && sessionToReschedule
      ? { applicationStageId: sessionToReschedule.applicationStageId, stageName: sessionToReschedule.stageName }
      : eligibleStages.find((stage) => stage.applicationStageId === applicationStageId),
    [isRescheduleMode, sessionToReschedule, eligibleStages, applicationStageId]
  )
  const {
    currentData: availableInterviewers,
    isFetching: isInterviewersLoading,
    isError: isInterviewersError,
    error: interviewersError,
    refetch: refetchInterviewers,
  } = useGetAvailableInterviewersQuery(applicationStageId, {
    skip: !open || !applicationStageId,
  })
  const unscheduledCandidates = useMemo(
    () => applications.filter((item) => mapApplicationStatus(item.status) === "in_progress"),
    [applications]
  )
  const candidateComboboxOptions = useMemo<SearchComboboxOption[]>(
    () => unscheduledCandidates.map((item) => ({
      id: item.id,
      label: item.candidate?.fullName ?? "Candidate",
      subLabel: item.candidate?.email ?? "",
      meta: item.codeApplication,
    })),
    [unscheduledCandidates]
  )
  const [sessionName, setSessionName] = useState<string>("")
  const [scheduledDate, setScheduledDate] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("10:00")
  const [endTime, setEndTime] = useState<string>("11:00")
  const [mode, setMode] = useState<"online" | "onsite">("online")
  const [meetingUrl, setMeetingUrl] = useState("")
  const [location, setLocation] = useState("")
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>([])
  const [leadEmployeeId, setLeadEmployeeId] = useState("")

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load every application page so candidates are not silently limited to page one.
  useEffect(() => {
    if (!open || isRescheduleMode) return
    let cancelled = false
    const loadRemainingPages = async () => {
      const collected: typeof allApplications = []
      let page = 1
      let hasNextPage = true
      while (hasNextPage && !cancelled) {
        const result = await loadApplications({
          id: recruitment.id,
          page,
          pageSize: 100,
        }, true).unwrap()
        if (cancelled) return
        collected.push(...result.items)
        setAllApplications([...collected])
        hasNextPage = result.hasNextPage
        page += 1
      }
    }
    setAllApplications([])
    void loadRemainingPages().catch((error) => {
      if (!cancelled) setErrors((previous) => ({
        ...previous,
        recruitment: getApiError(error).message,
      }))
    })
    return () => { cancelled = true }
  }, [open, isRescheduleMode, recruitment.id, loadApplications])

  useEffect(() => {
    if (open) return
    setCandidateId("")
    setApplicationStageId("")
    setSelectedInterviewerIds([])
    setLeadEmployeeId("")
    setSessionName("")
    setScheduledDate("")
    setMeetingUrl("")
    setLocation("")
    setErrors({})
  }, [open])

  useEffect(() => {
    if (!open || !sessionToReschedule) return
    const proposedStart = sessionToReschedule.rescheduleRequest?.proposedStart
    const proposedEnd = sessionToReschedule.rescheduleRequest?.proposedEnd
    const start = proposedStart ?? sessionToReschedule.scheduledStart
    const end = proposedEnd ?? sessionToReschedule.scheduledEnd
    setCandidateId(sessionToReschedule.candidateId)
    setApplicationStageId(sessionToReschedule.applicationStageId ?? "")
    setSessionName(sessionToReschedule.sessionName)
    setScheduledDate(getWibDateKey(start))
    setStartTime(formatWibTime(start))
    setEndTime(formatWibTime(end))
    setMode(sessionToReschedule.isOnline ? "online" : "onsite")
    setMeetingUrl(sessionToReschedule.meetingUrl ?? "")
    setLocation(sessionToReschedule.location ?? "")
    setSelectedInterviewerIds(sessionToReschedule.interviewers
      .filter((interviewer) => interviewer.status !== "declined" && interviewer.status !== "cancelled")
      .map((interviewer) => interviewer.employeeId))
    setLeadEmployeeId(sessionToReschedule.interviewers.find((interviewer) =>
      interviewer.isLead && interviewer.status !== "declined" && interviewer.status !== "cancelled"
    )?.employeeId ?? "")
  }, [open, sessionToReschedule])

  const selectedCandidate = useMemo(
    () => isRescheduleMode && sessionToReschedule
      ? {
          id: sessionToReschedule.candidateId,
          name: sessionToReschedule.candidateName,
          email: sessionToReschedule.candidateEmail,
          codeApplication: sessionToReschedule.codeApplication,
        }
      : selectedApplication?.candidate
      ? {
          id: selectedApplication.id,
          name: selectedApplication.candidate.fullName,
          email: selectedApplication.candidate.email,
          codeApplication: selectedApplication.codeApplication,
        }
      : undefined,
    [selectedApplication, isRescheduleMode, sessionToReschedule]
  )

  useEffect(() => {
    if (isRescheduleMode) return
    setApplicationStageId("")
    setSelectedInterviewerIds([])
    setLeadEmployeeId("")
  }, [candidateId, isRescheduleMode])
  useEffect(() => {
    if (isRescheduleMode) return
    setSelectedInterviewerIds([])
    setLeadEmployeeId("")
  }, [applicationStageId, isRescheduleMode])
  useEffect(() => {
    if (!applicationStageId && eligibleStages.length === 1) {
      setApplicationStageId(eligibleStages[0].applicationStageId ?? "")
    }
  }, [applicationStageId, eligibleStages])

  // Auto-fill session name when candidate or stage changes
  useEffect(() => {
    if (isRescheduleMode) return
    if (selectedCandidate && selectedStage) {
      setSessionName(`${selectedStage.stageName} - ${selectedCandidate.name}`)
    }
  }, [isRescheduleMode, selectedCandidate, selectedStage])

  const handleToggleInterviewer = (empId: string) => {
    if (selectedInterviewerIds.includes(empId) && leadEmployeeId === empId)
      setLeadEmployeeId("")
    setSelectedInterviewerIds((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId]
    )
    if (errors.interviewers || errors.leadInterviewer)
      setErrors((prev) => ({ ...prev, interviewers: "", leadInterviewer: "" }))
  }

  const handleStartTimeChange = (value: string) => {
    setStartTime(value)
    if (errors.startTime)
      setErrors((previous) => ({ ...previous, startTime: "" }))
    if (value && (!endTime || isTimeBefore(endTime, value) || endTime === value)) {
      setEndTime(addMinutesToTime(value, 60))
      if (errors.endTime)
        setErrors((previous) => ({ ...previous, endTime: "" }))
    }
  }

  const handleSelectLead = (employeeId: string) => {
    setLeadEmployeeId(employeeId)
    if (errors.leadInterviewer)
      setErrors((previous) => ({ ...previous, leadInterviewer: "" }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (scheduleRestriction) errs.recruitment = scheduleRestriction
    if (!selectedCandidate) errs.candidateId = "Candidate is required."
    if (!selectedStage) {
      errs.stageId = "Select a started interview stage for this candidate."
    }
    if (!isRescheduleMode && selectedStage && existingSessions.some((session) =>
      session.applicationStageId === selectedStage.applicationStageId &&
      session.status !== "cancelled"
    )) errs.stageId = "An interview is already scheduled for this stage."
    if (!sessionName.trim()) errs.sessionName = "Session title is required."
    if (!scheduledDate) errs.scheduledDate = "Date is required."
    if (!startTime) errs.startTime = "Start time is required."
    if (!endTime) errs.endTime = "End time is required."
    if (
      startTime &&
      endTime &&
      (isTimeBefore(endTime, startTime) || endTime === startTime)
    ) {
      errs.endTime = "End time must be after start time."
    }
    if (scheduledDate && scheduledDate < minScheduleDate)
      errs.scheduledDate = "Date cannot be in the past."
    else if (scheduledDate && startTime && new Date(wibToUtcISOString(scheduledDate, startTime)) <= new Date())
      errs.scheduledDate = "Schedule must be in the future."
    if (sessionName.trim().length > 200)
      errs.sessionName = "Session title must be 200 characters or fewer."
    if (mode === "online") {
      try {
        const url = new URL(meetingUrl.trim())
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
      } catch {
        errs.meetingUrl = "Enter a valid absolute http or https meeting URL."
      }
    }
    if (mode === "onsite" && !location.trim())
      errs.location = "Location/Room is required."
    if (location.trim().length > 255)
      errs.location = "Location must be 255 characters or fewer."
    if (selectedInterviewerIds.length === 0)
      errs.interviewers = "Please assign at least one interviewer."
    else if (!leadEmployeeId || !selectedInterviewerIds.includes(leadEmployeeId))
      errs.leadInterviewer = "Select one lead interviewer from the assigned interviewers."
    const availableIds = new Set((availableInterviewers ?? []).map((item) => item.employeeId))
    if (selectedInterviewerIds.some((id) => !availableIds.has(id)))
      errs.interviewers = "Refresh the interviewer list before scheduling."
    if (isInterviewersError) errs.interviewers = "Unable to load eligible interviewers. Retry the request."

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const candidateInfo = selectedCandidate
    if (!candidateInfo || !selectedStage?.applicationStageId) return
    const request: ScheduleInterviewSessionRequest = {
      sessionName: sessionName.trim(),
      scheduledStart: wibToUtcISOString(scheduledDate, startTime),
      scheduledEnd: wibToUtcISOString(scheduledDate, endTime),
      isOnline: mode === "online",
      location: mode === "onsite" ? location.trim() : null,
      meetingUrl: mode === "online" ? meetingUrl.trim() : null,
      interviewerEmployeeIds: selectedInterviewerIds,
      leadEmployeeId,
    }

    try {
      await onSchedule({
        ...(isRescheduleMode ? {} : { applicationId: candidateInfo.id }),
        applicationStageId: selectedStage.applicationStageId,
        body: request,
      })
      onOpenChange(false)
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        recruitment: getApiError(error).message,
      }))
    }
  }

  return {
    isRescheduleMode, scheduleRestriction, minScheduleDate,
    candidateId, setCandidateId, applicationStageId, setApplicationStageId,
    isApplicationsLoading, isApplicationLoading, isApplicationError, applicationError,
    eligibleStages, eligibleStageOptions, selectedCandidate,
    availableInterviewers, isInterviewersLoading, isInterviewersError,
    interviewersError, refetchInterviewers, unscheduledCandidates, candidateComboboxOptions,
    sessionName, setSessionName, scheduledDate, setScheduledDate,
    startTime, endTime, setEndTime, mode, setMode,
    meetingUrl, setMeetingUrl, location, setLocation,
    selectedInterviewerIds, leadEmployeeId,
    errors, setErrors, handleToggleInterviewer, handleSelectLead,
    handleStartTimeChange, handleSubmit,
  }
}
