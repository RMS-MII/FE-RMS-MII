import { ChevronLeft, ChevronRight, Clock3, ExternalLink, MapPin, Video } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { EmptyState, ErrorState, StatusBadge } from "@/shared/components"
import { formatWibTime } from "@/shared/lib/utcDateTime"
import { cn } from "@/shared/lib/utils"
import { getApiError } from "@/shared/api/api-error"
import type { MyInterviewItem } from "../types"
import { addMonthsToKey } from "../hooks/useMyInterviewsCalendar"

interface MyInterviewsCalendarProps {
  month: string
  days: string[]
  today: string
  selectedDate: string
  interviewsByDay: Map<string, MyInterviewItem[]>
  dayInterviews: MyInterviewItem[]
  selectedInterview: MyInterviewItem | null
  onMonthChange: (month: string) => void
  onSelectDate: (date: string) => void
  onSelectInterview: (interview: MyInterviewItem) => void
  onOpenDetail: (interview: MyInterviewItem) => void
  onAccept: (interview: MyInterviewItem) => void
  onRequestReschedule: (interview: MyInterviewItem) => void
  onAssignTakeHome: (interview: MyInterviewItem) => void
  onSubmitAssessment: (interview: MyInterviewItem) => void
  onViewAssessment: (interview: MyInterviewItem) => void
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error?: unknown
  onRetry: () => void
  hasActiveFilters: boolean
  onResetFilters: () => void
}

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function dateFromKey(key: string) {
  return new Date(`${key}T00:00:00Z`)
}

function formatDay(key: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options }).format(dateFromKey(key))
}

function statusDetails(item: MyInterviewItem) {
  if (item.status === "pending") return { label: "Pending Confirmation", tone: "warning" as const, event: "bg-warning-soft text-warning" }
  if (item.status === "accepted" && item.candidateConfirmed && !item.assessment)
    return { label: "Needs Assessment", tone: "info" as const, event: "bg-blue-500/15 text-blue-800 dark:text-blue-300" }
  if (item.status === "accepted") return { label: item.candidateConfirmed ? "Confirmed" : "Awaiting Candidate", tone: "success" as const, event: "bg-success-soft text-success" }
  if (item.status === "completed") return { label: "Completed", tone: "info" as const, event: "bg-blue-500/15 text-blue-800 dark:text-blue-300" }
  if (item.status === "rescheduled") return { label: "Rescheduled", tone: "warning" as const, event: "bg-warning-soft text-warning" }
  return { label: item.status === "cancelled" ? "Cancelled" : "Declined", tone: "neutral" as const, event: "bg-muted text-muted-foreground" }
}

export function MyInterviewsCalendar({
  month, days, today, selectedDate, interviewsByDay, dayInterviews, selectedInterview,
  onMonthChange, onSelectDate, onSelectInterview, onOpenDetail, onAccept, onRequestReschedule,
  onAssignTakeHome, onSubmitAssessment, onViewAssessment, isLoading, isFetching,
  isError, error, onRetry, hasActiveFilters, onResetFilters,
}: MyInterviewsCalendarProps) {
  if (isError) {
    return (
      <div className="flex min-h-96 items-center justify-center px-5">
        <ErrorState
          title={getApiError(error).kind === "forbidden" ? "Access denied" : "Unable to load interviews"}
          description={getApiError(error, "Unable to load your interview sessions.").message}
          onRetry={getApiError(error).kind === "forbidden" ? undefined : onRetry}
        />
      </div>
    )
  }

  const selectedStatus = selectedInterview ? statusDetails(selectedInterview) : null

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0" aria-label="Interview calendar">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {formatDay(`${month}-01`, { month: "long", year: "numeric" })}
            </h2>
            {isFetching && !isLoading && <span className="text-xs text-muted-foreground">Updating...</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <Button type="button" variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs" onClick={() => onSelectDate(today)}>Today</Button>
            <Button type="button" variant="ghost" size="icon-sm" className="rounded-full" aria-label="Previous month" onClick={() => onMonthChange(addMonthsToKey(month, -1))}><ChevronLeft className="size-4" /></Button>
            <Button type="button" variant="ghost" size="icon-sm" className="rounded-full" aria-label="Next month" onClick={() => onMonthChange(addMonthsToKey(month, 1))}><ChevronRight className="size-4" /></Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-175">
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {weekdays.map((day) => <div key={day} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const items = interviewsByDay.get(day) ?? []
                const isCurrentMonth = day.slice(0, 7) === month
                const isSelected = day === selectedDate
                return (
                  <div
                    key={day}
                    className={cn(
                      "min-h-24 border-b border-r border-border p-1.5 transition-colors last:border-r-0 hover:bg-muted/30",
                      !isCurrentMonth && "bg-muted/15",
                      isSelected && "bg-primary/5"
                    )}
                    onClick={() => onSelectDate(day)}
                  >
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); onSelectDate(day) }}
                      aria-label={formatDay(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      aria-current={day === today ? "date" : undefined}
                      className={cn(
                        "mb-1 flex size-7 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                        !isCurrentMonth && "text-muted-foreground/60",
                        day === today ? "bg-primary text-primary-foreground" : isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      )}
                    >
                      {Number(day.slice(-2))}
                    </button>
                    <div className="space-y-1">
                      {isLoading && isCurrentMonth && <div className="h-5 w-4/5 animate-pulse rounded-md bg-muted" />}
                      {isLoading && isCurrentMonth && <div className="h-5 w-3/5 animate-pulse rounded-md bg-muted" />}
                      {items.slice(0, 2).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={(event) => { event.stopPropagation(); onOpenDetail(item) }}
                          title={`${formatWibTime(item.scheduledStart)} ${item.candidateName} — ${item.sessionName}`}
                          className={cn(
                            "block w-full truncate rounded-md px-1.5 py-1 text-left text-[11px] font-medium leading-tight transition-shadow hover:ring-1 hover:ring-primary/50",
                            statusDetails(item).event,
                            selectedInterview?.id === item.id && "ring-1 ring-primary"
                          )}
                        >
                          <span className="font-mono">{formatWibTime(item.scheduledStart)}</span> {item.candidateName}
                        </button>
                      ))}
                      {items.length > 2 && (
                        <button type="button" className="px-1.5 text-[11px] font-medium text-primary hover:underline" onClick={(event) => { event.stopPropagation(); onSelectDate(day) }}>
                          +{items.length - 2} more
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <aside className="border-t border-border bg-card xl:border-l xl:border-t-0" aria-label="Interview details">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">{formatDay(selectedDate, { weekday: "long", day: "numeric", month: "long" })}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{isLoading ? "Loading interviews..." : `${dayInterviews.length} interview${dayInterviews.length === 1 ? "" : "s"}`}</p>
        </div>
        {isLoading ? (
          <div className="space-y-4 p-5" aria-label="Loading interview details">
            <div className="h-12 animate-pulse rounded-lg bg-muted" />
            <div className="h-28 animate-pulse rounded-lg bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : dayInterviews.length === 0 ? (
          <div className="px-5 py-14">
            <EmptyState
              title="No interviews this day"
              description={hasActiveFilters ? "Change filters to see other interviews." : "Select another date on the calendar."}
              action={hasActiveFilters ? <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>Reset filters</Button> : undefined}
            />
          </div>
        ) : (
          <div className="max-h-[calc(100vh-13rem)] overflow-y-auto">
            {dayInterviews.length > 1 && (
              <div className="space-y-1 border-b border-border p-3">
                {dayInterviews.map((item) => (
                  <button key={item.id} type="button" onClick={() => onSelectInterview(item)} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-muted", selectedInterview?.id === item.id && "bg-primary/10 text-primary")}>
                    <span className="font-mono tabular-nums">{formatWibTime(item.scheduledStart)}</span>
                    <span className="truncate font-medium">{item.candidateName}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedInterview && selectedStatus && (
              <div className="space-y-5 p-5">
                <div className="space-y-2">
                  <StatusBadge tone={selectedStatus.tone}>{selectedStatus.label}</StatusBadge>
                  <h3 className="text-lg font-semibold text-foreground">{selectedInterview.candidateName}</h3>
                  <p className="break-all text-xs text-muted-foreground">{selectedInterview.candidateEmail}</p>
                  <Button type="button" variant="outline" size="sm" className="mt-1 rounded-full" onClick={() => onOpenDetail(selectedInterview)}>View full detail</Button>
                </div>

                <div className="space-y-3 border-t border-border pt-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Session</p><p className="font-medium text-foreground">{selectedInterview.sessionName}</p></div>
                  <div><p className="text-xs text-muted-foreground">Recruitment & stage</p><p className="font-medium text-foreground">{selectedInterview.recruitmentName}</p><p className="text-xs text-muted-foreground">{selectedInterview.stageName}</p></div>
                  <div className="flex items-center gap-2 text-foreground"><Clock3 className="size-4 text-muted-foreground" /><span className="font-mono text-xs tabular-nums">{formatWibTime(selectedInterview.scheduledStart)} – {formatWibTime(selectedInterview.scheduledEnd)} WIB</span></div>
                  <div className="flex items-start gap-2 text-foreground">
                    {selectedInterview.isOnline ? <Video className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> : <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                    <div className="min-w-0 text-xs">
                      <p>{selectedInterview.isOnline ? "Online" : selectedInterview.location || "Location not provided"}</p>
                      {selectedInterview.isOnline && selectedInterview.meetingUrl && <a href={selectedInterview.meetingUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-primary hover:underline">Open meeting link <ExternalLink className="size-3 shrink-0" /></a>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <h4 className="text-xs font-semibold text-foreground">Interview panel</h4>
                  {selectedInterview.panelInterviewers.length ? selectedInterview.panelInterviewers.map((member) => (
                    <div key={member.id} className="flex flex-wrap items-center gap-1.5 text-xs text-foreground">
                      <span>{member.name}</span>
                      {member.isCurrent && <span className="text-muted-foreground">(You)</span>}
                      {member.isLead && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Lead</span>}
                    </div>
                  )) : <p className="text-xs text-muted-foreground">Panel unavailable</p>}
                </div>

                {selectedInterview.assessment && (
                  <div className="space-y-1 border-t border-border pt-4 text-xs">
                    <h4 className="font-semibold text-foreground">Evaluation</h4>
                    <p className="text-foreground">{selectedInterview.assessment.score}/100 · {selectedInterview.assessment.recommendation}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  {selectedInterview.status === "pending" && selectedInterview.isLead && (
                    <>
                      <Button type="button" size="sm" className="rounded-full" onClick={() => onAccept(selectedInterview)}>Accept</Button>
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onRequestReschedule(selectedInterview)}>Request Reschedule</Button>
                    </>
                  )}
                  {selectedInterview.status === "pending" && !selectedInterview.isLead && <p className="text-xs text-muted-foreground">Awaiting lead confirmation</p>}
                  {(selectedInterview.status === "accepted" || selectedInterview.status === "completed") && (
                    <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={!selectedInterview.canAssignTakeHome} onClick={() => onAssignTakeHome(selectedInterview)}>
                      {selectedInterview.fileTakeHome ? "Edit Take-home" : "Assign Take-home"}
                    </Button>
                  )}
                  {selectedInterview.status === "accepted" && selectedInterview.candidateConfirmed && !selectedInterview.assessment && (
                    <Button type="button" size="sm" className="rounded-full" onClick={() => onSubmitAssessment(selectedInterview)}>Submit Evaluation</Button>
                  )}
                  {selectedInterview.status === "accepted" && selectedInterview.isLead && (
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onRequestReschedule(selectedInterview)}>Request Reschedule</Button>
                  )}
                  {selectedInterview.status === "completed" && selectedInterview.assessment && (
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onViewAssessment(selectedInterview)}>View Evaluation</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
