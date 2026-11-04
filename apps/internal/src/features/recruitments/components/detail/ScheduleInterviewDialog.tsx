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
import { candidates } from "@/data/mock"
import { mockEmployees } from "../../data/mock"
import type { Recruitment, InterviewSessionItem, InterviewerAssignmentItem } from "../../types"
import { Video, MapPin, Check, User, AlertTriangle } from "lucide-react"
import { cn } from "@/shared/lib/utils"

export interface ScheduleInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recruitment: Recruitment
  onSchedule: (session: InterviewSessionItem) => void
  existingSessions?: InterviewSessionItem[]
  sessionToReschedule?: InterviewSessionItem | null
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  recruitment,
  onSchedule,
  existingSessions = [],
  sessionToReschedule = null,
}: ScheduleInterviewDialogProps) {
  const formId = useId()
  const isRescheduleMode = Boolean(sessionToReschedule)

  // Interview stage options
  const interviewStages = useMemo(() => {
    const stages = (recruitment.stages || []).filter(
      (stg) =>
        stg.type === "interview" ||
        stg.name.toLowerCase().includes("interview") ||
        stg.name.toLowerCase().includes("hr") ||
        stg.name.toLowerCase().includes("user")
    )
    if (stages.length > 0) return stages
    return [
      { id: "s3", name: "HR Interview" },
      { id: "s4", name: "User / Technical Interview" },
    ]
  }, [recruitment.stages])

  const stageOptions = useMemo(() => {
    return interviewStages.map((stg) => ({
      label: stg.name,
      value: stg.id,
    }))
  }, [interviewStages])

  // Form state
  const [stageId, setStageId] = useState<string>(stageOptions[0]?.value ?? "")

  // Candidates who have NOT yet been scheduled for this stage (Option 1)
  const unscheduledCandidates = useMemo(() => {
    const list = candidates.filter((c) => c.recruitmentId === recruitment.id)
    const baseList = list.length > 0 ? list : candidates.slice(0, 12)

    // IDs of candidates already scheduled for this specific stage (excluding cancelled)
    const scheduledIds = new Set(
      (existingSessions || [])
        .filter((s) => s.stageId === stageId && s.status !== "cancelled")
        .map((s) => s.candidateId)
    )

    return baseList
      .filter((c) => !scheduledIds.has(c.id))
      .map((c, idx) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        codeApplication: `APP-2026-${String(idx + 1).padStart(3, "0")}`,
      }))
  }, [recruitment.id, existingSessions, stageId])

  const candidateComboboxOptions = useMemo<SearchComboboxOption[]>(() => {
    if (isRescheduleMode && sessionToReschedule) {
      return [
        {
          id: sessionToReschedule.candidateId,
          label: sessionToReschedule.candidateName,
          subLabel: sessionToReschedule.candidateEmail,
          meta: sessionToReschedule.codeApplication,
        },
      ]
    }
    return unscheduledCandidates.map((c) => ({
      id: c.id,
      label: c.name,
      subLabel: c.email,
      meta: c.codeApplication,
    }))
  }, [isRescheduleMode, sessionToReschedule, unscheduledCandidates])

  const [candidateId, setCandidateId] = useState<string>("")
  const [sessionName, setSessionName] = useState<string>("")
  const [scheduledDate, setScheduledDate] = useState<string>("2026-03-11")
  const [startTime, setStartTime] = useState<string>("10:00")
  const [endTime, setEndTime] = useState<string>("11:00")
  const [mode, setMode] = useState<"online" | "onsite">("online")
  const [meetingUrl, setMeetingUrl] = useState<string>(
    "https://meet.google.com/rec-interview-session"
  )
  const [location, setLocation] = useState<string>(
    "APL Tower Lt. 37, Meeting Room 1"
  )
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>([
    mockEmployees[0]?.id ?? "",
  ])

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Keep candidateId pointing to a valid unscheduled candidate (only in create mode)
  useEffect(() => {
    if (isRescheduleMode && sessionToReschedule) {
      setCandidateId(sessionToReschedule.candidateId)
      setStageId(sessionToReschedule.stageId)
      setSessionName(sessionToReschedule.sessionName)

      const req = sessionToReschedule.rescheduleRequest
      if (req && req.proposedStart) {
        setScheduledDate(req.proposedStart.slice(0, 10))
        setStartTime(req.proposedStart.slice(11, 16))
        setEndTime(req.proposedEnd.slice(11, 16))
      } else {
        setScheduledDate(sessionToReschedule.scheduledStart.slice(0, 10))
        setStartTime(sessionToReschedule.scheduledStart.slice(11, 16))
        setEndTime(sessionToReschedule.scheduledEnd.slice(11, 16))
      }

      setMode(sessionToReschedule.isOnline ? "online" : "onsite")
      if (sessionToReschedule.meetingUrl) setMeetingUrl(sessionToReschedule.meetingUrl)
      if (sessionToReschedule.location) setLocation(sessionToReschedule.location)
      setSelectedInterviewerIds(sessionToReschedule.interviewers.map((i) => i.employeeId))
      return
    }

    if (unscheduledCandidates.length > 0) {
      const isValid = unscheduledCandidates.some((c) => c.id === candidateId)
      if (!isValid) {
        setCandidateId(unscheduledCandidates[0].id)
      }
    } else {
      setCandidateId("")
    }
  }, [isRescheduleMode, sessionToReschedule, unscheduledCandidates, candidateId, open])

  const selectedCandidate = useMemo(() => {
    if (isRescheduleMode && sessionToReschedule) {
      return {
        id: sessionToReschedule.candidateId,
        name: sessionToReschedule.candidateName,
        email: sessionToReschedule.candidateEmail,
        codeApplication: sessionToReschedule.codeApplication,
      }
    }
    return unscheduledCandidates.find((c) => c.id === candidateId)
  }, [isRescheduleMode, sessionToReschedule, unscheduledCandidates, candidateId])

  // Auto-fill session name when candidate or stage changes
  useEffect(() => {
    if (isRescheduleMode) return
    const selectedStg = stageOptions.find((s) => s.value === stageId)
    if (selectedCandidate && selectedStg) {
      setSessionName(`${selectedStg.label} - ${selectedCandidate.name}`)
    }
  }, [isRescheduleMode, selectedCandidate, stageId, stageOptions])

  const handleToggleInterviewer = (empId: string) => {
    setSelectedInterviewerIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    )
    if (errors.interviewers) setErrors((prev) => ({ ...prev, interviewers: "" }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!selectedCandidate) errs.candidateId = "Candidate is required."
    if (!stageId) errs.stageId = "Interview stage is required."
    if (!sessionName.trim()) errs.sessionName = "Session title is required."
    if (!scheduledDate) errs.scheduledDate = "Date is required."
    if (!startTime) errs.startTime = "Start time is required."
    if (!endTime) errs.endTime = "End time is required."
    if (startTime && endTime && (isTimeBefore(endTime, startTime) || endTime === startTime)) {
      errs.endTime = "End time must be after start time."
    }
    if (mode === "online" && !meetingUrl.trim()) errs.meetingUrl = "Meeting URL is required."
    if (mode === "onsite" && !location.trim()) errs.location = "Location/Room is required."
    if (selectedInterviewerIds.length === 0)
      errs.interviewers = "Please assign at least one interviewer."

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const candidateInfo = selectedCandidate
    const selectedStg = stageOptions.find((s) => s.value === stageId)
    if (!candidateInfo || !selectedStg) return

    // All assigned interviewers will have status 'pending' in new schedule
    const interviewersList: InterviewerAssignmentItem[] = selectedInterviewerIds.map(
      (empId, idx) => {
        const emp = mockEmployees.find((e) => e.id === empId)
        return {
          id: `si-${Date.now()}-${idx}`,
          stageEmployeeId: `se-${empId}`,
          employeeId: empId,
          employeeName: emp?.fullName ?? "Interviewer",
          employeeEmail: emp?.email ?? "",
          role: emp?.jobTitle,
          status: "pending",
          assessment: null,
        }
      }
    )

    const newSession: InterviewSessionItem = {
      id: sessionToReschedule ? sessionToReschedule.id : `is-${Date.now()}`,
      applicationStageId: sessionToReschedule
        ? sessionToReschedule.applicationStageId
        : `as-${Date.now()}`,
      recruitmentBatchId: recruitment.id,
      stageId: selectedStg.value,
      stageName: selectedStg.label,
      sessionName: sessionName.trim(),
      scheduledStart: `${scheduledDate}T${startTime}:00`,
      scheduledEnd: `${scheduledDate}T${endTime}:00`,
      isOnline: mode === "online",
      meetingUrl: mode === "online" ? meetingUrl.trim() : null,
      location: mode === "onsite" ? location.trim() : null,
      status: "scheduled",
      fileSubmission: sessionToReschedule ? sessionToReschedule.fileSubmission : null,
      endedSubmissionAt: sessionToReschedule ? sessionToReschedule.endedSubmissionAt : null,
      candidateId: candidateInfo.id,
      candidateName: candidateInfo.name,
      candidateEmail: candidateInfo.email,
      codeApplication: candidateInfo.codeApplication,
      interviewers: interviewersList,
      rescheduleRequest: sessionToReschedule?.rescheduleRequest
        ? {
            ...sessionToReschedule.rescheduleRequest,
            status: "approved",
          }
        : null,
    }

    onSchedule(newSession)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>
              {isRescheduleMode ? "Adjust Interview Schedule" : "Schedule Interview"}
            </DialogTitle>
            <span className="font-mono text-xs font-semibold rounded-md bg-muted px-2 py-0.5 text-foreground">
              {recruitment.batchCode}
            </span>
          </div>
          <DialogDescription>
            {isRescheduleMode
              ? "Review and adjust schedule timing, location, or interviewer panel for this session."
              : "Configure session details, date, mode, and assigned interviewers for this batch."}
          </DialogDescription>
        </DialogHeader>

        {/* Reschedule Context Banner */}
        {isRescheduleMode && sessionToReschedule?.rescheduleRequest && (
          <div className="rounded-xl border border-none bg-amber-50/80 p-3 text-xs text-amber-95 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-3.5" />
              <span>Reschedule Request Context</span>
            </div>
            <p className="text-muted-foreground">
              Candidate proposed:{" "}
              <span className="font-medium text-foreground">
                {sessionToReschedule.rescheduleRequest.proposedStart.slice(0, 10)} (
                {sessionToReschedule.rescheduleRequest.proposedStart.slice(11, 16)} -{" "}
                {sessionToReschedule.rescheduleRequest.proposedEnd.slice(11, 16)})
              </span>
            </p>
            {sessionToReschedule.rescheduleRequest.reason && (
              <p className="text-muted-foreground">
                Reason:{" "}
                <span className="italic text-foreground">
                  "{sessionToReschedule.rescheduleRequest.reason}"
                </span>
              </p>
            )}
          </div>
        )}

        <form id={formId} onSubmit={handleSubmit} className="py-2">
          {/* 2-Column Split Layout */}
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* Column 1: Candidate, Stage, Title, & Schedule */}
            <div className="flex-1 space-y-3.5">
              {/* Candidate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="interview-candidate" className="text-sm font-medium">
                    Candidate <span className="text-destructive">*</span>
                  </Label>
                </div>
                <SearchCombobox
                  id="interview-candidate"
                  options={candidateComboboxOptions}
                  placeholder={
                    selectedCandidate
                      ? `${selectedCandidate.name} (${selectedCandidate.codeApplication})`
                      : unscheduledCandidates.length === 0
                        ? "No unscheduled candidates"
                        : "Search candidate..."
                  }
                  searchPlaceholder="Search candidate by name, email, or code..."
                  emptyText="No unscheduled candidates for this stage"
                  disabled={isRescheduleMode || unscheduledCandidates.length === 0}
                  selectedIds={candidateId ? [candidateId] : []}
                  onSelect={(opt) => {
                    setCandidateId(opt.id)
                    if (errors.candidateId) setErrors((prev) => ({ ...prev, candidateId: "" }))
                  }}
                  className={cn(errors.candidateId && "ring-2 ring-destructive")}
                />
                {errors.candidateId && (
                  <p className="text-xs text-destructive px-1">{errors.candidateId}</p>
                )}
              </div>

              {/* Stage */}
              <div className="space-y-1.5">
                <Label htmlFor="interview-stage" className="text-sm font-medium px-1">
                  Interview Stage <span className="text-destructive">*</span>
                </Label>
                <Select
                  items={stageOptions}
                  value={stageId}
                  disabled={isRescheduleMode}
                  onValueChange={(val) => {
                    if (val) {
                      setStageId(val)
                      if (errors.stageId) setErrors((prev) => ({ ...prev, stageId: "" }))
                    }
                  }}
                >
                  <SelectTrigger
                    id="interview-stage"
                    disabled={isRescheduleMode}
                    aria-invalid={!!errors.stageId}
                    className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/60 outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectGroup>
                      {stageOptions.map((stg) => (
                        <SelectItem key={stg.value} value={stg.value}>
                          {stg.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.stageId && (
                  <p className="text-xs text-destructive px-1">{errors.stageId}</p>
                )}
              </div>

              {/* Session Title */}
              <div className="space-y-1.5">
                <Label htmlFor="interview-session-title" className="text-sm font-medium px-1">
                  Session Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="interview-session-title"
                  placeholder="e.g. Technical Interview - Andi Saputra"
                  value={sessionName}
                  onChange={(e) => {
                    setSessionName(e.target.value)
                    if (errors.sessionName) setErrors((prev) => ({ ...prev, sessionName: "" }))
                  }}
                  aria-invalid={!!errors.sessionName}
                  className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                />
                {errors.sessionName && (
                  <p className="text-xs text-destructive px-1">{errors.sessionName}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="interview-date" className="text-sm font-medium px-1">
                  Date <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  id="interview-date"
                  value={scheduledDate}
                  onChange={(val) => {
                    setScheduledDate(val)
                    if (errors.scheduledDate) setErrors((prev) => ({ ...prev, scheduledDate: "" }))
                  }}
                  aria-invalid={!!errors.scheduledDate}
                  placeholder="dd/mm/yyyy"
                />
                {errors.scheduledDate && (
                  <p className="text-xs text-destructive px-1">{errors.scheduledDate}</p>
                )}
              </div>

              {/* Time Slots: Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                {/* Start Time */}
                <div className="space-y-1.5">
                  <Label htmlFor="interview-start-time" className="text-sm font-medium px-1">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <TimePicker
                    id="interview-start-time"
                    value={startTime}
                    onChange={(val) => {
                      setStartTime(val)
                      if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: "" }))
                      // Auto adjust end time to +60 minutes if current endTime is before or equal
                      if (val && (!endTime || isTimeBefore(endTime, val) || endTime === val)) {
                        setEndTime(addMinutesToTime(val, 60))
                        if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: "" }))
                      }
                    }}
                    aria-invalid={!!errors.startTime}
                    placeholder="10:00"
                  />
                  {errors.startTime && (
                    <p className="text-xs text-destructive px-1">{errors.startTime}</p>
                  )}
                </div>

                {/* End Time */}
                <div className="space-y-1.5">
                  <Label htmlFor="interview-end-time" className="text-sm font-medium px-1">
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <TimePicker
                    id="interview-end-time"
                    value={endTime}
                    minTime={startTime}
                    onChange={(val) => {
                      setEndTime(val)
                      if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: "" }))
                    }}
                    aria-invalid={!!errors.endTime}
                    placeholder="11:00"
                  />
                  {errors.endTime && (
                    <p className="text-xs text-destructive px-1">{errors.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Separator */}
            <Separator orientation="vertical" className="hidden md:block self-stretch" />
            <Separator orientation="horizontal" className="md:hidden my-1" />

            {/* Column 2: Interview Mode, Logistics & Panel Interviewers */}
            <div className="flex-1 space-y-3.5">
              {/* Mode Switcher: Online vs Onsite */}
              <div className="space-y-2">
                <Label className="text-sm font-medium px-1">Interview Mode</Label>
                <div className="grid grid-cols-2 p-1 bg-muted rounded-full w-full h-11 select-none">
                  <button
                    type="button"
                    onClick={() => setMode("online")}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 h-9 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer",
                      mode === "online"
                        ? "bg-card text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Video className="size-4 text-cyan-600" />
                    <span>Online (Meeting Link)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("onsite")}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 h-9 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer",
                      mode === "onsite"
                        ? "bg-card text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <MapPin className="size-4 text-indigo-600" />
                    <span>Onsite (Face-to-Face)</span>
                  </button>
                </div>

                {/* Online URL input */}
                {mode === "online" ? (
                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="interview-url" className="text-sm font-medium px-1">
                      Meeting URL (Google Meet / Teams) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="interview-url"
                      placeholder="https://meet.google.com/..."
                      value={meetingUrl}
                      onChange={(e) => {
                        setMeetingUrl(e.target.value)
                        if (errors.meetingUrl) setErrors((prev) => ({ ...prev, meetingUrl: "" }))
                      }}
                      aria-invalid={!!errors.meetingUrl}
                      className="h-10 rounded-full border-0 bg-muted px-4 text-sm font-mono text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                    />
                    {errors.meetingUrl && (
                      <p className="text-xs text-destructive px-1">{errors.meetingUrl}</p>
                    )}
                  </div>
                ) : (
                  /* Onsite Location Input */
                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="interview-location" className="text-sm font-medium px-1">
                      Room / Office Location <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="interview-location"
                      placeholder="e.g. APL Tower Lt. 37, Meeting Room 2"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value)
                        if (errors.location) setErrors((prev) => ({ ...prev, location: "" }))
                      }}
                      aria-invalid={!!errors.location}
                      className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                    />
                    {errors.location && (
                      <p className="text-xs text-destructive px-1">{errors.location}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Assign Panel Interviewers */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-sm font-medium">
                    Assign Interviewers <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedInterviewerIds.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-55 overflow-y-auto pr-1">
                  {mockEmployees.map((emp) => {
                    const isSelected = selectedInterviewerIds.includes(emp.id)
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleToggleInterviewer(emp.id)}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer text-left",
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                            <User className="size-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-foreground truncate">
                              {emp.fullName}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {emp.jobTitle}
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
                {errors.interviewers && (
                  <p className="text-xs text-destructive px-1">{errors.interviewers}</p>
                )}
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="mt-4 gap-2 sm:gap-2 bg-white">
          <CancelButton onClick={() => onOpenChange(false)} />
          <SaveButton type="submit" form={formId}>
            {isRescheduleMode ? "Save & Reschedule" : "Schedule Interview"}
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
