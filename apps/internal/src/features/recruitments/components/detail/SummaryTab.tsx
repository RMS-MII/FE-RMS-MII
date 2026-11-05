import type { Recruitment } from "../../types"
import { Panel } from "@/shared/components"
import { formatDate, formatNumber } from "@/shared/lib/format"
import { mockEmployees } from "../../data/mock"
import { candidates } from "@/data/mock"

export interface SummaryTabProps {
  recruitment: Recruitment
}

export function SummaryTab({ recruitment }: SummaryTabProps) {
  const rCands = candidates.filter((c) => c.recruitmentId === recruitment.id)
  const activeCount = rCands.filter(
    (c) => c.status === "in_progress" || c.status === "pending"
  ).length
  const outCount = rCands.filter(
    (c) => c.status === "rejected" || c.status === "withdrawn"
  ).length
  const owner =
    mockEmployees.find(
      (e) => e.id === recruitment.createdBy || e.id === recruitment.ownerId
    ) ?? mockEmployees[0]

  const rows: [string, React.ReactNode][] = [
    [
      "Batch Code",
      <span
        key="code"
        className="font-semibold text-foreground"
      >
        {recruitment.batchCode}
      </span>,
    ],
    ["Position", recruitment.name],
    ["Department", recruitment.departmentName || recruitment.division || "—"],
    [
      "Period",
      `${formatDate(recruitment.startDate || recruitment.openDate || "")} to ${formatDate(recruitment.endDate || recruitment.closeDate || "")}`,
    ],
    ["Person in Charge", owner?.fullName ?? "Fajar Mahendra"],
    [
      "Candidates",
      <span key="cands" className="tabular-nums">
        {formatNumber(rCands.length)} total, {activeCount} active, {outCount} out of process
      </span>,
    ],
    [
      "Description",
      <p key="desc" className="max-w-prose leading-relaxed text-foreground">
        {recruitment.description}
      </p>,
    ],
  ]

  return (
    <Panel>
      <dl className="divide-y divide-border">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-4 items-baseline"
          >
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="text-sm text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

