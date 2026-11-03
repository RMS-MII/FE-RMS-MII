import { ArrowLeft } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import type { Recruitment } from "../../types"
import { StatusBadge } from "@/shared/components"
import { formatDate } from "@/shared/lib/format"
import { recruitmentStatusMeta } from "../../data/mock"
import { Button } from "@workspace/ui/components/button"

export interface RecruitmentDetailHeaderProps {
  recruitment: Recruitment
}

export function RecruitmentDetailHeader({
  recruitment,
}: RecruitmentDetailHeaderProps) {
  const navigate = useNavigate()
  const statusMeta = recruitmentStatusMeta[recruitment.status]

  return (
    <div className="flex items-start gap-3.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate({ to: "/recruitments" })}
        aria-label="Back to recruitments list"
        title="Back to recruitments list"
        className="mt-0.5 size-10 shrink-0 rounded-full border-0 bg-gray-200 text-foreground transition-all duration-150 hover:bg-muted hover:text-primary cursor-pointer shadow-none focus-visible:ring-2 focus-visible:ring-primary outline-none"
      >
        <ArrowLeft className="size-4.5" strokeWidth={2} aria-hidden />
      </Button>

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

