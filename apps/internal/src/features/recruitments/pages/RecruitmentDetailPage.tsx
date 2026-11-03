import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { PageHeader, Panel, StatusBadge } from "@/shared/components"
import { formatPeriod } from "@/shared/lib/format"
import { initialRecruitments, recruitmentStatusMeta } from "../data/mock"

export interface RecruitmentDetailPageProps {
  id: string
}

export function RecruitmentDetailPage({ id }: RecruitmentDetailPageProps) {
  const navigate = useNavigate()

  const recruitment = useMemo(() => {
    return initialRecruitments.find((r) => r.id === id) ?? null
  }, [id])

  if (!recruitment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Recruitment Not Found"
          description={`No recruitment exists with ID "${id}".`}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/recruitments" })}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Recruitments</span>
            </Button>
          }
        />
      </div>
    )
  }

  const statusMeta = recruitmentStatusMeta[recruitment.status]

  return (
    <div className="space-y-6">
      <PageHeader
        title={recruitment.name}
        description={`${recruitment.division}`}
        badge={
          <StatusBadge tone={statusMeta.tone}>
            {statusMeta.label}
          </StatusBadge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/recruitments" })}
            className="gap-1.5"
          >
            <ArrowLeft className="size-4" />
            <span>Back</span>
          </Button>
        }
      />

      <Panel className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-border pb-6">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Recruitment Code</span>
            <p className="mt-1 font-mono text-sm font-semibold">{recruitment.code}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Period</span>
            <p className="mt-1 text-sm font-medium">
              {formatPeriod(recruitment.openDate, recruitment.closeDate)}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Target Quota</span>
            <p className="mt-1 text-sm font-medium">{recruitment.quota} candidates</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recruitment.description}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Selection Stages</h3>
          <ol className="divide-y divide-border rounded-xl border border-border">
            {recruitment.stages.map((stage, idx) => (
              <li
                key={stage.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-foreground">{stage.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Duration: {stage.durationDays} days
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Panel>
    </div>
  )
}

