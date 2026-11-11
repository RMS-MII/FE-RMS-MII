import { Skeleton } from "@workspace/ui/components/skeleton"
import { Panel } from "@/shared/components"
import { formatDate, formatNumber } from "@/shared/lib/format"
import { useGetBatchApplicationsQuery } from "../../api/applications-api"
import { useGetEmployeesQuery } from "../../api/employees-api"
import type { Recruitment } from "../../types"

export interface SummaryTabProps {
  recruitment: Recruitment
}

export function SummaryTab({ recruitment }: SummaryTabProps) {
  const batchId = recruitment.id
  const totalQuery = useGetBatchApplicationsQuery({ id: batchId, pageSize: 1 })
  const activeQuery = useGetBatchApplicationsQuery({ id: batchId, status: 1, pageSize: 1 })
  const rejectedQuery = useGetBatchApplicationsQuery({ id: batchId, status: 2, pageSize: 1 })
  const droppedQuery = useGetBatchApplicationsQuery({ id: batchId, status: 3, pageSize: 1 })
  const employeesQuery = useGetEmployeesQuery(
    { activeOnly: false },
    { skip: !recruitment.createdBy }
  )

  const countsLoading = [totalQuery, activeQuery, rejectedQuery, droppedQuery]
    .some((query) => query.isLoading)
  const countsError = [totalQuery, activeQuery, rejectedQuery, droppedQuery]
    .some((query) => query.isError)
  const { data: total } = totalQuery
  const { data: active } = activeQuery
  const { data: rejected } = rejectedQuery
  const { data: dropped } = droppedQuery
  const owner = employeesQuery.data?.find(
    (employee) => employee.id.toLowerCase() === recruitment.createdBy?.toLowerCase()
  )

  const rows: [string, React.ReactNode][] = [
    [
      "Batch Code",
      <span key="code" className="font-semibold text-foreground">
        {recruitment.batchCode}
      </span>,
    ],
    ["Position", recruitment.name],
    ["Department", recruitment.departmentName || "—"],
    [
      "Period",
      recruitment.startDate && recruitment.endDate
        ? `${formatDate(recruitment.startDate)} to ${formatDate(recruitment.endDate)}`
        : "—",
    ],
    [
      "Person in Charge",
      employeesQuery.isLoading
        ? <Skeleton key="owner-loading" className="h-4 w-40" />
        : owner?.fullName ?? "—",
    ],
    [
      "Candidates",
      countsLoading
        ? <Skeleton key="candidates-loading" className="h-4 w-72 max-w-full" />
        : countsError || !total || !active || !rejected || !dropped
          ? "Unable to load candidate counts"
          : <span key="candidates" className="tabular-nums">
              {formatNumber(total.totalItems)} total, {formatNumber(active.totalItems)} active, {formatNumber(rejected.totalItems + dropped.totalItems)} out of process
            </span>,
    ],
    [
      "Description",
      <p key="desc" className="max-w-prose leading-relaxed text-foreground">
        {recruitment.description || "—"}
      </p>,
    ],
  ]

  return (
    <Panel>
      <dl className="divide-y divide-border">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid items-baseline gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-4"
          >
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="text-sm text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
