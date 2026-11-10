import { useState } from "react"
import { format } from "date-fns"
import { AlertTriangle, Loader2, MailCheck, MailX, RotateCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import {
  DataTablePagination,
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  SearchInput,
  StatusBadge,
  TableSkeleton,
} from "@/shared/components"
import { DatePicker } from "@/shared/components/DatePicker"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { useGetEmailLogsQuery, useRetryEmailLogMutation } from "../api/email-logs-api"
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
const emailStatusItems = [
  { label: "All Status", value: "all" },
  { label: "Sent", value: "Sent" },
  { label: "Failed", value: "Failed" },
  { label: "Retry queued", value: "Pending" },
  { label: "Sending", value: "Sending" },
]
const emailTypeItems = [
  { label: "All email types", value: "all" },
  ...emailTypes,
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
  return "Something went wrong while fetching email logs. Please check your connection and try again."
}

export function EmailLogsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [status, setStatus] = useState<EmailDeliveryStatus | "all">("all")
  const [type, setType] = useState<EmailType | "all">("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)
  const [retryNotice, setRetryNotice] = useState<string | null>(null)
  const [retryEmailLog, { isLoading: isRetrying, originalArgs: retryingLogId }] = useRetryEmailLogMutation()

  const { data, error, isLoading, isError, refetch } = useGetEmailLogsQuery(
    {
      search: debouncedSearch,
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
      from: from ? `${from}T00:00:00` : undefined,
      to: to ? `${to}T23:59:59.999` : undefined,
      page,
      pageSize: PAGE_SIZE,
    },
    { pollingInterval: 5000, skipPollingIfUnfocused: true, refetchOnFocus: true },
  )

  const logs = data?.items ?? []

  const handleRetry = async (id: string) => {
    setRetryNotice(null)
    try {
      await retryEmailLog(id).unwrap()
      setRetryNotice("Email retry queued. Its status will update as the background worker processes it.")
    } catch (retryError) {
      setRetryNotice(getErrorMessage(retryError))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Logs"
        description="Review delivery attempts for system emails, including failed sends."
      />

      <Panel>
        {retryNotice && (
          <div role="status" className="border-b border-border bg-muted/40 px-5 py-3 text-sm text-foreground">
            {retryNotice}
          </div>
        )}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Search recipient or subject..."
              containerClassName="sm:w-80"
            />
            <Select items={emailStatusItems} value={status} onValueChange={(value) => {
              setStatus(value === null ? "all" : value as EmailDeliveryStatus | "all")
              setPage(1)
            }}>
              <SelectTrigger className="h-10 w-40 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 shadow-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-card p-1 shadow-md">
                <SelectItem value="all" className="cursor-pointer rounded-lg text-sm">All Status</SelectItem>
                <SelectItem value="Sent" className="cursor-pointer rounded-lg text-sm">Sent</SelectItem>
                <SelectItem value="Failed" className="cursor-pointer rounded-lg text-sm">Failed</SelectItem>
                <SelectItem value="Pending" className="cursor-pointer rounded-lg text-sm">Retry queued</SelectItem>
                <SelectItem value="Sending" className="cursor-pointer rounded-lg text-sm">Sending</SelectItem>
              </SelectContent>
            </Select>
            <Select items={emailTypeItems} value={type} onValueChange={(value) => {
              setType(value === null ? "all" : value as EmailType | "all")
              setPage(1)
            }}>
              <SelectTrigger className="h-10 w-52 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 shadow-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary">
                <SelectValue placeholder="All Email Types" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-card p-1 shadow-md">
                <SelectItem value="all" className="cursor-pointer rounded-lg text-sm">All Email Types</SelectItem>
                {emailTypes.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="cursor-pointer rounded-lg text-sm">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end md:w-auto">
            <DatePicker
              value={from}
              onChange={(value) => { setFrom(value); setPage(1) }}
              placeholder="From date"
              className="sm:w-40"
            />
            <DatePicker
              value={to}
              onChange={(value) => { setTo(value); setPage(1) }}
              placeholder="To date"
              minDate={from || undefined}
              className="sm:w-40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Attempted at</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Email type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5">Details</TableHead>
                <TableHead className="pr-5">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton
                  rowCount={5}
                  colWidths={["w-32", "w-36", "w-44", "w-28", "w-16", ["w-32", "w-24"], "w-20"]}
                  cellClassNames={["pl-5", "", "", "", "", "", "pr-5"]}
                />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <ErrorState
                      title="Failed to load email logs"
                      description={getErrorMessage(error)}
                      onRetry={() => refetch()}
                    />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <EmptyState
                      title="No email logs found"
                      description="Change your search or filters to view other delivery attempts."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-b border-border transition-colors hover:bg-muted/40">
                    <TableCell className="whitespace-nowrap py-3.5 pl-5 text-sm">{formatDate(log.attemptedAt)}</TableCell>
                    <TableCell className="max-w-56 truncate py-3.5 text-sm" title={log.recipientEmail}>{log.recipientEmail}</TableCell>
                    <TableCell className="max-w-72 truncate py-3.5 text-sm font-medium" title={log.subject}>{log.subject}</TableCell>
                    <TableCell className="whitespace-nowrap py-3.5 text-sm">
                      {emailTypes.find((item) => item.value === log.type)?.label ?? log.type}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <StatusBadge
                        tone={log.status === "Sent" ? "success" : log.status === "Failed" ? "danger" : "info"}
                        icon={log.status === "Sent" ? <MailCheck /> : log.status === "Failed" ? <MailX /> : <Loader2 className={log.status === "Sending" ? "animate-spin" : undefined} />}
                      >
                        {log.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="min-w-52 max-w-sm py-3.5 pr-5 text-sm">
                      {log.status === "Failed" ? (
                        <div className="flex items-start gap-2 text-danger" title={log.errorMessage ?? undefined}>
                          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                          <span className="line-clamp-2">{log.errorMessage || "Email delivery failed."}</span>
                        </div>
                      ) : log.status === "Pending" ? (
                        <span className="text-muted-foreground">Waiting in retry queue</span>
                      ) : log.status === "Sending" ? (
                        <span className="text-muted-foreground">Retry is being sent</span>
                      ) : (
                        <span className="text-muted-foreground">Sent {formatDate(log.sentAt)}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 pr-5">
                      {log.canRetry && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 rounded-full"
                          disabled={isRetrying}
                          onClick={() => void handleRetry(log.id)}
                        >
                          {isRetrying && retryingLogId === log.id ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden />
                          ) : (
                            <RotateCw className="size-3.5" aria-hidden />
                          )}
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && !isError && (data?.totalItems ?? 0) > 0 && (
          <div className="border-t border-border px-5 py-4">
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={data?.totalItems ?? 0}
              onPageChange={setPage}
            />
          </div>
        )}
      </Panel>
    </div>
  )
}
