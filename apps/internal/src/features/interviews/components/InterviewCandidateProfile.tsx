import { ExternalLink, FileText, Mail, MapPin, Phone } from "lucide-react"
import { Panel } from "@/shared/components"
import { mapGenderDto } from "@/features/candidates/hooks/useCandidatesList"
import type { CandidateWithBatchesDto } from "@/features/candidates/types"
import { formatCurrency, safeFormatDate } from "@/shared/lib/format"

type CandidateProfile = Omit<CandidateWithBatchesDto, "assignedBatches">

function isWebLink(value: string | null | undefined) {
  return Boolean(value && /^https?:\/\//i.test(value))
}

export function InterviewCandidateProfile({
  candidate,
}: {
  candidate: CandidateProfile
}) {
  const cv = candidate.cv?.trim()
  const portfolio = candidate.portfolio?.trim()

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {candidate.fullName.charAt(0)}
          </span>
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              {candidate.fullName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mapGenderDto(candidate.gender) || "Gender unavailable"}
              {candidate.birthDate
                ? ` · Born ${safeFormatDate(candidate.birthDate)}`
                : ""}
            </p>
            <a
              href={`mailto:${candidate.email}`}
              className="flex items-center gap-2 text-sm break-all text-primary hover:underline"
            >
              <Mail className="size-4 shrink-0" />
              {candidate.email}
            </a>
            {candidate.phoneNumber && (
              <p className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                {candidate.phoneNumber}
              </p>
            )}
            {candidate.address && (
              <p className="flex items-start gap-2 text-sm text-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {candidate.address}
              </p>
            )}
          </div>
        </div>
        <dl className="grid flex-1 gap-x-8 gap-y-4 border-t border-border pt-5 text-sm sm:grid-cols-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <div>
            <dt className="text-muted-foreground">Education</dt>
            <dd className="mt-1 font-medium text-foreground">
              {candidate.education || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Institution</dt>
            <dd className="mt-1 font-medium text-foreground">
              {candidate.institution || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">GPA</dt>
            <dd className="mt-1 font-medium text-foreground">
              {candidate.gpa ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Expected salary</dt>
            <dd className="mt-1 font-medium text-foreground">
              {candidate.expectedSalary
                ? formatCurrency(candidate.expectedSalary)
                : "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Registered</dt>
            <dd className="mt-1 font-medium text-foreground">
              {safeFormatDate(candidate.createdAt)}
            </dd>
          </div>
          {candidate.updatedAt && (
            <div>
              <dt className="text-muted-foreground">Profile updated</dt>
              <dd className="mt-1 font-medium text-foreground">
                {safeFormatDate(candidate.updatedAt)}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground">Documents</dt>
            <dd className="mt-1 flex flex-wrap gap-3">
              {cv && (isWebLink(cv) ? (
                <a
                  href={cv}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <FileText className="size-4" />
                  CV
                </a>
              ) : (
                <span className="inline-flex min-w-0 items-start gap-1 text-foreground">
                  <FileText className="mt-0.5 size-4 shrink-0" />
                  <span className="break-all">CV: {cv}</span>
                </span>
              ))}
              {portfolio && (isWebLink(portfolio) ? (
                <a
                  href={portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="size-4" />
                  Portfolio
                </a>
              ) : (
                <span className="inline-flex min-w-0 items-start gap-1 text-foreground">
                  <ExternalLink className="mt-0.5 size-4 shrink-0" />
                  <span className="break-all">Portfolio: {portfolio}</span>
                </span>
              ))}
              {!cv && !portfolio && (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </Panel>
  )
}
