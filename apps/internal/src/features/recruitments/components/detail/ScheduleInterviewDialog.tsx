import { useId } from "react"
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
  CancelButton,
  SaveButton,
  SearchCombobox,
} from "@/shared/components"
import { TimeRangePicker } from "@/shared/components"
import { formatWibDate, formatWibTime } from "@/shared/lib/utcDateTime"
import { Video, MapPin, Check, User, AlertTriangle } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { getApiError } from "@/shared/api/api-error"
import { useScheduleInterviewForm, type ScheduleInterviewFormOptions } from "../../hooks/useScheduleInterviewForm"

export interface ScheduleInterviewDialogProps extends ScheduleInterviewFormOptions {
  isScheduling?: boolean
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
  const {
    isRescheduleMode, scheduleRestriction, minScheduleDate,
    candidateId, selectCandidate, candidateSearch, setCandidateSearch, applicationStageId, setApplicationStageId,
    isApplicationsLoading, isApplicationLoading, isApplicationError, applicationError,
    isCandidatesError, candidatesError,
    eligibleStages, eligibleStageOptions, selectedCandidate,
    availableInterviewers, isInterviewersLoading, isInterviewersError,
    interviewersError, refetchInterviewers, candidateComboboxOptions,
    sessionName, setSessionName, scheduledDate, setScheduledDate,
    startTime, endTime, mode, setMode,
    meetingUrl, setMeetingUrl, location, setLocation,
    selectedInterviewerIds, leadEmployeeId,
    errors, setErrors, handleToggleInterviewer, handleSelectLead,
    handleStartTimeChange, handleEndTimeChange, handleSubmit,
  } = useScheduleInterviewForm({
    open, onOpenChange, recruitment, onSchedule, existingSessions, sessionToReschedule,
  })
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!isScheduling) onOpenChange(nextOpen)
    }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-3xl lg:max-w-4xl p-0">
        <DialogHeader className="border-b border-border p-6 pb-4">
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
            className="p-6 pb-4 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400"
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
                {formatWibDate(sessionToReschedule.rescheduleRequest.proposedStart)}{" "}
                (
                {formatWibTime(sessionToReschedule.rescheduleRequest.proposedStart)}{" "}
                -{" "}
                {formatWibTime(sessionToReschedule.rescheduleRequest.proposedEnd)} WIB)
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

        <form id={formId} onSubmit={handleSubmit} className="py-2 px-6">
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
                  searchValue={candidateSearch}
                  onSearchChange={setCandidateSearch}
                  shouldFilter={false}
                  isLoading={isApplicationsLoading}
                  errorContent={isCandidatesError ? (
                    <p role="alert" className="py-4 text-center text-xs text-destructive">
                      {getApiError(candidatesError).message}
                    </p>
                  ) : undefined}
                  placeholder={
                    selectedCandidate
                      ? `${selectedCandidate.name} (${selectedCandidate.codeApplication})`
                      : isApplicationsLoading && candidateComboboxOptions.length === 0
                        ? "Loading candidates..."
                        : candidateComboboxOptions.length === 0
                        ? "Search candidate..."
                        : "Search candidate..."
                  }
                  searchPlaceholder="Search candidate by name, email, or code..."
                  emptyText="No eligible candidates found"
                  disabled={isRescheduleMode}
                  selectedIds={candidateId ? [candidateId] : []}
                  onSelect={(opt) => {
                    selectCandidate(opt)
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
                  minDate={minScheduleDate}
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

              <div className="space-y-1.5">
                <Label htmlFor="interview-time-range" className="px-1 text-sm font-medium">
                  Interview Time (WIB) <span className="text-destructive">*</span>
                </Label>
                <TimeRangePicker
                  id="interview-time-range"
                  startTime={startTime}
                  endTime={endTime}
                  onStartChange={handleStartTimeChange}
                  onEndChange={handleEndTimeChange}
                  invalid={Boolean(errors.startTime || errors.endTime)}
                />
                {(errors.startTime || errors.endTime) && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.startTime || errors.endTime}
                  </p>
                )}
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
                      <div
                        key={emp.employeeId}
                        className={cn(
                          "flex items-center gap-2 rounded-2xl border p-2.5 transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border/60 hover:bg-muted/40"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleInterviewer(emp.employeeId)}
                          aria-pressed={isSelected}
                          className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-left"
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
                        {isSelected && (
                          <label className="flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-foreground">
                            <input
                              type="radio"
                              name={`${formId}-lead-interviewer`}
                              checked={leadEmployeeId === emp.employeeId}
                              onChange={() => handleSelectLead(emp.employeeId)}
                              aria-label={`Set ${emp.fullName} as lead interviewer`}
                              className="size-4 accent-primary"
                            />
                            Lead
                          </label>
                        )}
                      </div>
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
                {errors.leadInterviewer && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.leadInterviewer}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="mt-4 gap-2 bg-white sm:gap-2 border-t border-border">
          <CancelButton disabled={isScheduling} onClick={() => onOpenChange(false)} />
          <SaveButton
            type="submit"
            form={formId}
            disabled={Boolean(scheduleRestriction) || isScheduling || isInterviewersLoading}
            isLoading={isScheduling}
            loadingText={isRescheduleMode ? "Rescheduling..." : "Scheduling..."}
          >
            {isRescheduleMode ? "Save & Reschedule" : "Schedule Interview"}
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
