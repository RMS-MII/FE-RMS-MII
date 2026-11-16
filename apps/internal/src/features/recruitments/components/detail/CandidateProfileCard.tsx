import { Mail, Phone, FileText, ExternalLink } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { formatCurrency } from "@/shared/lib/format"
import { StatusBadge } from "@/shared/components"
import type { Tone } from "@/shared/components"
import type { CandidateApplicationItem } from "../../types"

export interface CandidateProfileCardProps {
  application: CandidateApplicationItem
}

function getWebUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null
  } catch {
    return null
  }
}

const statusToneMap: Record<string, Tone> = {
  passed: "success",
  accepted: "success",
  in_progress: "info",
  pending: "warning",
  failed: "danger",
  rejected: "danger",
  withdrawn: "neutral",
  upcoming: "neutral",
  dropped: "neutral",
  unknown: "neutral",
}

const statusLabelMap: Record<string, string> = {
  in_progress: "In Progress",
  passed: "Passed",
  failed: "Failed",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  upcoming: "Upcoming",
  dropped: "Dropped",
  unknown: "Unknown",
}

export function CandidateProfileCard({
  application,
}: CandidateProfileCardProps) {
  const cvUrl = getWebUrl(application.candidateCv)
  const portfolioUrl = getWebUrl(application.candidatePortfolio)

  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
      >
        {application.candidateName.charAt(0)}
      </span>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <h3 className="text-base leading-6 font-semibold break-words text-foreground">
              {application.candidateName}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {application.candidateEducation ||
                application.candidateInstitution ||
                "Education details not provided"}
            </p>
            {application.candidateEducation &&
              application.candidateInstitution && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {application.candidateInstitution}
                </p>
              )}
          </div>

          <StatusBadge tone={statusToneMap[application.status] || "neutral"}>
            {statusLabelMap[application.status] || application.status}
          </StatusBadge>
        </div>

        <p className="text-xs text-muted-foreground">
          Expected Salary {application.expectedSalary ? formatCurrency(application.expectedSalary) : "—"}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Mail className="size-3.5 shrink-0" aria-hidden />
            <a
              href={"mailto:" + application.candidateEmail}
              className="break-all transition-colors hover:text-primary"
            >
              {application.candidateEmail}
            </a>
          </span>

          {application.candidatePhone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5 shrink-0" aria-hidden />
              {application.candidatePhone}
            </span>
          )}

          {application.candidateGpa && (
            <span className="inline-flex items-center gap-1.5">
              GPA{" "}
              <span className="font-medium text-foreground tabular-nums">
                {application.candidateGpa}
              </span>
            </span>
          )}
        </div>

        {(application.candidateCv || application.candidatePortfolio) && (
          <div className="flex flex-wrap items-center gap-2">
            {cvUrl && (
              <Button
                nativeButton={false}
                render={<a href={cvUrl} target="_blank" rel="noreferrer" />}
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-full bg-card px-3 text-xs"
                title={application.candidateCv ?? undefined}
              >
                <FileText className="size-3.5" aria-hidden />
                View CV
              </Button>
            )}
            {application.candidateCv && !cvUrl && (
              <p className="text-xs break-all text-muted-foreground">
                CV: {application.candidateCv}
              </p>
            )}
            {portfolioUrl && (
              <Button
                nativeButton={false}
                render={
                  <a href={portfolioUrl} target="_blank" rel="noreferrer" />
                }
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-full bg-card px-3 text-xs"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                Portfolio
              </Button>
            )}
            {application.candidatePortfolio && !portfolioUrl && (
              <p className="text-xs break-all text-muted-foreground">
                Portfolio: {application.candidatePortfolio}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
