import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  FileText,
  ListChecks,
  Mail,
  RefreshCw,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  PanelHeader,
  StatusBadge,
  type Tone,
} from "@/shared/components"
import { cn } from "@/shared/lib/utils"
import { safeFormatWibDateTime } from "@/shared/lib/utcDateTime"
import { useGetInterviewerDashboardQuery } from "../api/interviewer-api"
import type {
  InterviewerActiveTaskDto,
  InterviewerDashboardDto,
  InterviewerDashboardSessionDto,
} from "../types"

/* --------------------------------- Helpers -------------------------------- */

const TASK_TYPE_KEYS: Record<string, string> = {
  "1": "pendinginvitation",
  "2": "sessionconfirmation",
  "3": "pendingassessment",
  "4": "takehomereview",
  "5": "upcomingsession",
}

function normalizeKey(value: string | number): string {
  return (
    TASK_TYPE_KEYS[String(value)] ??
    String(value)
      .replace(/[_\s-]/g, "")
      .toLowerCase()
  )
}

function taskTone(task: InterviewerActiveTaskDto): Tone {
  if (task.isOverdue) return "danger"

  switch (normalizeKey(task.taskType)) {
    case "pendinginvitation":
    case "sessionconfirmation":
      return "warning"
    case "pendingassessment":
    case "takehomereview":
      return "info"
    default:
      return "neutral"
  }
}

function sessionTone(
  status: InterviewerDashboardSessionDto["sessionStatus"]
): Tone {
  switch (normalizeKey(status)) {
    case "acceptedbycandidate":
    case "acceptedbyinterviewer":
    case "scheduled":
      return "success"
    case "pendingconfirmation":
      return "warning"
    case "rescheduled":
      return "info"
    default:
      return "neutral"
  }
}

function taskTarget(task: InterviewerActiveTaskDto) {
  if (normalizeKey(task.taskType) === "pendinginvitation") return true
  return Boolean(task.sessionInterviewId)
}

function taskKey(task: InterviewerActiveTaskDto, index: number) {
  return (
    task.sessionInterviewId ??
    task.stageEmployeeId ??
    `${normalizeKey(task.taskType)}-${index}`
  )
}

/** Colour of the thin indicator on the left edge of a task row. */
const INDICATOR_CLASS: Partial<Record<Tone, string>> = {
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  success: "bg-emerald-500",
}

const INITIAL_VISIBLE_TASKS = 5
const INITIAL_VISIBLE_SESSIONS = 4

type TaskFilter =
  | "all"
  | "overdue"
  | "pendinginvitation"
  | "sessionconfirmation"
  | "pendingassessment"
  | "takehomereview"

const FILTER_LABELS: Record<TaskFilter, string> = {
  all: "Semua",
  overdue: "Terlambat",
  pendinginvitation: "Undangan",
  sessionconfirmation: "Konfirmasi",
  pendingassessment: "Penilaian",
  takehomereview: "Take-home",
}

function matchesFilter(task: InterviewerActiveTaskDto, filter: TaskFilter) {
  if (filter === "all") return true
  if (filter === "overdue") return Boolean(task.isOverdue)
  return normalizeKey(task.taskType) === filter
}

/* ------------------------------ Small components -------------------------- */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-card" />
        <div className="space-y-6">
          <div className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
        </div>
      </div>
    </div>
  )
}

function SectionEmpty({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <EmptyState
      icon={<ListChecks className="size-6 stroke-[1.75]" />}
      title={title}
      description={description}
    />
  )
}

interface SummaryCellProps {
  label: string
  value: number
  icon: LucideIcon
  accent: "primary" | "warning" | "info" | "success" | "danger"
  active?: boolean
  onClick?: () => void
}

const ACCENT_CHIP: Record<SummaryCellProps["accent"], string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
}

function SummaryCell({
  label,
  value,
  icon: Icon,
  accent,
  active,
  onClick,
}: SummaryCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex cursor-pointer items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        active && "bg-muted/60"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          value > 0 ? ACCENT_CHIP[accent] : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-2xl font-semibold leading-none tracking-tight tabular-nums",
            value > 0 ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {value}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {label}
        </span>
      </span>
    </button>
  )
}

function ShowMoreButton({
  expanded,
  hiddenCount,
  onToggle,
}: {
  expanded: boolean
  hiddenCount: number
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-border px-5 py-3 text-xs font-medium text-primary transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      {expanded ? "Tampilkan lebih sedikit" : `Tampilkan ${hiddenCount} lainnya`}
      <ChevronDown
        className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
        aria-hidden
      />
    </button>
  )
}

function TaskRow({
  task,
  onOpen,
}: {
  task: InterviewerActiveTaskDto
  onOpen: () => void
}) {
  const target = taskTarget(task)
  const tone = taskTone(task)
  const when = task.dueAt
    ? `Jatuh tempo ${safeFormatWibDateTime(task.dueAt)}`
    : task.scheduledStart
      ? safeFormatWibDateTime(task.scheduledStart)
      : null
  const context = [task.batchName, task.stageName, task.candidateName].filter(
    Boolean
  )

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!target}
      className={cn(
        "relative flex w-full items-center gap-4 py-3.5 pl-6 pr-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        target ? "cursor-pointer hover:bg-muted/50" : "cursor-default"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-3 left-0 w-1 rounded-r-full",
          INDICATOR_CLASS[tone] ?? "bg-muted-foreground/40"
        )}
      />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge tone={tone}>{task.taskTypeName}</StatusBadge>
          {task.isOverdue ? (
            <StatusBadge tone="danger">Overdue</StatusBadge>
          ) : null}
          {task.isLead ? <StatusBadge tone="neutral">Lead</StatusBadge> : null}
        </div>
        <p className="truncate text-sm font-medium text-foreground">
          {task.title}
        </p>
        {context.length > 0 ? (
          <p className="truncate text-xs text-muted-foreground">
            {context.join(" · ")}
          </p>
        ) : null}
        {task.description ? (
          <p className="line-clamp-1 text-xs text-muted-foreground/80">
            {task.description}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        {when ? (
          <span
            className={cn(
              "text-xs tabular-nums",
              task.isOverdue
                ? "font-medium text-rose-600 dark:text-rose-400"
                : "text-muted-foreground"
            )}
          >
            {when}
          </span>
        ) : null}
        {target ? (
          <ArrowRight
            className="size-4 text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </div>
    </button>
  )
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="border-b border-border bg-muted/40 px-5 py-2 text-xs font-medium text-muted-foreground">
      {children}
    </p>
  )
}

/* ---------------------------------- Page ---------------------------------- */

export function InterviewerDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, isFetching, refetch } =
    useGetInterviewerDashboardQuery(undefined, {
      refetchOnMountOrArgChange: true,
    })

  const openStageInvitations = () => {
    void navigate({ to: "/interviews/stages" })
  }

  const openSession = (sessionInterviewId: string | null | undefined) => {
    if (!sessionInterviewId) return
    void navigate({
      to: "/interviews/schedules/$sessionInterviewId",
      params: { sessionInterviewId },
    })
  }

  const openTask = (task: InterviewerActiveTaskDto) => {
    if (normalizeKey(task.taskType) === "pendinginvitation") {
      openStageInvitations()
      return
    }
    openSession(task.sessionInterviewId)
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Dashboard"
        description="Ringkasan undangan, jadwal wawancara, penilaian, dan take-home yang perlu Anda tindak lanjuti."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="cursor-pointer gap-2 rounded-full"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span>Refresh</span>
          </Button>
        }
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError || !data ? (
        <Panel>
          <ErrorState
            title="Gagal memuat dashboard"
            description="Data dashboard pewawancara tidak dapat dimuat. Silakan coba lagi."
            onRetry={() => void refetch()}
          />
        </Panel>
      ) : (
        <DashboardContent
          data={data}
          onOpenTask={openTask}
          onOpenSession={openSession}
          onOpenInvitations={openStageInvitations}
        />
      )}
    </div>
  )
}

function DashboardContent({
  data,
  onOpenTask,
  onOpenSession,
  onOpenInvitations,
}: {
  data: InterviewerDashboardDto
  onOpenTask: (task: InterviewerActiveTaskDto) => void
  onOpenSession: (sessionInterviewId: string | null | undefined) => void
  onOpenInvitations: () => void
}) {
  const {
    summary,
    activeTasks,
    upcomingSessions,
    recentSessions,
    pendingInvitations,
  } = data

  const [filter, setFilter] = useState<TaskFilter>("all")
  const [tasksExpanded, setTasksExpanded] = useState(false)
  const [upcomingExpanded, setUpcomingExpanded] = useState(false)
  const [recentExpanded, setRecentExpanded] = useState(false)

  const filterCounts = useMemo(() => {
    const counts: Record<TaskFilter, number> = {
      all: activeTasks.length,
      overdue: 0,
      pendinginvitation: 0,
      sessionconfirmation: 0,
      pendingassessment: 0,
      takehomereview: 0,
    }
    for (const task of activeTasks) {
      if (task.isOverdue) counts.overdue += 1
      const key = normalizeKey(task.taskType) as TaskFilter
      if (key in counts && key !== "all" && key !== "overdue") counts[key] += 1
    }
    return counts
  }, [activeTasks])

  const filteredTasks = useMemo(
    () => activeTasks.filter((task) => matchesFilter(task, filter)),
    [activeTasks, filter]
  )

  // Overdue tasks always float to the top, the server's urgency order is kept.
  const overdueTasks = filteredTasks.filter((task) => task.isOverdue)
  const regularTasks = filteredTasks.filter((task) => !task.isOverdue)
  const orderedTasks = [...overdueTasks, ...regularTasks]
  const visibleTasks = tasksExpanded
    ? orderedTasks
    : orderedTasks.slice(0, INITIAL_VISIBLE_TASKS)
  const showGroupLabels = overdueTasks.length > 0 && regularTasks.length > 0
  const hiddenTaskCount = orderedTasks.length - INITIAL_VISIBLE_TASKS

  const visibleUpcoming = upcomingExpanded
    ? upcomingSessions
    : upcomingSessions.slice(0, INITIAL_VISIBLE_SESSIONS)
  const visibleRecent = recentExpanded
    ? recentSessions
    : recentSessions.slice(0, INITIAL_VISIBLE_SESSIONS)

  const selectFilter = (next: TaskFilter) => {
    setFilter(next)
    setTasksExpanded(false)
  }

  const chips = (Object.keys(FILTER_LABELS) as TaskFilter[]).filter(
    (key) => key === "all" || filterCounts[key] > 0 || key === filter
  )

  return (
    <>
      {/* Attention banner: only when something is overdue */}
      {summary.overdueTasksCount > 0 ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-[18px]" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                {summary.overdueTasksCount} task melewati batas waktu
              </p>
              <p className="text-xs text-muted-foreground">
                Selesaikan lebih dulu agar proses seleksi tidak tertunda.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectFilter("overdue")}
            className="cursor-pointer rounded-full"
          >
            Lihat task terlambat
          </Button>
        </div>
      ) : null}

      {/* One compact strip instead of six separate cards; each cell filters the task list */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-3 xl:grid-cols-6 xl:divide-y-0">
        <SummaryCell
          label="Active Tasks"
          value={summary.activeTasksCount}
          icon={ListChecks}
          accent="success"
          active={filter === "all"}
          onClick={() => selectFilter("all")}
        />
        <SummaryCell
          label="Overdue Tasks"
          value={summary.overdueTasksCount}
          icon={AlertTriangle}
          accent="danger"
          active={filter === "overdue"}
          onClick={() => selectFilter("overdue")}
        />
        <SummaryCell
          label="Pending Invitations"
          value={summary.pendingInvitationsCount}
          icon={Mail}
          accent="primary"
          active={filter === "pendinginvitation"}
          onClick={() => selectFilter("pendinginvitation")}
        />
        <SummaryCell
          label="Sessions to Confirm"
          value={summary.sessionsToConfirmCount}
          icon={CalendarClock}
          accent="warning"
          active={filter === "sessionconfirmation"}
          onClick={() => selectFilter("sessionconfirmation")}
        />
        <SummaryCell
          label="Pending Assessments"
          value={summary.pendingAssessmentsCount}
          icon={ClipboardCheck}
          accent="info"
          active={filter === "pendingassessment"}
          onClick={() => selectFilter("pendingassessment")}
        />
        <SummaryCell
          label="Take-home Reviews"
          value={summary.takeHomeReviewsCount}
          icon={FileText}
          accent="info"
          active={filter === "takehomereview"}
          onClick={() => selectFilter("takehomereview")}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* ------------------------------ Active tasks ----------------------------- */}
        <Panel>
          <PanelHeader
            title="Active Tasks"
            description="Tugas yang perlu ditindaklanjuti, yang terlambat selalu di atas."
            meta={`${summary.activeTasksCount} task`}
          />

          {activeTasks.length > 0 ? (
            <>
              <div
                className="flex flex-wrap gap-2 border-b border-border px-5 pb-4"
                role="group"
                aria-label="Filter task"
              >
                {chips.map((key) => {
                  const selected = filter === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectFilter(key)}
                      aria-pressed={selected}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      {FILTER_LABELS[key]}
                      <span
                        className={cn(
                          "tabular-nums",
                          selected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground/70"
                        )}
                      >
                        {filterCounts[key]}
                      </span>
                    </button>
                  )
                })}
              </div>

              {orderedTasks.length > 0 ? (
                <>
                  <div
                    className={cn(
                      tasksExpanded && "max-h-[34rem] overflow-y-auto"
                    )}
                  >
                    {showGroupLabels && (
                      <GroupLabel>{`Terlambat · ${overdueTasks.length}`}</GroupLabel>
                    )}
                    <ul>
                      {visibleTasks.map((task, index) => {
                        const isFirstRegular =
                          showGroupLabels && index === overdueTasks.length
                        return (
                          <li
                            key={taskKey(task, index)}
                            className="border-b border-border last:border-b-0"
                          >
                            {isFirstRegular && (
                              <GroupLabel>{`Lainnya · ${regularTasks.length}`}</GroupLabel>
                            )}
                            <TaskRow task={task} onOpen={() => onOpenTask(task)} />
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                  {hiddenTaskCount > 0 && (
                    <ShowMoreButton
                      expanded={tasksExpanded}
                      hiddenCount={hiddenTaskCount}
                      onToggle={() => setTasksExpanded((value) => !value)}
                    />
                  )}
                </>
              ) : (
                <SectionEmpty
                  title="Tidak ada task di kategori ini"
                  description="Pilih kategori lain atau kembali ke Semua."
                />
              )}
            </>
          ) : (
            <SectionEmpty
              title="Tidak ada task aktif"
              description="Semua undangan, konfirmasi, penilaian, dan take-home sudah ditangani."
            />
          )}
        </Panel>

        {/* ------------------------------ Right column ----------------------------- */}
        <div className="space-y-6">
          <Panel>
            <PanelHeader
              title="Upcoming Sessions"
              description="Sesi wawancara yang akan datang."
              meta={`${summary.upcomingSessionsCount} sesi`}
            />
            {upcomingSessions.length > 0 ? (
              <>
                <ul>
                  {visibleUpcoming.map((session) => (
                    <li
                      key={session.sessionInterviewId}
                      className="border-b border-border last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onOpenSession(session.sessionInterviewId)
                        }
                        className="flex w-full cursor-pointer items-start justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate text-sm font-medium text-foreground">
                            {session.candidateName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {[session.sessionName, session.batchName]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <p className="flex items-center gap-1.5 pt-0.5 text-xs text-foreground/80 tabular-nums">
                            <CalendarClock
                              className="size-3.5 text-muted-foreground"
                              aria-hidden
                            />
                            {safeFormatWibDateTime(session.scheduledStart)}
                          </p>
                        </div>
                        <StatusBadge tone={sessionTone(session.sessionStatus)}>
                          {session.sessionStatusName ??
                            String(session.sessionStatus)}
                        </StatusBadge>
                      </button>
                    </li>
                  ))}
                </ul>
                {upcomingSessions.length > INITIAL_VISIBLE_SESSIONS && (
                  <ShowMoreButton
                    expanded={upcomingExpanded}
                    hiddenCount={
                      upcomingSessions.length - INITIAL_VISIBLE_SESSIONS
                    }
                    onToggle={() => setUpcomingExpanded((value) => !value)}
                  />
                )}
              </>
            ) : (
              <SectionEmpty
                title="Tidak ada sesi mendatang"
                description="Belum ada jadwal wawancara yang akan datang."
              />
            )}
          </Panel>

          <Panel>
            <PanelHeader
              title="Pending Invitations"
              description="Undangan penugasan tahap yang menunggu respons."
              meta={`${summary.pendingInvitationsCount} undangan`}
            />
            {pendingInvitations.length > 0 ? (
              <ul>
                {pendingInvitations.map((invitation) => (
                  <li
                    key={invitation.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={onOpenInvitations}
                      className="flex w-full cursor-pointer items-start justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-sm font-medium text-foreground">
                          {invitation.batchName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {invitation.stageName}
                        </p>
                        <p className="pt-0.5 text-xs text-muted-foreground tabular-nums">
                          Tahap berakhir{" "}
                          {safeFormatWibDateTime(invitation.stageEndDate)}
                        </p>
                      </div>
                      <StatusBadge tone="warning">
                        {invitation.statusName}
                      </StatusBadge>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <SectionEmpty
                title="Tidak ada undangan pending"
                description="Semua undangan penugasan sudah Anda respons."
              />
            )}
          </Panel>
        </div>
      </div>

      {/* ------------------------------ Recent sessions ---------------------------- */}
      <Panel>
        <PanelHeader
          title="Recent Sessions"
          description="Sesi wawancara terakhir beserta status penilaian."
          meta={`${recentSessions.length} sesi`}
        />
        {recentSessions.length > 0 ? (
          <>
            <ul>
              {visibleRecent.map((session) => (
                <li
                  key={session.sessionInterviewId}
                  className="border-b border-border last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => onOpenSession(session.sessionInterviewId)}
                    className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {session.candidateName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[session.sessionName, session.batchName, session.stageName]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <p className="pt-0.5 text-xs text-muted-foreground tabular-nums">
                        Selesai {safeFormatWibDateTime(session.scheduledEnd)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={sessionTone(session.sessionStatus)}>
                        {session.sessionStatusName ??
                          String(session.sessionStatus)}
                      </StatusBadge>
                      <StatusBadge
                        tone={
                          session.isAssessmentSubmitted ? "success" : "warning"
                        }
                      >
                        {session.isAssessmentSubmitted
                          ? "Sudah dinilai"
                          : "Belum dinilai"}
                      </StatusBadge>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {recentSessions.length > INITIAL_VISIBLE_SESSIONS && (
              <ShowMoreButton
                expanded={recentExpanded}
                hiddenCount={recentSessions.length - INITIAL_VISIBLE_SESSIONS}
                onToggle={() => setRecentExpanded((value) => !value)}
              />
            )}
          </>
        ) : (
          <SectionEmpty
            title="Belum ada sesi terakhir"
            description="Sesi wawancara yang sudah selesai akan tampil di sini."
          />
        )}
      </Panel>
    </>
  )
}