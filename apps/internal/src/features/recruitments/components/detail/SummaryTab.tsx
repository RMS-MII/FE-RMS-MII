import { Skeleton } from "@workspace/ui/components/skeleton"
import { RichText } from "@workspace/ui/components/rich-text"
import { Panel } from "@/shared/components"
import { formatDate, formatNumber } from "@/shared/lib/format"
import { safeFormatWibDateTime } from "@/shared/lib/utcDateTime"
import { useGetBatchSummaryQuery } from "../../api/recruitments-api"
import type { Recruitment } from "../../types"

export interface SummaryTabProps {
  recruitment: Recruitment
}

export function SummaryTab({ recruitment }: SummaryTabProps) {
  const batchId = recruitment.id
  const { data: summary, isLoading: countsLoading, isError: countsError } = useGetBatchSummaryQuery(batchId)

  const rows: [string, React.ReactNode][] = [
    [
      "Batch Code",
      <span key="code" className="font-semibold text-foreground">
        {recruitment.batchCode}
      </span>,
    ],
    ["Position", recruitment.name],
    ["Department", recruitment.departmentName || "—"],
    ["Application Deadline", safeFormatWibDateTime(recruitment.applicationDeadlineAt, "Not set")],
    [
      "Period",
      recruitment.startDate && recruitment.endDate
        ? `${formatDate(recruitment.startDate)} to ${formatDate(recruitment.endDate)}`
        : "—",
    ],
    [
      "Person in Charge",
      countsLoading
        ? <Skeleton key="owner-loading" className="h-4 w-40" />
        : summary?.ownerName ?? "—",
    ],
    [
      "Candidates",
      countsLoading
        ? <Skeleton key="candidates-loading" className="h-4 w-72 max-w-full" />
        : countsError || !summary
          ? "Unable to load candidate counts"
          : <span key="candidates" className="tabular-nums">
              {formatNumber(summary.totalCandidates)} total, {formatNumber(summary.activeCandidates)} active, {formatNumber(summary.rejectedCandidates + summary.droppedCandidates)} out of process
            </span>,
    ],
    [
      "Description",
      <RichText
        key="desc"
        value={recruitment.description || "—"}
        className="max-w-prose leading-relaxed text-foreground"
      />,
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
