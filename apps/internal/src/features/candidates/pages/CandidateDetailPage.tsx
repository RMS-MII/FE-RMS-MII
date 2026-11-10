import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { ExternalLink, FileText, Mail, MapPin, Phone } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { BackButton, DataTablePagination, EmptyState, ErrorState, Panel, StatusBadge } from "@/shared/components"
import { usePageBreadcrumbs } from "@/shared/components/layout/breadcrumbs-context"
import { formatCurrency, safeFormatDate } from "@/shared/lib/format"
import { useGetCandidateByIdQuery } from "../api/candidates-api"
import { mapBatchStatusDto, mapGenderDto } from "../hooks/useCandidatesList"

const PAGE_SIZE = 10

export function CandidateDetailPage({ id }: { id: string }) {
  const [page, setPage] = useState(1)
  const { currentData: candidate, isLoading, isError, refetch } = useGetCandidateByIdQuery(id, {
    refetchOnMountOrArgChange: true,
  })
  const crumbs = useMemo(() => [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Candidates", to: "/candidates" },
    { label: candidate?.fullName ?? "Candidate Detail" },
  ], [candidate?.fullName])
  usePageBreadcrumbs(crumbs)

  const applications = [...(candidate?.assignedBatches ?? [])]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
  const visibleApplications = applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (isLoading && !candidate) {
    return <div className="space-y-6"><Skeleton className="h-10 w-72" /><Skeleton className="h-64 w-full rounded-2xl" /><Skeleton className="h-80 w-full rounded-2xl" /></div>
  }

  if (isError || !candidate) {
    return <div className="space-y-6"><div className="flex items-center gap-3"><BackButton to="/candidates" label="Back to Candidates" /><h1 className="text-2xl font-bold">Candidate Detail</h1></div><Panel className="p-8"><ErrorState title="Unable to load candidate" description="The candidate profile could not be loaded." onRetry={() => refetch()} /></Panel></div>
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3.5">
        <BackButton to="/candidates" label="Back to Candidates" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">{candidate.fullName}</h1>
          <p className="text-sm text-muted-foreground">Candidate Profile</p>
        </div>
      </div>

      <Panel className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">{candidate.fullName.charAt(0)}</span>
            <div className="min-w-0 space-y-2">
              <h2 className="text-lg font-semibold text-foreground">{candidate.fullName}</h2>
              <p className="text-sm text-muted-foreground">{mapGenderDto(candidate.gender)}{candidate.birthDate ? ` · Born ${safeFormatDate(candidate.birthDate)}` : ""}</p>
              <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 break-all text-sm text-primary hover:underline"><Mail className="size-4 shrink-0" />{candidate.email}</a>
              {candidate.phoneNumber && <p className="flex items-center gap-2 text-sm text-foreground"><Phone className="size-4 shrink-0 text-muted-foreground" />{candidate.phoneNumber}</p>}
              {candidate.address && <p className="flex items-start gap-2 text-sm text-foreground"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />{candidate.address}</p>}
            </div>
          </div>
          <dl className="grid flex-1 gap-x-8 gap-y-4 border-t border-border pt-5 text-sm sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div><dt className="text-muted-foreground">Education</dt><dd className="mt-1 font-medium text-foreground">{candidate.education || "—"}</dd></div>
            <div><dt className="text-muted-foreground">Institution</dt><dd className="mt-1 font-medium text-foreground">{candidate.institution || "—"}</dd></div>
            <div><dt className="text-muted-foreground">GPA</dt><dd className="mt-1 font-medium text-foreground">{candidate.gpa ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Expected Salary</dt><dd className="mt-1 font-medium text-foreground">{candidate.expectedSalary ? formatCurrency(candidate.expectedSalary) : "Not specified"}</dd></div>
            <div><dt className="text-muted-foreground">Registered</dt><dd className="mt-1 font-medium text-foreground">{safeFormatDate(candidate.createdAt)}</dd></div>
            <div><dt className="text-muted-foreground">Documents</dt><dd className="mt-1 flex flex-wrap gap-3">{candidate.cv && <a href={candidate.cv.startsWith("http") ? candidate.cv : `#${candidate.cv}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><FileText className="size-4" />CV</a>}{candidate.portfolio && <a href={candidate.portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><ExternalLink className="size-4" />Portfolio</a>}{!candidate.cv && !candidate.portfolio && "—"}</dd></div>
          </dl>
        </div>
      </Panel>

      <Panel>
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Applied Recruitment Batches</h2>
          <p className="text-sm text-muted-foreground">{applications.length} application{applications.length === 1 ? "" : "s"}</p>
        </div>
        {applications.length === 0 ? <EmptyState title="No applications yet" description="This candidate is currently in the talent pool." /> : (
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="pl-5">Recruitment Batch</TableHead><TableHead>Application Code</TableHead><TableHead>Applied At</TableHead><TableHead>Status</TableHead><TableHead className="pr-5 text-right">Application</TableHead></TableRow></TableHeader><TableBody>
            {visibleApplications.map((application) => {
              const status = mapBatchStatusDto(application.applicationStatus)
              return <TableRow key={application.applicationId} className="hover:bg-muted/40"><TableCell className="py-3.5 pl-5"><p className="font-medium text-foreground">{application.batchName}</p><p className="text-xs text-muted-foreground">{application.batchCode}</p></TableCell><TableCell className="text-sm">{application.codeApplication || "—"}</TableCell><TableCell className="whitespace-nowrap text-sm">{safeFormatDate(application.appliedAt)}</TableCell><TableCell><StatusBadge tone={status === "Accepted" ? "success" : status === "Rejected" ? "danger" : status === "In Progress" ? "info" : "neutral"}>{status}</StatusBadge></TableCell><TableCell className="pr-5 text-right"><Link to="/recruitments/$id/applications/$applicationId" params={{ id: application.batchId, applicationId: application.applicationId }} search={{}} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">View application <ExternalLink className="size-3.5" /></Link></TableCell></TableRow>
            })}
          </TableBody></Table></div>
        )}
        {applications.length > PAGE_SIZE && <DataTablePagination className="border-t border-border px-5 py-4" page={page} pageSize={PAGE_SIZE} totalItems={applications.length} onPageChange={setPage} />}
      </Panel>
    </div>
  )
}
