import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { CirclePlay, CircleStop } from "lucide-react"
import type { Recruitment } from "../../types"
import { getRecruitmentStatusMeta } from "../../types"
import { StatusBadge, BackButton } from "@/shared/components"
import { formatDate } from "@/shared/lib/format"
import { OpenRecruitmentDialog } from "../OpenRecruitmentDialog"
import { CloseRecruitmentDialog } from "../CloseRecruitmentDialog"

export interface RecruitmentDetailHeaderProps {
  recruitment: Recruitment
}

export function RecruitmentDetailHeader({
  recruitment,
}: RecruitmentDetailHeaderProps) {
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const statusMeta = getRecruitmentStatusMeta(recruitment.status)

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
          {recruitment.name}, division {recruitment.departmentName || recruitment.division || "General"}. Open{" "}
          {formatDate(recruitment.startDate || recruitment.openDate || "")} to{" "}
          {formatDate(recruitment.endDate || recruitment.closeDate || "")}.
        </p>
      </div>

      {statusMeta.label === "Draft" && (
        <Button
          type="button"
          onClick={() => setIsOpenDialogOpen(true)}
          className="ml-auto shrink-0 gap-2 rounded-full"
        >
          <CirclePlay className="size-4" aria-hidden />
          Open Recruitment
        </Button>
      )}
      {statusMeta.label === "Open" && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsCloseDialogOpen(true)}
          className="ml-auto shrink-0 gap-2 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <CircleStop className="size-4" aria-hidden />
          Close Recruitment
        </Button>
      )}

      <OpenRecruitmentDialog
        recruitment={recruitment}
        open={isOpenDialogOpen}
        onOpenChange={setIsOpenDialogOpen}
        onSuccess={() => setIsOpenDialogOpen(false)}
      />
      <CloseRecruitmentDialog
        recruitment={recruitment}
        open={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        onSuccess={() => setIsCloseDialogOpen(false)}
      />
    </div>
  )
}

