import { useState, useId, useMemo, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  DatePicker,
  TimePicker,
  CancelButton,
  SaveButton,
  SearchCombobox,
  type SearchComboboxOption,
} from "@/shared/components"
import { addMinutesToTime, isTimeBefore } from "@/shared/lib/timeUtils"
import type {
  Recruitment,
  InterviewSessionItem,
  ScheduleInterviewSessionRequest,
} from "../../types"
import { Video, MapPin, Check, User, AlertTriangle } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getApiError } from "@/shared/api/api-error"
import { getRecruitmentAddRestriction } from "../../utils/recruitmentUtils"
import {
  useLazyGetBatchApplicationsQuery,
  useGetApplicationByIdQuery,
} from "../../api/applications-api"
import { useGetAvailableInterviewersQuery } from "../../api/interviews-api"
import { mapApplicationStatus } from "../../utils/statusAdapters"
import { mapApplicationStageStatus } from "../../utils/statusAdapters"

export interface ScheduleInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recruitment: Recruitment
  onSchedule: (input: {
    applicationId: string
    applicationStageId: string
    body: ScheduleInterviewSessionRequest
  }) => void | Promise<void>
  isScheduling?: boolean
  existingSessions?: InterviewSessionItem[]
  sessionToReschedule?: InterviewSessionItem | null
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  recruitment,
  onSchedule,
  isScheduling = false,
  existingSessions = [],
  sessionToReschedule = null,
}: ScheduleInterviewDialogProps) {
  const formId = useId()
  const isRescheduleMode = Boolean(sessionToReschedule)
  const scheduleRestriction = isRescheduleMode
    ? null
    : getRecruitmentAddRestriction(recruitment, "interview")

  // Interview stage options
  const [candidateId, setCandidateId] = useState("")
  const [applicationStageId, setApplicationStageId] = useState("")
  const [loadApplications, { isFetching: isApplicationsLoading }] =
    useLazyGetBatchApplicationsQuery()
  const [allApplications, setAllApplications] = useState<
    import("../../types/application").BatchApplicationListItemDto[]
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
  const selectedStage = eligibleStages.find(
    (stage) => stage.applicationStageId === applicationStageId
  )
  const eligibleStageOptions = useMemo(
    () => eligibleStages.flatMap((stage) => stage.applicationStageId
      ? [{ label: stage.stageName, value: stage.applicationStageId }]
      : []),
    [eligibleStages]
  )
  const {
    currentData: availableInterviewers,
    isFetching: isInterviewersLoading,
    isError: isInterviewersError,
    error: interviewersError,
    refetch: refetchInterviewers,
  } = useGetAvailableInterviewersQuery(applicationStageId, {
    skip: !open || !applicationStageId || isRescheduleMode,
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
      while (hasNextPage) {
        const result = await loadApplications({
          id: recruitment.id,
          page,
          pageSize: 100,
        }).unwrap()
        collected.push(...result.items)
        hasNextPage = result.hasNextPage
        page += 1
      }
      if (!cancelled) setAllApplications(collected)
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
    setSessionName("")
    setScheduledDate("")
    setMeetingUrl("")
    setLocation("")
    setErrors({})
  }, [open])

  const selectedCandidate = useMemo(
    () => selectedApplication?.candidate
      ? {
          id: selectedApplication.id,
          name: selectedApplication.candidate.fullName,
          email: selectedApplication.candidate.email,
          codeApplication: selectedApplication.codeApplication,
        }
      : undefined,
    [selectedApplication]
  )

  useEffect(() => {
    setApplicationStageId("")
    setSelectedInterviewerIds([])
  }, [candidateId])
  useEffect(() => {
    setSelectedInterviewerIds([])
  }, [applicationStageId])
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
    setSelectedInterviewerIds((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId]
    )
    if (errors.interviewers)
      setErrors((prev) => ({ ...prev, interviewers: "" }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (scheduleRestriction) errs.recruitment = scheduleRestriction
    if (!selectedCandidate) errs.candidateId = "Candidate is required."
    if (!selectedStage) {
      errs.stageId = "Select a started interview stage for this candidate."
    }
    if (selectedStage && existingSessions.some((session) =>
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
    const availableIds = new Set((availableInterviewers ?? []).map((item) => item.employeeId))
    if (selectedInterviewerIds.some((id) => !availableIds.has(id)))
      errs.interviewers = "Refresh the interviewer list before scheduling."
    if (isInterviewersError) errs.interviewers = "Unable to load eligible interviewers. Retry the request."

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const candidateInfo = selectedCandidate
    if (!candidateInfo || !selectedStage?.applicationStageId) return
    const request: ScheduleInterviewSessionRequest = {
      sessionName: sessionName.trim(),
      scheduledStart: new Date(`${scheduledDate}T${startTime}:00`).toISOString(),
      scheduledEnd: new Date(`${scheduledDate}T${endTime}:00`).toISOString(),
      isOnline: mode === "online",
      location: mode === "onsite" ? location.trim() : null,
      meetingUrl: mode === "online" ? meetingUrl.trim() : null,
      interviewerEmployeeIds: selectedInterviewerIds,
    }

    try {
      await onSchedule({
        applicationId: candidateInfo.id,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>
              {isRescheduleMode
                ? "Adjust Interview Schedule"
                : "Schedule Interview"}
            </DialogTitle>
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
              {recruitment.batchCode}
            </span>
          </div>
          <DialogDescription>
            {isRescheduleMode
              ? "Review and adjust schedule timing, location, or interviewer panel for this session."
              : "Configure session details, date, mode, and assigned interviewers for this batch."}
          </DialogDescription>
        </DialogHeader>

        {scheduleRestriction && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400"
          >
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            <p>{scheduleRestriction}</p>
          </div>
        )}

        {errors.recruitment && !scheduleRestriction && (
          <p
            role="alert"
            className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {errors.recruitment}
          </p>
        )}

        {/* Reschedule Context Banner */}
        {isRescheduleMode && sessionToReschedule?.rescheduleRequest && (
          <div className="text-amber-95 space-y-1 rounded-xl border border-none bg-amber-50/80 p-3 text-xs dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-3.5" />
              <span>Reschedule Request Context</span>
            </div>
            <p className="text-muted-foreground">
              Candidate proposed:{" "}
              <span className="font-medium text-foreground">
                {sessionToReschedule.rescheduleRequest.proposedStart.slice(
                  0,
                  10
                )}{" "}
                (
                {sessionToReschedule.rescheduleRequest.proposedStart.slice(
                  11,
                  16
                )}{" "}
                -{" "}
                {sessionToReschedule.rescheduleRequest.proposedEnd.slice(
                  11,
                  16
                )}
                )
              </span>
            </p>
            {sessionToReschedule.rescheduleRequest.reason && (
              <p className="text-muted-foreground">
                Reason:{" "}
                <span className="text-foreground italic">
                  "{sessionToReschedule.rescheduleRequest.reason}"
                </span>
              </p>
            )}
          </div>
        )}

        <form id={formId} onSubmit={handleSubmit} className="py-2">
          {/* 2-Column Split Layout */}
          <div className="flex flex-col items-stretch gap-6 md:flex-row">
            {/* Column 1: Candidate, Stage, Title, & Schedule */}
            <div className="flex-1 space-y-3.5">
              {/* Candidate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label
                    htmlFor="interview-candidate"
                    className="text-sm font-medium"
                  >
                    Candidate <span className="text-destructive">*</span>
                  </Label>
                </div>
                <SearchCombobox
                  id="interview-candidate"
                  options={candidateComboboxOptions}
                  placeholder={
                    selectedCandidate
                      ? `${selectedCandidate.name} (${selectedCandidate.codeApplication})`
                      : isApplicationsLoading
                        ? "Loading candidates..."
                        : unscheduledCandidates.length === 0
                        ? "No unscheduled candidates"
                        : "Search candidate..."
                  }
                  searchPlaceholder="Search candidate by name, email, or code..."
                  emptyText="No unscheduled candidates for this stage"
                  disabled={
                    isRescheduleMode || isApplicationsLoading || unscheduledCandidates.length === 0
                  }
                  selectedIds={candidateId ? [candidateId] : []}
                  onSelect={(opt) => {
                    setCandidateId(opt.id)
                    if (errors.candidateId)
                      setErrors((prev) => ({ ...prev, candidateId: "" }))
                  }}
                  className={cn(
                    errors.candidateId && "ring-2 ring-destructive"
                  )}
                />
                {errors.candidateId && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.candidateId}
                  </p>
                )}
              </div>

              {/* Stage */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="interview-stage"
                  className="px-1 text-sm font-medium"
                >
                  Interview Stage <span className="text-destructive">*</span>
                </Label>
                <Select
                  items={eligibleStageOptions}
                  value={applicationStageId}
                  disabled={isRescheduleMode || isApplicationLoading || eligibleStages.length === 0}
                  onValueChange={(val) => {
                    if (val) {
                      setApplicationStageId(val)
                      if (errors.stageId)
                        setErrors((prev) => ({ ...prev, stageId: "" }))
                    }
                  }}
                >
                  <SelectTrigger
                    id="interview-stage"
                    disabled={isRescheduleMode || isApplicationLoading || eligibleStages.length === 0}
                    aria-invalid={!!errors.stageId}
                    className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm text-foreground shadow-none transition-all duration-150 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectGroup>
                      {eligibleStages.map((stage) => (
                        <SelectItem key={stage.applicationStageId!} value={stage.applicationStageId!}>
                          {stage.stageName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.stageId && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.stageId}
                  </p>
                )}
              </div>

              {/* Session Title */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="interview-session-title"
                  className="px-1 text-sm font-medium"
                >
                  Session Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="interview-session-title"
                  placeholder="e.g. Technical Interview - Andi Saputra"
                  value={sessionName}
                  onChange={(e) => {
                    setSessionName(e.target.value)
                    if (errors.sessionName)
                      setErrors((prev) => ({ ...prev, sessionName: "" }))
                  }}
                  aria-invalid={!!errors.sessionName}
                  className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground shadow-none transition-all duration-150 outline-none placeholder:text-muted-foreground focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.sessionName && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.sessionName}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="interview-date"
                  className="px-1 text-sm font-medium"
                >
                  Date <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  id="interview-date"
                  value={scheduledDate}
                  onChange={(val) => {
                    setScheduledDate(val)
                    if (errors.scheduledDate)
                      setErrors((prev) => ({ ...prev, scheduledDate: "" }))
                  }}
                  aria-invalid={!!errors.scheduledDate}
                  placeholder="dd/mm/yyyy"
                />
                {errors.scheduledDate && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.scheduledDate}
                  </p>
                )}
              </div>

              {/* Time Slots: Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                {/* Start Time */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="interview-start-time"
                    className="px-1 text-sm font-medium"
                  >
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <TimePicker
                    id="interview-start-time"
                    value={startTime}
                    onChange={(val) => {
                      setStartTime(val)
                      if (errors.startTime)
                        setErrors((prev) => ({ ...prev, startTime: "" }))
                      // Auto adjust end time to +60 minutes if current endTime is before or equal
                      if (
                        val &&
                        (!endTime ||
                          isTimeBefore(endTime, val) ||
                          endTime === val)
                      ) {
                        setEndTime(addMinutesToTime(val, 60))
                        if (errors.endTime)
                          setErrors((prev) => ({ ...prev, endTime: "" }))
                      }
                    }}
                    aria-invalid={!!errors.startTime}
                    placeholder="10:00"
                  />
                  {errors.startTime && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.startTime}
                    </p>
                  )}
                </div>

                {/* End Time */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="interview-end-time"
                    className="px-1 text-sm font-medium"
                  >
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <TimePicker
                    id="interview-end-time"
                    value={endTime}
                    minTime={startTime}
                    onChange={(val) => {
                      setEndTime(val)
                      if (errors.endTime)
                        setErrors((prev) => ({ ...prev, endTime: "" }))
                    }}
                    aria-invalid={!!errors.endTime}
                    placeholder="11:00"
                  />
                  {errors.endTime && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Separator */}
            <Separator
              orientation="vertical"
              className="hidden self-stretch md:block"
            />
            <Separator orientation="horizontal" className="my-1 md:hidden" />

            {/* Column 2: Interview Mode, Logistics & Panel Interviewers */}
            <div className="flex-1 space-y-3.5">
              {/* Mode Switcher: Online vs Onsite */}
              <div className="space-y-2">
                <Label className="px-1 text-sm font-medium">
                  Interview Mode
                </Label>
                <div className="grid h-11 w-full grid-cols-2 rounded-full bg-muted p-1 select-none">
                  <button
                    type="button"
                    onClick={() => setMode("online")}
                    className={cn(
                      "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-150",
                      mode === "online"
                        ? "bg-card font-semibold text-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Video className="size-4 text-cyan-600" />
                    <span>Online (Meeting Link)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("onsite")}
                    className={cn(
                      "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-150",
                      mode === "onsite"
                        ? "bg-card font-semibold text-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <MapPin className="size-4 text-indigo-600" />
                    <span>Onsite (Face-to-Face)</span>
                  </button>
                </div>

                {/* Online URL input */}
                {mode === "online" ? (
                  <div className="space-y-1.5 pt-1">
                    <Label
                      htmlFor="interview-url"
                      className="px-1 text-sm font-medium"
                    >
                      Meeting URL (Google Meet / Teams){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="interview-url"
                      placeholder="https://meet.google.com/..."
                      value={meetingUrl}
                      onChange={(e) => {
                        setMeetingUrl(e.target.value)
                        if (errors.meetingUrl)
                          setErrors((prev) => ({ ...prev, meetingUrl: "" }))
                      }}
                      aria-invalid={!!errors.meetingUrl}
                      className="h-10 rounded-full border-0 bg-muted px-4 font-mono text-sm text-foreground shadow-none transition-all duration-150 outline-none placeholder:text-muted-foreground focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    {errors.meetingUrl && (
                      <p className="px-1 text-xs text-destructive">
                        {errors.meetingUrl}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Onsite Location Input */
                  <div className="space-y-1.5 pt-1">
                    <Label
                      htmlFor="interview-location"
                      className="px-1 text-sm font-medium"
                    >
                      Room / Office Location{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="interview-location"
                      placeholder="e.g. APL Tower Lt. 37, Meeting Room 2"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value)
                        if (errors.location)
                          setErrors((prev) => ({ ...prev, location: "" }))
                      }}
                      aria-invalid={!!errors.location}
                      className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground shadow-none transition-all duration-150 outline-none placeholder:text-muted-foreground focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    {errors.location && (
                      <p className="px-1 text-xs text-destructive">
                        {errors.location}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Assign Panel Interviewers */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-sm font-medium">
                    Assign Interviewers{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedInterviewerIds.length} selected
                  </span>
                </div>
                <div className="grid max-h-55 grid-cols-1 gap-2 overflow-y-auto pr-1">
                  {(availableInterviewers ?? []).map((emp) => {
                    const isSelected = selectedInterviewerIds.includes(emp.employeeId)
                    return (
                      <button
                        key={emp.employeeId}
                        type="button"
                        onClick={() => handleToggleInterviewer(emp.employeeId)}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-2xl border p-2.5 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border/60 text-muted-foreground hover:bg-muted/40"
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                            <User className="size-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {emp.fullName}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {emp.jobTitle} · {emp.departmentName}
                            </p>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          )}
                        >
                          {isSelected && <Check className="size-2.5" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {isApplicationLoading && (
                  <p className="px-1 text-xs text-muted-foreground">Loading application stages...</p>
                )}
                {isApplicationError && (
                  <p role="alert" className="px-1 text-xs text-destructive">
                    {getApiError(applicationError, "Unable to load candidate stages.").message}
                  </p>
                )}
                {candidateId && !isApplicationLoading && eligibleStages.length === 0 && (
                  <p className="px-1 text-xs text-muted-foreground">No started interview stage is currently eligible for this candidate.</p>
                )}
                {isInterviewersLoading && (
                  <p className="px-1 text-xs text-muted-foreground">Loading accepted interviewers...</p>
                )}
                {isInterviewersError && (
                  <div className="flex items-center justify-between px-1 text-xs text-destructive">
                    <span>{getApiError(interviewersError, "Unable to load eligible interviewers.").message}</span>
                    <button type="button" className="font-semibold underline" onClick={() => void refetchInterviewers()}>
                      Retry
                    </button>
                  </div>
                )}
                {!isInterviewersLoading && applicationStageId && (availableInterviewers?.length ?? 0) === 0 && !isInterviewersError && (
                  <p className="px-1 text-xs text-muted-foreground">No accepted interviewers are available for this stage.</p>
                )}
                {errors.interviewers && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.interviewers}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="mt-4 gap-2 bg-white sm:gap-2">
          <CancelButton onClick={() => onOpenChange(false)} />
          <SaveButton
            type="submit"
            form={formId}
            disabled={Boolean(scheduleRestriction) || isScheduling || isInterviewersLoading}
          >
            {isRescheduleMode ? "Save & Reschedule" : "Schedule Interview"}
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
