import { Mail, Phone, FileText, ExternalLink } from "lucide-react"
import { StatusBadge } from "@/shared/components"
import type { CandidateApplicationItem } from "../../types"

export interface CandidateProfileCardProps {
  application: CandidateApplicationItem
}

const statusToneMap: Record<string, "success" | "warning" | "info" | "danger" | "neutral"> = {
  passed: "success",
  accepted: "success",
  in_progress: "info",
  pending: "warning",
  failed: "danger",
  rejected: "danger",
  withdrawn: "neutral",
  upcoming: "neutral",
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
}

export function CandidateProfileCard({ application }: CandidateProfileCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-muted/40 p-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
        {application.candidateName.charAt(0)}
      </span>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {application.candidateName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {application.candidateEducation || "No educational details provided"}
            </p>
          </div>

          <StatusBadge tone={statusToneMap[application.status] || "neutral"}>
            {statusLabelMap[application.status] || application.status}
          </StatusBadge>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
          <span className="inline-flex items-center gap-1.5">
            <Mail className="size-3.5 shrink-0" />
            <a
              href={`mailto:${application.candidateEmail}`}
              className="hover:text-primary transition-colors truncate max-w-56"
            >
              {application.candidateEmail}
            </a>
          </span>

          {application.candidatePhone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5 shrink-0" />
              <span>{application.candidatePhone}</span>
            </span>
          )}

          {application.candidateGpa && (
            <span className="inline-flex items-center gap-1 font-mono text-muted-foreground">
              <span>GPA</span>
              <strong className="text-foreground">{application.candidateGpa}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          {application.candidateCv && (
            <a
              href={`#${application.candidateCv}`}
              title={application.candidateCv}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <FileText className="size-3.5 text-primary" />
              <span>View CV</span>
            </a>
          )}

          {application.candidatePortfolio && (
            <a
              href={application.candidatePortfolio}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="size-3.5 text-primary" />
              <span>Portfolio</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

