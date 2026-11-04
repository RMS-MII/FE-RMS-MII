import type { Recruitment } from "../../types"
import { StatusBadge, BackButton } from "@/shared/components"
import { formatDate } from "@/shared/lib/format"
import { recruitmentStatusMeta } from "../../data/mock"

export interface RecruitmentDetailHeaderProps {
  recruitment: Recruitment
}

export function RecruitmentDetailHeader({
  recruitment,
}: RecruitmentDetailHeaderProps) {
  const statusMeta = recruitmentStatusMeta[recruitment.status]

  return (
    <div className="flex items-start gap-3.5">
      <BackButton to="/recruitments" label="Back to recruitments list" />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {recruitment.name}
          </h1>
          <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
        </div>

        <p className="text-sm text-muted-foreground">
          {recruitment.name}, division {recruitment.division}. Open{" "}
          {formatDate(recruitment.openDate)} to {formatDate(recruitment.closeDate)}.
        </p>
      </div>
    </div>
  )
}

