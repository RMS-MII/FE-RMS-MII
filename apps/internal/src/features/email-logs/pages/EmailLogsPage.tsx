import { useEffect, useState } from "react"
import { format } from "date-fns"
import { AlertTriangle, MailCheck, MailX } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { DatePicker } from "@/shared/components/DatePicker"
import { DataTablePagination } from "@/shared/components/DataTablePagination"
import { ErrorState } from "@/shared/components/ErrorState"
import { PageHeader } from "@/shared/components/PageHeader"
import { Panel } from "@/shared/components/Panel"
import { SearchInput } from "@/shared/components/SearchInput"
import { StatusBadge } from "@/shared/components/StatusBadge"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { cn } from "@/shared/lib/utils"
import { useGetEmailLogsQuery } from "../api/email-logs-api"
import type { EmailDeliveryStatus, EmailType } from "../types"

const PAGE_SIZE = 10

const emailTypes: { value: EmailType; label: string }[] = [
  { value: "StageInvitation", label: "Stage invitation" },
  { value: "InterviewerInvitation", label: "Interviewer invitation" },
  { value: "InterviewInvitation", label: "Interview invitation" },
  { value: "RescheduleRequest", label: "Reschedule request" },
  { value: "RescheduleResult", label: "Reschedule result" },
  { value: "TakeHome", label: "Take-home test" },
  { value: "Rejection", label: "Rejection" },
  { value: "FinalResult", label: "Final result" },
]

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : format(date, "dd MMM yyyy, HH:mm")
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data
    if (data && typeof data === "object" && "detail" in data && typeof data.detail === "string") {
      return data.detail
    }
  }
  return "Unable to load email logs. Please try again."
}

export function EmailLogsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState<EmailDeliveryStatus | "all">("all")
  const [type, setType] = useState<EmailType | "all">("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, type, from, to])

  const { data, error, isLoading, isFetching, refetch } = useGetEmailLogsQuery({
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    type: type === "all" ? undefined : type,
    from: from ? `${from}T00:00:00` : undefined,
    to: to ? `${to}T23:59:59.999` : undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const logs = data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Logs"
        description="Review delivery attempts for system emails, including failed sends."
      />

      <Panel>
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:flex-wrap md:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search recipient or subject..."
            containerClassName="w-full md:w-72"
          />
          <Select value={status} onValueChange={(value) => setStatus(value as EmailDeliveryStatus | "all")}>
            <SelectTrigger className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm shadow-none md:w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={(value) => setType(value as EmailType | "all")}>
            <SelectTrigger className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm shadow-none md:w-56">
              <SelectValue placeholder="All email types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All email types</SelectItem>
              {emailTypes.map((item) => (
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex w-full flex-col gap-2 sm:flex-row md:ml-auto md:w-auto">
            <DatePicker value={from} onChange={setFrom} placeholder="From date" className="md:w-40" />
            <DatePicker value={to} onChange={setTo} placeholder="To date" minDate={from || undefined} className="md:w-40" />
          </div>
        </div>

        {error ? (
          <ErrorState
            title="Could not load email logs"
            description={getErrorMessage(error)}
            onRetry={refetch}
          />
        ) : (
          <>
            <div className={cn("overflow-x-auto", isFetching && !isLoading && "opacity-60")}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Attempted at</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Email type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading email logs...</TableCell></TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No email logs found.</TableCell></TableRow>
                  ) : logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap pl-5 text-sm">{formatDate(log.attemptedAt)}</TableCell>
                      <TableCell className="max-w-56 truncate text-sm" title={log.recipientEmail}>{log.recipientEmail}</TableCell>
                      <TableCell className="max-w-72 truncate text-sm font-medium" title={log.subject}>{log.subject}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{emailTypes.find((item) => item.value === log.type)?.label ?? log.type}</TableCell>
                      <TableCell>
                        <StatusBadge tone={log.status === "Sent" ? "success" : "danger"} icon={log.status === "Sent" ? <MailCheck /> : <MailX />}>
                          {log.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="min-w-52 max-w-sm pr-5 text-sm">
                        {log.status === "Failed" ? (
                          <div className="flex items-start gap-2 text-danger" title={log.errorMessage ?? undefined}>
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <span className="line-clamp-2">{log.errorMessage || "Email delivery failed."}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sent {formatDate(log.sentAt)}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-border px-5 py-4">
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={data?.totalItems ?? 0}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Panel>
    </div>
  )
}
