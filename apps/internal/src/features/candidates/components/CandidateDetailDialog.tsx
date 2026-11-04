import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CancelButton, StatusBadge } from "@/shared/components"
import { formatCurrency, safeFormatDate } from "@/shared/lib/format"
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ExternalLink,
} from "lucide-react"
import type { Candidate } from "../types"

export interface CandidateDetailDialogProps {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CandidateDetailDialog({
  candidate,
  open,
  onOpenChange,
}: CandidateDetailDialogProps) {
  if (!candidate) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Candidate Profile</DialogTitle>
          <DialogDescription>
            Detailed information from the candidate record and application history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Profile Header Box */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-muted/40 p-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
              {candidate.fullName.charAt(0)}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-foreground truncate">
                  {candidate.fullName}
                </h3>
                {candidate.gender && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {candidate.gender}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground pt-1">
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Mail className="size-3.5 shrink-0" />
                  <a
                    href={`mailto:${candidate.email}`}
                    className="hover:text-primary transition-colors truncate"
                  >
                    {candidate.email}
                  </a>
                </span>
                {candidate.phoneNumber && (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Phone className="size-3.5 shrink-0" />
                    <span>{candidate.phoneNumber}</span>
                  </span>
                )}
                {candidate.birthDate && (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Calendar className="size-3.5 shrink-0" />
                    <span>Born: {safeFormatDate(candidate.birthDate)}</span>
                  </span>
                )}
                {candidate.address && (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{candidate.address}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Education & Compensation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Education Card */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <span>Education</span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {candidate.education || "-"}
              </p>
              <p className="text-muted-foreground">{candidate.institution || "-"}</p>
              {candidate.gpa && (
                <div className="pt-1">
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    GPA: {candidate.gpa} / 4.00
                  </span>
                </div>
              )}
            </div>

            {/* Compensation & Documents */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <span>Expected Salary</span>
              </div>
              <p className="text-sm font-bold text-foreground">
                {candidate.expectedSalary
                  ? formatCurrency(candidate.expectedSalary)
                  : "Negotiable / Not specified"}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2">
                {candidate.cv ? (
                  <a
                    href={`#${candidate.cv}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <FileText className="size-3 text-primary" />
                    <span>View CV</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-muted-foreground">No CV uploaded</span>
                )}

                {candidate.portfolio && (
                  <a
                    href={candidate.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="size-3 text-primary" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Registered Batches (BatchApplications 1:N) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Applied Recruitment Batches ({candidate.appliedBatchCount})</span>
              </h4>
            </div>

            {candidate.appliedBatches && candidate.appliedBatches.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {candidate.appliedBatches.map((b) => (
                  <div
                    key={b.batchId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-2.5 text-xs transition-colors hover:bg-muted/20"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {b.batchName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {b.batchCode} • Applied: {safeFormatDate(b.appliedAt)}
                      </p>
                    </div>

                    <StatusBadge
                      tone={
                        b.status === "Accepted"
                          ? "success"
                          : b.status === "In Progress"
                          ? "info"
                          : b.status === "Rejected"
                          ? "danger"
                          : "neutral"
                      }
                    >
                      {b.status}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                This candidate has not applied to any recruitment batches yet (Talent Pool).
              </div>
            )}
          </div>
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
