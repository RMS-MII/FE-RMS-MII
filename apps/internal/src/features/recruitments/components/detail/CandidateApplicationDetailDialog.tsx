import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CancelButton, StatusBadge } from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
import {
  Mail,
  Phone,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Circle,
  Download,
} from "lucide-react"
import type { CandidateApplicationItem, Recruitment } from "../../types"

export interface CandidateApplicationDetailDialogProps {
  application: CandidateApplicationItem | null
  recruitment: Recruitment
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function CandidateApplicationDetailDialog({
  application,
  recruitment,
  open,
  onOpenChange,
}: CandidateApplicationDetailDialogProps) {
  if (!application) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Application Details</DialogTitle>
            <span className="font-mono text-xs font-semibold rounded-md bg-muted px-2 py-0.5 text-foreground">
              {application.codeApplication}
            </span>
          </div>
          <DialogDescription>
            {recruitment.name} ({recruitment.batchCode}) • Applied on {safeFormatDate(application.appliedAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3.5 rounded-2xl bg-muted/40 p-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
              {application.candidateName.charAt(0)}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {application.candidateName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {application.candidateEducation || "No education information"}
                  </p>
                </div>

                <StatusBadge tone={statusToneMap[application.status] || "neutral"}>
                  {statusLabelMap[application.status] || application.status}
                </StatusBadge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5 shrink-0" />
                  <a
                    href={`mailto:${application.candidateEmail}`}
                    className="hover:text-primary transition-colors"
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
              </div>

              {/* Document Shortcuts */}
              <div className="flex items-center gap-2 pt-2">
                {application.candidateCv && (
                  <a
                    href={`#${application.candidateCv}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <FileText className="size-3 text-primary" />
                    <span>View CV</span>
                  </a>
                )}
                {application.candidatePortfolio && (
                  <a
                    href={application.candidatePortfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="size-3 text-primary" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Selection Stages Progress
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Application stages history from Document/ERD.sql (ApplicationStage)
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                Current: <span className="font-semibold text-foreground">{application.currentStageName}</span>
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {application.applicationStages.map((stg) => {
                const isPassed = stg.status === "passed"
                const isInProgress = stg.status === "in_progress"
                const isFailed = stg.status === "failed"
                const isPending = stg.status === "pending"

                return (
                  <div key={stg.stageId} className="relative group">
                    <div className="absolute -left-3.5 flex size-5 -translate-x-1/2 items-center justify-center rounded-full bg-card ring-4 ring-card">
                      {isPassed && <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />}
                      {isInProgress && <Clock className="size-4 text-blue-500 fill-blue-50 dark:fill-blue-950" />}
                      {isFailed && <XCircle className="size-4 text-rose-500 fill-rose-50 dark:fill-rose-950" />}
                      {isPending && <AlertCircle className="size-4 text-amber-500 fill-amber-50 dark:fill-amber-950" />}
                      {stg.status === "upcoming" && <Circle className="size-3 text-muted-foreground/40" />}
                      {stg.status === "withdrawn" && <XCircle className="size-4 text-muted-foreground" />}
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs space-y-1.5 transition-colors group-hover:bg-muted/40">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            Stage {stg.stageIndex + 1}: {stg.stageName}
                          </span>
                          {stg.stageType && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase font-medium text-muted-foreground">
                              {stg.stageType}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {stg.totalScore !== null && (
                            <span className="inline-flex items-center gap-1  text-[12px] font-medium text-foreground bg-muted px-2 py-0.5 rounded-full">
                              <span>Score: {stg.totalScore}</span>
                              {stg.passingScore && (
                                <span className="text-muted-foreground font-normal">/ {stg.passingScore}</span>
                              )}
                            </span>
                          )}

                          <StatusBadge tone={statusToneMap[stg.status] || "neutral"}>
                            {statusLabelMap[stg.status] || stg.status}
                          </StatusBadge>
                        </div>
                      </div>

                      {stg.notes && (
                        <p className="text-[11px] text-muted-foreground italic">
                          "{stg.notes}"
                        </p>
                      )}

                      {(stg.startedAt || stg.completedAt) && (
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                          {stg.startedAt && <span>Started: {safeFormatDate(stg.startedAt)}</span>}
                          {stg.completedAt && <span>Completed: {safeFormatDate(stg.completedAt)}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {application.fileOfferingLetter && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <FileText className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Offering Letter Available
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {application.fileOfferingLetter} • Status: {application.offeringLetterStatus || "Issued"}
                  </p>
                </div>
              </div>

              <a
                href={`#${application.fileOfferingLetter}`}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                <Download className="size-3.5" />
                <span>Download</span>
              </a>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 bg-white">
          <CancelButton onClick={() => onOpenChange(false)}>
            Close
          </CancelButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

