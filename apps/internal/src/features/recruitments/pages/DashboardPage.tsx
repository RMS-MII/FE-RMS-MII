import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  BadgeCheck,
  Briefcase,
  ChevronRight,
  Hourglass,
  RefreshCw,
  UserX,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  ErrorState,
  PageHeader,
  Panel,
  PanelHeader,
  StatusBadge,
  type Tone,
} from "@/shared/components"
import { useBatchDashboard } from "../hooks"
import { useGetBatchesQuery } from "../api/recruitments-api"
import { getRecruitmentStatusMeta } from "../types"

/* ---------------------------------- Types --------------------------------- */

type KpiTone = "primary" | "success" | "danger" | "neutral"

interface ActiveTask {
  batchId: string
  batchName: string
  statusLabel: string
  statusTone: Tone
  openCandidateCount: number
}

/* --------------------------------- Helpers -------------------------------- */

const numberFormat = new Intl.NumberFormat("en-US")

const formatNumber = (value: number) => numberFormat.format(value)

const toPercent = (part: number, whole: number) =>
  whole > 0 ? (part / whole) * 100 : 0

const formatPercent = (value: number) =>
  `${value >= 10 || value === 0 ? Math.round(value) : value.toFixed(1)}%`

const toneStyles: Record<
  KpiTone,
  { chip: string; bar: string; dot: string }
> = {
  primary: {
    chip: "bg-primary/10 text-primary",
    bar: "bg-primary",
    dot: "bg-primary",
  },
  success: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  danger: {
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
  neutral: {
    chip: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground/60",
    dot: "bg-muted-foreground/60",
  },
}

/* ------------------------------ Small components -------------------------- */

interface KpiCardProps {
  label: string
  value: number
  icon: LucideIcon
  tone: KpiTone
  /** Short explanation shown under the number */
  hint: string
  /** 0-100, renders a thin progress bar when provided */
  share?: number
}

function KpiCard({ label, value, icon: Icon, tone, hint, share }: KpiCardProps) {
  const styles = toneStyles[tone]
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${styles.chip}`}
        >
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatNumber(value)}
      </p>

      <div className="mt-3 space-y-2">
        {share !== undefined && (
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={`${label} share`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(share)}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out ${styles.bar}`}
              style={{ width: `${Math.min(100, share)}%` }}
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
        <div className="size-9 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="mt-4 h-8 w-20 animate-pulse rounded bg-muted" />
      <div className="mt-5 h-1.5 w-full animate-pulse rounded-full bg-muted" />
      <div className="mt-3 h-3 w-36 animate-pulse rounded bg-muted" />
    </div>
  )
}

interface LegendItemProps {
  label: string
  value: number
  percent: number
  tone: KpiTone
}

function LegendItem({ label, value, percent, tone }: LegendItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span
          className={`size-2.5 rounded-full ${toneStyles[tone].dot}`}
          aria-hidden
        />
        {label}
      </span>
      <span className="tabular-nums text-foreground">
        <span className="font-medium">{formatNumber(value)}</span>
        <span className="ml-2 text-xs text-muted-foreground">
          {formatPercent(percent)}
        </span>
      </span>
    </div>
  )
}

interface InsightProps {
  label: string
  value: string
  description: string
}

function Insight({ label, value, description }: InsightProps) {
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

/* ---------------------------------- Page ---------------------------------- */

export function HrDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useBatchDashboard()
  const {
    data: batchesData,
    isLoading: isBatchesLoading,
    isError: isBatchesError,
  } = useGetBatchesQuery({ page: 1, pageSize: 10, status: 2 })

  const activeTasks = useMemo<ActiveTask[]>(() => {
    return (batchesData?.items ?? []).map((batch) => {
      const statusMeta = getRecruitmentStatusMeta(batch.status)
      return {
        batchId: batch.id,
        batchName: batch.name,
        statusLabel: statusMeta.label,
        statusTone: statusMeta.tone,
        openCandidateCount: batch.activeCandidateCount ?? 0,
      }
    })
  }, [batchesData])

  const totalOpenCandidates = useMemo(
    () => activeTasks.reduce((sum, task) => sum + task.openCandidateCount, 0),
    [activeTasks]
  )
  const maxOpenCandidates = useMemo(
    () => Math.max(1, ...activeTasks.map((task) => task.openCandidateCount)),
    [activeTasks]
  )

  const stats = useMemo(() => {
    if (!data) return null
    const total = data.totalApplications
    const accepted = data.acceptedApplications
    const rejected = data.rejectedApplications
    const dropped = data.droppedApplications
    const notPassed = rejected + dropped
    const inProcess = data.inProcessApplications
    const decided = accepted + rejected
    const concluded = accepted + notPassed

    return {
      total,
      accepted,
      notPassed,
      inProcess,
      acceptedPct: toPercent(accepted, total),
      notPassedPct: toPercent(notPassed, total),
      inProcessPct: toPercent(inProcess, total),
      // Dropped applications were not evaluated as accepted or rejected.
      passRate: toPercent(accepted, decided),
      decidedPct: toPercent(concluded, total),
    }
  }, [data])

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    []
  )

  const lastUpdated = useMemo(
    () =>
      data
        ? new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date())
        : null,
    [data]
  )

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Dashboard"
        description={`${today}. Recruitment applications, outcomes, and active employee headcount.`}
        actions={
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Updated {lastUpdated}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="cursor-pointer gap-2 rounded-full"
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Refresh
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <KpiSkeleton key={index} />
            ))}
          </div>
          <div className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
        </>
      ) : isError || !data || !stats ? (
        <Panel>
          <ErrorState
            title="Failed to load dashboard"
            description="Unable to load the dashboard statistics right now. Please try again."
            onRetry={() => void refetch()}
          />
        </Panel>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total Applications"
              value={stats.total}
              icon={Users}
              tone="primary"
              hint={`${formatNumber(stats.inProcess)} in process · ${formatPercent(stats.decidedPct)} concluded`}
              share={stats.decidedPct}
            />
            <KpiCard
              label="Accepted Applications"
              value={stats.accepted}
              icon={BadgeCheck}
              tone="success"
              hint={`${formatPercent(stats.acceptedPct)} of all applications`}
              share={stats.acceptedPct}
            />
            <KpiCard
              label="Rejected / Dropped"
              value={stats.notPassed}
              icon={UserX}
              tone="danger"
              hint={`${formatPercent(stats.notPassedPct)} of all applications`}
              share={stats.notPassedPct}
            />
            <KpiCard
              label="Employee Count"
              value={data.employeeCount}
              icon={Briefcase}
              tone="neutral"
              hint="Current active headcount"
            />
          </div>

          {/* Pipeline breakdown + insights */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader
                title="Application Outcomes"
                description="How applications are distributed by current status."
              />
              <div className="space-y-5 px-5 pb-5">
                <div
                  className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`Accepted ${formatPercent(stats.acceptedPct)}, in process ${formatPercent(stats.inProcessPct)}, rejected or dropped ${formatPercent(stats.notPassedPct)}`}
                >
                  <div
                    className={`h-full transition-[width] duration-700 ease-out ${toneStyles.success.bar}`}
                    style={{ width: `${stats.acceptedPct}%` }}
                  />
                  <div
                    className={`h-full transition-[width] duration-700 ease-out ${toneStyles.primary.bar}`}
                    style={{ width: `${stats.inProcessPct}%` }}
                  />
                  <div
                    className={`h-full transition-[width] duration-700 ease-out ${toneStyles.danger.bar}`}
                    style={{ width: `${stats.notPassedPct}%` }}
                  />
                </div>

                {stats.total > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-3 sm:gap-6">
                    <LegendItem
                      label="Accepted"
                      value={stats.accepted}
                      percent={stats.acceptedPct}
                      tone="success"
                    />
                    <LegendItem
                      label="In process"
                      value={stats.inProcess}
                      percent={stats.inProcessPct}
                      tone="primary"
                    />
                    <LegendItem
                      label="Rejected / dropped"
                      value={stats.notPassed}
                      percent={stats.notPassedPct}
                      tone="danger"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No applications yet. Open a recruitment batch to start
                    receiving applicants.
                  </p>
                )}
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Key Insights"
                description="Calculated from the figures above."
              />
              <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-1">
                <Insight
                  label="Pass rate"
                  value={
                    stats.accepted + data.rejectedApplications > 0
                      ? formatPercent(stats.passRate)
                      : "–"
                  }
                  description="Accepted out of accepted or rejected applications."
                />
                <Insight
                  label="Awaiting result"
                  value={formatNumber(stats.inProcess)}
                  description={`${formatPercent(stats.inProcessPct)} of applications are still being processed.`}
                />
              </div>
            </Panel>
          </div>

          {/* Active tasks */}
          <Panel>
            <PanelHeader
              title="Open Recruitments"
              description={
                activeTasks.length > 0
                  ? `Showing ${activeTasks.length} of ${batchesData?.totalItems ?? activeTasks.length} open batches with ${formatNumber(totalOpenCandidates)} active applications in the batches shown.`
                  : "Recruitment batches that are currently open."
              }
            />
            {isBatchesLoading ? (
              <div className="grid gap-3 px-5 pb-5 md:grid-cols-2">
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            ) : isBatchesError ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                Failed to load active tasks. Refresh to try again.
              </div>
            ) : activeTasks.length > 0 ? (
              <ul className="grid gap-3 px-5 pb-5 md:grid-cols-2">
                {activeTasks.map((task) => {
                  const load =
                    (task.openCandidateCount / maxOpenCandidates) * 100
                  return (
                    <li key={task.batchId}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/recruitments/$id",
                            params: { id: task.batchId },
                          })
                        }
                        className="group flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 truncate text-sm font-medium text-foreground">
                            {task.batchName}
                          </p>
                          <StatusBadge tone={task.statusTone}>
                            {task.statusLabel}
                          </StatusBadge>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Hourglass className="size-3.5" aria-hidden />
                              {task.openCandidateCount > 0
                                ? `${formatNumber(task.openCandidateCount)} open candidate${task.openCandidateCount > 1 ? "s" : ""}`
                                : "No open candidates"}
                            </span>
                            <span className="flex items-center gap-0.5 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                              View batch
                              <ChevronRight className="size-3.5" aria-hidden />
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary/70 transition-[width] duration-700 ease-out"
                              style={{ width: `${load}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  No active tasks at the moment
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Batches that are open for recruitment will show up here.
                </p>
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  )
}
