import { useNavigate } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  FileText,
  ListChecks,
  Mail,
  RefreshCw,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  PanelHeader,
  StatCard,
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

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
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

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Pending Invitations"
          value={summary.pendingInvitationsCount}
          icon={Mail}
          tone="primary"
        />
        <StatCard
          label="Sessions to Confirm"
          value={summary.sessionsToConfirmCount}
          icon={CalendarClock}
          tone="neutral"
        />
        <StatCard
          label="Pending Assessments"
          value={summary.pendingAssessmentsCount}
          icon={ClipboardCheck}
          tone="primary"
        />
        <StatCard
          label="Take-home Reviews"
          value={summary.takeHomeReviewsCount}
          icon={FileText}
          tone="neutral"
        />
        <StatCard
          label="Active Tasks"
          value={summary.activeTasksCount}
          icon={ListChecks}
          tone="success"
        />
        <StatCard
          label="Overdue Tasks"
          value={summary.overdueTasksCount}
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Active Tasks"
            description="Tugas yang perlu ditindaklanjuti, diurutkan berdasarkan urgensi."
            meta={`${summary.activeTasksCount} task`}
          />
          {activeTasks.length > 0 ? (
            <ul>
              {activeTasks.map((task, index) => {
                const target = taskTarget(task)
                return (
                  <li
                    key={taskKey(task, index)}
                    className="border-b border-border last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenTask(task)}
                      disabled={!target}
                      className={cn(
                        "flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors",
                        target
                          ? "cursor-pointer hover:bg-muted/50"
                          : "cursor-default"
                      )}
                    >
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge tone={taskTone(task)}>
                            {task.taskTypeName}
                          </StatusBadge>
                          {task.isOverdue ? (
                            <StatusBadge tone="danger">Overdue</StatusBadge>
                          ) : null}
                          {task.isLead ? (
                            <StatusBadge tone="neutral">Lead</StatusBadge>
                          ) : null}
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {task.title}
                        </p>
                        {task.description ? (
                          <p className="text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {task.batchName ? (
                            <span>{task.batchName}</span>
                          ) : null}
                          {task.stageName ? (
                            <span>{task.stageName}</span>
                          ) : null}
                          {task.candidateName ? (
                            <span>{task.candidateName}</span>
                          ) : null}
                          {task.dueAt ? (
                            <span>Due {safeFormatWibDateTime(task.dueAt)}</span>
                          ) : task.scheduledStart ? (
                            <span>
                              {safeFormatWibDateTime(task.scheduledStart)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {target ? (
                        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <SectionEmpty
              title="Tidak ada task aktif"
              description="Semua undangan, konfirmasi, penilaian, dan take-home sudah ditangani."
            />
          )}
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeader
              title="Upcoming Sessions"
              description="Sesi wawancara yang akan datang."
              meta={`${summary.upcomingSessionsCount} sesi`}
            />
            {upcomingSessions.length > 0 ? (
              <ul>
                {upcomingSessions.map((session) => (
                  <li
                    key={session.sessionInterviewId}
                    className="border-b border-border last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenSession(session.sessionInterviewId)}
                      className="flex w-full cursor-pointer items-start justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {session.candidateName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {session.sessionName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {safeFormatWibDateTime(session.scheduledStart)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[session.batchName, session.stageName]
                            .filter(Boolean)
                            .join(" · ")}
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
                      className="flex w-full cursor-pointer items-start justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {invitation.batchName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {invitation.stageName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
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

      <Panel>
        <PanelHeader
          title="Recent Sessions"
          description="Sesi wawancara terakhir beserta status penilaian."
          meta={`${recentSessions.length} sesi`}
        />
        {recentSessions.length > 0 ? (
          <ul>
            {recentSessions.map((session) => (
              <li
                key={session.sessionInterviewId}
                className="border-b border-border last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => onOpenSession(session.sessionInterviewId)}
                  className="flex w-full cursor-pointer flex-wrap items-start justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {session.candidateName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.sessionName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {safeFormatWibDateTime(session.scheduledEnd)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[session.batchName, session.stageName]
                        .filter(Boolean)
                        .join(" · ")}
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
