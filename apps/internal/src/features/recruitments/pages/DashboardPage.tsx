import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { BadgeCheck, Briefcase, UserX, Users } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  ErrorState,
  PageHeader,
  Panel,
  PanelHeader,
  StatCard,
  StatusBadge,
  type Tone,
} from "@/shared/components"
import { useBatchDashboard } from "../hooks"
import { useGetBatchesQuery } from "../api/recruitments-api"
import { getRecruitmentStatusMeta } from "../types"

interface ActiveTask {
  batchId: string
  batchName: string
  statusLabel: string
  statusTone: Tone
}

export function DashboardPage() {
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
      }
    })
  }, [batchesData])

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Dashboard"
        description="Recruitment pipeline overview: candidate totals, accepted hires, and employee headcount."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="rounded-full gap-2 cursor-pointer"
          >
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : isError || !data ? (
        <Panel>
          <ErrorState
            title="Failed to load dashboard"
            description="Unable to load the dashboard statistics right now. Please try again."
            onRetry={() => void refetch()}
          />
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Candidates"
              value={data.totalCandidates}
              icon={Users}
              tone="primary"
            />
            <StatCard
              label="Accepted Candidates"
              value={data.acceptedCandidates}
              icon={BadgeCheck}
              tone="success"
            />
            <StatCard
              label="Not Passed Candidates"
              value={data.notPassedCandidates}
              icon={UserX}
              tone="danger"
            />
            <StatCard
              label="Employee Count"
              value={data.employeeCount}
              icon={Briefcase}
              tone="neutral"
            />
          </div>

          <Panel>
            <PanelHeader
              title="Active Tasks"
              description="Recruitment batches that are currently open."
            />
            {isBatchesLoading ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                Loading active tasks...
              </div>
            ) : isBatchesError ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                Failed to load active tasks.
              </div>
            ) : activeTasks.length > 0 ? (
              <ul>
                {activeTasks.map((task) => (
                  <li
                    key={task.batchId}
                    className="border-b border-border last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/recruitments/$id",
                          params: { id: task.batchId },
                        })
                      }
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {task.batchName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Open recruitment task
                        </p>
                      </div>
                      <StatusBadge tone={task.statusTone}>
                        {task.statusLabel}
                      </StatusBadge>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                No active tasks at the moment.
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  )
}
