import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  BadgeCheck,
  Briefcase,
  ChevronRight,
  Flame,
  Hourglass,
  Layers,
  RefreshCw,
  TrendingUp,
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

interface WorkloadLevel {
  label: string
  tone: KpiTone
}

interface ActiveTask {
  batchId: string
  batchName: string
  statusLabel: string
  statusTone: Tone
  openCandidateCount: number
  /** Share of all open candidates across active batches (0-100) */
  sharePct: number
  /** Load relative to the busiest batch (0-100) */
  loadPct: number
  /** 1-based position when sorted by open candidates */
  rank: number
  workload: WorkloadLevel
}

/* --------------------------------- Helpers -------------------------------- */

const numberFormat = new Intl.NumberFormat("en-US")

const formatNumber = (value: number) => numberFormat.format(value)

const toPercent = (part: number, whole: number) =>
  whole > 0 ? (part / whole) * 100 : 0

const formatPercent = (value: number) =>
  `${value >= 10 || value === 0 ? Math.round(value) : value.toFixed(1)}%`

const getWorkload = (loadPct: number, count: number): WorkloadLevel => {
  if (count === 0) return { label: "Idle", tone: "neutral" }
  if (loadPct >= 75) return { label: "High workload", tone: "danger" }
  if (loadPct >= 40) return { label: "Medium workload", tone: "primary" }
  return { label: "Low workload", tone: "success" }
}

const toneStyles: Record<
  KpiTone,
  { chip: string; bar: string; dot: string; stroke: string }
> = {
  primary: {
    chip: "bg-primary/10 text-primary",
    bar: "bg-primary",
    dot: "bg-primary",
    stroke: "stroke-primary",
  },
  success: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    stroke: "stroke-emerald-500",
  },
  danger: {
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    stroke: "stroke-rose-500",
  },
  neutral: {
    chip: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground/60",
    dot: "bg-muted-foreground/60",
    stroke: "stroke-muted-foreground/60",
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
          <Icon className="size-[18px]" aria-hidden />
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

interface PieSlice {
  label: string
  value: number
  tone: KpiTone
}

interface PieChartProps {
  slices: PieSlice[]
  /** Teks besar di tengah donut */
  centerValue: string
  /** Teks kecil di bawah centerValue */
  centerLabel: string
  className?: string
}

function PieChart({
  slices,
  centerValue,
  centerLabel,
  className = "size-44",
}: PieChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const ariaLabel = slices
    .map(
      (slice) =>
        `${slice.label} ${formatPercent(toPercent(slice.value, total))}`
    )
    .join(", ")

  let offset = 0

  return (
    <div className={`relative shrink-0 ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="size-full -rotate-90"
        role="img"
        aria-label={total > 0 ? ariaLabel : "No data"}
      >
        {/* Track */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          strokeWidth="28"
          className="stroke-muted"
        />
        {total > 0 &&
          slices.map((slice) => {
            const pct = (slice.value / total) * 100
            if (pct <= 0) return null
            const currentOffset = offset
            offset += pct
            return (
              <circle
                key={slice.label}
                cx="100"
                cy="100"
                r="70"
                fill="none"
                strokeWidth="28"
                pathLength={100}
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={-currentOffset}
                className={`${toneStyles[slice.tone].stroke} transition-all duration-700 ease-out`}
              >
                <title>{`${slice.label}: ${formatNumber(slice.value)} (${formatPercent(pct)})`}</title>
              </circle>
            )
          })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {centerValue}
        </span>
        <span className="text-xs text-muted-foreground">{centerLabel}</span>
      </div>
    </div>
  )
}

interface SummaryTileProps {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
}

function SummaryTile({ icon: Icon, label, value, hint }: SummaryTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold leading-tight text-foreground tabular-nums">
          {value}
        </p>
        {hint && (
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
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
    const base = (batchesData?.items ?? []).map((batch) => {
      const statusMeta = getRecruitmentStatusMeta(batch.status)
      return {
        batchId: batch.id,
        batchName: batch.name,
        statusLabel: statusMeta.label,
        statusTone: statusMeta.tone,
        openCandidateCount: batch.activeCandidateCount ?? 0,
      }
    })

    // Busiest batch first
    base.sort((a, b) => b.openCandidateCount - a.openCandidateCount)

    const total = base.reduce((sum, task) => sum + task.openCandidateCount, 0)
    const max = Math.max(1, ...base.map((task) => task.openCandidateCount))

    return base.map((task, index) => {
      const loadPct = (task.openCandidateCount / max) * 100
      return {
        ...task,
        sharePct: toPercent(task.openCandidateCount, total),
        loadPct,
        rank: index + 1,
        workload: getWorkload(loadPct, task.openCandidateCount),
      }
    })
  }, [batchesData])

  const totalOpenCandidates = useMemo(
    () => activeTasks.reduce((sum, task) => sum + task.openCandidateCount, 0),
    [activeTasks]
  )

  const averageOpenCandidates =
    activeTasks.length > 0 ? totalOpenCandidates / activeTasks.length : 0

  const busiestTask =
    activeTasks.length > 0 && activeTasks[0].openCandidateCount > 0
      ? activeTasks[0]
      : null

  const stats = useMemo(() => {
    if (!data) return null
    const total = data.totalCandidates
    const accepted = data.acceptedCandidates
    const notPassed = data.notPassedCandidates
    const inProcess = Math.max(0, total - accepted - notPassed)
    const decided = accepted + notPassed

    return {
      total,
      accepted,
      notPassed,
      inProcess,
      decided,
      acceptedPct: toPercent(accepted, total),
      notPassedPct: toPercent(notPassed, total),
      inProcessPct: toPercent(inProcess, total),
      // Pass rate among candidates whose result is already final
      passRate: toPercent(accepted, decided),
      decidedPct: toPercent(decided, total),
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
        description={`${today}. Recruitment pipeline overview: candidate totals, accepted hires, and employee headcount.`}
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
              label="Total Candidates"
              value={stats.total}
              icon={Users}
              tone="primary"
              hint={`${formatNumber(stats.inProcess)} still in process`}
              share={stats.decidedPct}
            />
            <KpiCard
              label="Accepted Candidates"
              value={stats.accepted}
              icon={BadgeCheck}
              tone="success"
              hint={`${formatPercent(stats.acceptedPct)} of all candidates`}
              share={stats.acceptedPct}
            />
            <KpiCard
              label="Not Passed Candidates"
              value={stats.notPassed}
              icon={UserX}
              tone="danger"
              hint={`${formatPercent(stats.notPassedPct)} of all candidates`}
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
            <Panel className="flex flex-col lg:col-span-2">
              <PanelHeader
                title="Candidate Pipeline"
                description="How all candidates are distributed by outcome."
              />
              <div className="flex flex-1 flex-col justify-between gap-6 px-5 pb-5">
                {stats.total > 0 ? (
                  <>
                    <div className="flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
                      <PieChart
                        className="size-48"
                        centerValue={formatNumber(stats.total)}
                        centerLabel="Candidates"
                        slices={[
                          {
                            label: "Accepted",
                            value: stats.accepted,
                            tone: "success",
                          },
                          {
                            label: "In process",
                            value: stats.inProcess,
                            tone: "primary",
                          },
                          {
                            label: "Not passed",
                            value: stats.notPassed,
                            tone: "danger",
                          },
                        ]}
                      />
                      <div className="w-full flex-1 space-y-3">
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
                          label="Not passed"
                          value={stats.notPassed}
                          percent={stats.notPassedPct}
                          tone="danger"
                        />
                      </div>
                    </div>

                    {/* Footer: decision progress fills the remaining height */}
                    <div className="space-y-2 border-t border-border pt-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                          Decision progress
                        </span>
                        <span className="tabular-nums text-foreground">
                          {formatNumber(stats.decided)} of{" "}
                          {formatNumber(stats.total)} decided (
                          {formatPercent(stats.decidedPct)})
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Decision progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(stats.decidedPct)}
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                          style={{ width: `${Math.min(100, stats.decidedPct)}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No candidates yet. Open a recruitment batch to start
                    receiving applicants.
                  </p>
                )}
              </div>
            </Panel>

            <Panel className="flex flex-col">
              <PanelHeader
                title="Key Insights"
                description="Calculated from the figures above."
              />
              <div className="flex flex-1 flex-col justify-between gap-4 px-5 pb-5">
                <div className="flex flex-1 flex-col items-center justify-center gap-3">
                  <PieChart
                    className="size-40"
                    centerValue={
                      stats.decided > 0 ? formatPercent(stats.passRate) : "–"
                    }
                    centerLabel="Pass rate"
                    slices={[
                      {
                        label: "Accepted",
                        value: stats.accepted,
                        tone: "success",
                      },
                      {
                        label: "Not passed",
                        value: stats.notPassed,
                        tone: "danger",
                      },
                    ]}
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    Accepted out of candidates with a final result.
                  </p>
                </div>

                <Insight
                  label="Awaiting result"
                  value={formatNumber(stats.inProcess)}
                  description={`${formatPercent(stats.inProcessPct)} of candidates are still being processed.`}
                />
              </div>
            </Panel>
          </div>

          {/* Active tasks */}
          <Panel>
            <PanelHeader
              title="Active Tasks"
              description="Open recruitment batches, sorted by the number of candidates waiting for action."
            />

            {isBatchesLoading ? (
              <div className="space-y-3 px-5 pb-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-xl bg-muted"
                    />
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="h-36 animate-pulse rounded-xl bg-muted"
                    />
                  ))}
                </div>
              </div>
            ) : isBatchesError ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                Failed to load active tasks. Refresh to try again.
              </div>
            ) : activeTasks.length > 0 ? (
              <div className="space-y-4 px-5 pb-5">
                {/* Summary strip */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <SummaryTile
                    icon={Layers}
                    label="Open batches"
                    value={formatNumber(activeTasks.length)}
                    hint="Currently accepting candidates"
                  />
                  <SummaryTile
                    icon={Hourglass}
                    label="Open candidates"
                    value={formatNumber(totalOpenCandidates)}
                    hint={`≈ ${averageOpenCandidates.toFixed(1)} per batch`}
                  />
                  <SummaryTile
                    icon={TrendingUp}
                    label="Busiest batch"
                    value={
                      busiestTask
                        ? `${formatNumber(busiestTask.openCandidateCount)} candidates`
                        : "–"
                    }
                    hint={busiestTask ? busiestTask.batchName : "No open candidates"}
                  />
                </div>

                {/* Batch cards */}
                <ul className="grid gap-3 md:grid-cols-2">
                  {activeTasks.map((task) => {
                    const isBusiest = busiestTask?.batchId === task.batchId
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
                          className="group flex h-full w-full cursor-pointer flex-col gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {/* Title row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground tabular-nums">
                                {task.rank}
                              </span>
                              <p className="min-w-0 truncate text-sm font-medium text-foreground">
                                {task.batchName}
                              </p>
                            </div>
                            <StatusBadge tone={task.statusTone}>
                              {task.statusLabel}
                            </StatusBadge>
                          </div>

                          {/* Metrics row */}
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-2xl font-semibold leading-none tracking-tight text-foreground tabular-nums">
                                {formatNumber(task.openCandidateCount)}
                              </p>
                              <p className="mt-1.5 text-xs text-muted-foreground">
                                {task.openCandidateCount === 0
                                  ? "No open candidates"
                                  : task.openCandidateCount === 1
                                    ? "open candidate"
                                    : "open candidates"}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              {isBusiest && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                  <Flame className="size-3" aria-hidden />
                                  Busiest
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${toneStyles[task.workload.tone].chip}`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${toneStyles[task.workload.tone].dot}`}
                                  aria-hidden
                                />
                                {task.workload.label}
                              </span>
                            </div>
                          </div>

                          {/* Load bar */}
                          <div className="space-y-1.5">
                            <div
                              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                              role="progressbar"
                              aria-label={`${task.batchName} workload`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={Math.round(task.loadPct)}
                            >
                              <div
                                className={`h-full rounded-full transition-[width] duration-700 ease-out ${toneStyles[task.workload.tone].bar}`}
                                style={{ width: `${task.loadPct}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {formatPercent(task.sharePct)} of all open
                                candidates
                              </span>
                              <span className="tabular-nums">
                                #{task.rank} of {activeTasks.length}
                              </span>
                            </div>
                          </div>

                          {/* Footer action */}
                          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs">
                            <span className="text-muted-foreground">
                              {task.openCandidateCount > 0
                                ? "Candidates are waiting for review"
                                : "Nothing to review right now"}
                            </span>
                            <span className="flex items-center gap-0.5 font-medium text-primary">
                              View batch
                              <ChevronRight
                                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                                aria-hidden
                              />
                            </span>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
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