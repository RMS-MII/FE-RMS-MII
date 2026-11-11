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
} from "@/shared/components"
import { useBatchDashboard } from "../hooks"
import { useGetCandidatesQuery } from "@/features/candidates/api/candidates-api"
import { mapBatchStatusDto } from "@/features/candidates/hooks"

interface ActiveTask {
  candidateId: string
  batchId: string
  batchName: string
  candidateName: string
  status: string
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useBatchDashboard()
  const { data: candidatesData } = useGetCandidatesQuery()

  const activeTasks = useMemo<ActiveTask[]>(() => {
    const tasks: ActiveTask[] = []

    for (const item of candidatesData?.items ?? []) {
      for (const batch of item.assignedBatches ?? []) {
        const status = mapBatchStatusDto(batch.applicationStatus)
        if (status === "In Progress") {
          tasks.push({
            candidateId: item.id,
            batchId: batch.batchId,
            batchName: batch.batchName,
            candidateName: item.fullName,
            status,
          })
        }
      }
    }

    return tasks
  }, [candidatesData])

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
              description="Candidates currently in an active recruitment batch."
            />
            {activeTasks.length > 0 ? (
              <ul>
                {activeTasks.map((task) => (
                  <li
                    key={`${task.candidateId}-${task.batchId}`}
                    className="border-b border-border last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/candidates/$id",
                          params: { id: task.candidateId },
                        })
                      }
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {task.candidateName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {task.batchName}
                        </p>
                      </div>
                      <StatusBadge tone="info">{task.status}</StatusBadge>
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
