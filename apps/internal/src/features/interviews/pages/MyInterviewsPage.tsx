import * as React from "react"
import {
  PageHeader,
  Panel,
  SearchInput,
  FilterChips,
  DataTablePagination,
  type Chip,
} from "@/shared/components"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { MyInterviewItem, SubmitAssessmentPayload } from "../types"
import { getApiError } from "@/shared/api/api-error"
import {
  useConfirmInterviewerSessionMutation,
  useGetInterviewerSessionsQuery,
  useSubmitInterviewerAssessmentMutation,
  useRequestInterviewerRescheduleMutation,
} from "../api/interviewer-api"
import {
  mapAssessmentRecommendation,
  mapInterviewerSession,
} from "../utils/interviewerSessionAdapter"
import {
  MyInterviewsTable,
  type InterviewSortKey,
  ConfirmAcceptInterviewDialog,
  InterviewAssessmentDialog,
  RequestRescheduleDialog,
} from "../components"

const statusItems = [
  { label: "All Status", value: "all" },
  { label: "Pending Confirmation", value: "pending" },
  { label: "Confirmed (Upcoming)", value: "accepted" },
  { label: "Needs Assessment", value: "needs_assessment" },
  { label: "Completed", value: "completed" },
  { label: "Rescheduled", value: "rescheduled" },
  { label: "Cancelled", value: "cancelled" },
]

const modeItems = [
  { label: "All Modes", value: "all" },
  { label: "Online Only (Meet)", value: "online" },
  { label: "Onsite Only (Office)", value: "onsite" },
]

export function MyInterviewsPage() {
  const {
    currentData: sessionDtos,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetInterviewerSessionsQuery()
  const interviews = React.useMemo(
    () => (sessionDtos ?? []).map(mapInterviewerSession),
    [sessionDtos]
  )
  const [confirmSession, { isLoading: isConfirming }] =
    useConfirmInterviewerSessionMutation()
  const [submitAssessment, { isLoading: isSubmittingAssessment }] =
    useSubmitInterviewerAssessmentMutation()
  const [requestReschedule, { isLoading: isRequestingReschedule }] =
    useRequestInterviewerRescheduleMutation()

  // Filters state
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [modeFilter, setModeFilter] = React.useState("all")
  const [batchFilter, setBatchFilter] = React.useState("all")

  // Sorting and pagination state
  const [sortKey, setSortKey] = React.useState<InterviewSortKey>("schedule")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [page, setPage] = React.useState(1)
  const pageSize = 6

  // Action dialog states
  const [sessionToAccept, setSessionToAccept] =
    React.useState<MyInterviewItem | null>(null)
  const [sessionToAssess, setSessionToAssess] =
    React.useState<MyInterviewItem | null>(null)
  const [sessionToViewAssessment, setSessionToViewAssessment] =
    React.useState<MyInterviewItem | null>(null)
  const [sessionToReschedule, setSessionToReschedule] =
    React.useState<MyInterviewItem | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [rescheduleNotice, setRescheduleNotice] = React.useState<string | null>(null)

  // Dynamic batch filter items from data
  const batchItems = React.useMemo(() => {
    const batches = Array.from(
      new Set(interviews.map((i) => i.recruitmentName))
    )
    return [
      { label: "All Batches", value: "all" },
      ...batches.filter(Boolean).map((name) => ({ label: name, value: name })),
    ]
  }, [interviews])

  // Filtered interviews list
  const filteredInterviews = React.useMemo(() => {
    let result = [...interviews]

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.candidateName.toLowerCase().includes(q) ||
          i.candidateEmail.toLowerCase().includes(q) ||
          (i.codeApplication ?? "").toLowerCase().includes(q) ||
          i.recruitmentName.toLowerCase().includes(q) ||
          i.sessionName.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter === "pending") {
      result = result.filter((i) => i.status === "pending")
    } else if (statusFilter === "accepted") {
      result = result.filter((i) => i.status === "accepted")
    } else if (statusFilter === "needs_assessment") {
      result = result.filter((i) => i.status === "accepted" && !i.assessment)
    } else if (statusFilter === "completed") {
      result = result.filter((i) => i.status === "completed")
    } else if (statusFilter === "rescheduled") {
      result = result.filter((i) => i.status === "rescheduled")
    } else if (statusFilter === "cancelled") {
      result = result.filter((i) => i.status === "cancelled")
    }

    // Mode filter
    if (modeFilter === "online") {
      result = result.filter((i) => i.isOnline)
    } else if (modeFilter === "onsite") {
      result = result.filter((i) => !i.isOnline)
    }

    // Batch filter
    if (batchFilter !== "all") {
      result = result.filter((i) => i.recruitmentName === batchFilter)
    }

    // Sorting
    return result.sort((a, b) => {
      let comparison = 0
      if (sortKey === "candidate") {
        comparison = a.candidateName.localeCompare(b.candidateName)
      } else if (sortKey === "recruitment") {
        comparison = a.recruitmentName.localeCompare(b.recruitmentName)
      } else if (sortKey === "schedule") {
        comparison =
          new Date(a.scheduledStart).getTime() -
          new Date(b.scheduledStart).getTime()
      } else if (sortKey === "status") {
        comparison = a.status.localeCompare(b.status)
      } else if (sortKey === "score") {
        const scoreA = a.assessment?.score ?? -1
        const scoreB = b.assessment?.score ?? -1
        comparison = scoreA - scoreB
      }
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [interviews, search, statusFilter, modeFilter, batchFilter, sortKey, sortDirection])

  // Pagination slice
  const totalItems = filteredInterviews.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const safePage = Math.min(page, totalPages)

  const paginatedInterviews = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredInterviews.slice(start, start + pageSize)
  }, [filteredInterviews, safePage, pageSize])

  const handleSort = (key: string) => {
    const k = key as InterviewSortKey
    if (sortKey === k) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(k)
      setSortDirection("asc")
    }
  }

  // Active filter chips
  const activeChips: Chip[] = React.useMemo(() => {
    const chips: Chip[] = []
    if (search.trim()) {
      chips.push({
        key: "search",
        label: `Search: "${search}"`,
        onRemove: () => setSearch(""),
      })
    }
    if (statusFilter !== "all") {
      const match = statusItems.find((s) => s.value === statusFilter)
      chips.push({
        key: "status",
        label: `Status: ${match?.label || statusFilter}`,
        onRemove: () => setStatusFilter("all"),
      })
    }
    if (modeFilter !== "all") {
      const match = modeItems.find((m) => m.value === modeFilter)
      chips.push({
        key: "mode",
        label: `Mode: ${match?.label || modeFilter}`,
        onRemove: () => setModeFilter("all"),
      })
    }
    if (batchFilter !== "all") {
      chips.push({
        key: "batch",
        label: `Batch: ${batchFilter}`,
        onRemove: () => setBatchFilter("all"),
      })
    }
    return chips
  }, [search, statusFilter, modeFilter, batchFilter])

  const handleResetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setModeFilter("all")
    setBatchFilter("all")
    setPage(1)
  }

  const handleConfirmAccept = async () => {
    if (!sessionToAccept?.isLead) return
    setActionError(null)
    try {
      await confirmSession(sessionToAccept.id).unwrap()
      setSessionToAccept(null)
    } catch (requestError) {
      setActionError(getApiError(requestError).message)
    }
  }

  const handleSaveAssessment = async (payload: SubmitAssessmentPayload) => {
    if (!sessionToAssess) return
    setActionError(null)
    try {
      const result = await submitAssessment({
        sessionInterviewId: sessionToAssess.id,
        body: payload,
      }).unwrap()
      setSessionToAssess(null)
      const recommendation = mapAssessmentRecommendation(result.recommendation)
      if (recommendation) {
        setSessionToViewAssessment({
          ...sessionToAssess,
          status: "completed",
          assessment: {
            id: result.assessmentId,
            sessionInterviewId: result.sessionInterviewId,
            score: result.score,
            recommendation,
            notes: result.notes ?? "",
            assessedAt: result.createdAt,
          },
        })
      }
    } catch (requestError) {
      setActionError(getApiError(requestError).message)
    }
  }

  const handleRequestReschedule = async (
    interviewSessionId: string,
    proposedStart: string,
    proposedEnd: string,
    reason: string
  ) => {
    try {
      const result = await requestReschedule({
        interviewSessionId,
        proposedStart,
        proposedEnd,
        reason,
      }).unwrap()
      setSessionToReschedule(null)
      setActionError(null)
      setRescheduleNotice(result.statusName || "Reschedule request submitted.")
    } catch (requestError) {
      throw new Error(getApiError(requestError).message, { cause: requestError })
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="My Interview Assignments"
        description="Review assigned candidate interviews, confirm attendance schedule, join virtual/onsite rooms, and submit evaluations."
      />

      {/* 2. Main Container Panel */}
      <Panel>
        {/* Top Search & Filter Bar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search candidate, email, batch, or session..."
              containerClassName="sm:w-80"
            />

            {/* Status Filter */}
            <Select
              items={statusItems}
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val ?? "all")}
            >
              <SelectTrigger className="h-10 w-52 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {statusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Mode Filter */}
            <Select
              items={modeItems}
              value={modeFilter}
              onValueChange={(val) => setModeFilter(val ?? "all")}
            >
              <SelectTrigger className="h-10 w-44 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {modeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Batch Filter */}
            <Select
              items={batchItems}
              value={batchFilter}
              onValueChange={(val) => setBatchFilter(val ?? "all")}
            >
              <SelectTrigger className="h-10 w-56 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {batchItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Removable Active Filter Chips */}
        <FilterChips chips={activeChips} onReset={handleResetFilters} />

        {/* 3. Table directly placed inside Panel */}
        <>
        {isError && sessionDtos && (
          <div role="alert" className="px-5 pt-3 text-sm text-danger">
            Refresh failed: {getApiError(error).message}
          </div>
        )}
        {rescheduleNotice && (
          <div role="status" className="mx-5 my-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {rescheduleNotice} Your request is waiting for HR review.
          </div>
        )}
        <MyInterviewsTable
          interviews={paginatedInterviews}
          isLoading={isLoading && !sessionDtos}
          isFetching={isFetching && Boolean(sessionDtos)}
          isError={isError && !sessionDtos}
          error={error}
          onRetry={() => void refetch()}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          hasActiveFilters={activeChips.length > 0}
          onResetFilters={handleResetFilters}
          onAcceptInvitation={(item) => {
            if (!item.isLead) return
            setActionError(null)
            setSessionToAccept(item)
          }}
          onSubmitAssessment={(item) => {
            setActionError(null)
            setSessionToAssess(item)
          }}
          onViewAssessment={(item) => {
            setSessionToViewAssessment(item)
          }}
          onRequestReschedule={(item) => {
            if (!item.isLead) return
            setActionError(null)
            setSessionToReschedule(item)
          }}
        />

        {/* 4. Pagination directly at bottom of Panel */}
        {!isLoading && !isError && totalItems > 0 && (
          <DataTablePagination className="border-t border-border px-5 py-4"
            page={safePage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        )}
        </>
      </Panel>

      {/* Accept Interview Attendance Dialog */}
      <ConfirmAcceptInterviewDialog
        open={Boolean(sessionToAccept)}
        onOpenChange={(open) => {
          if (!open) setSessionToAccept(null)
        }}
        session={sessionToAccept}
        onConfirm={handleConfirmAccept}
        isLoading={isConfirming}
        error={actionError}
      />
      {sessionToAssess && (
        <InterviewAssessmentDialog
          key={sessionToAssess.id}
          open
          onOpenChange={(open) => {
            if (!open && !isSubmittingAssessment) setSessionToAssess(null)
          }}
          session={sessionToAssess}
          isSubmitting={isSubmittingAssessment}
          error={actionError}
          onSubmit={handleSaveAssessment}
        />
      )}
      {sessionToViewAssessment && (
        <InterviewAssessmentDialog
          key={`view-${sessionToViewAssessment.id}`}
          open
          onOpenChange={(open) => {
            if (!open) setSessionToViewAssessment(null)
          }}
          session={sessionToViewAssessment}
          readOnly
        />
      )}
      <RequestRescheduleDialog
        open={Boolean(sessionToReschedule)}
        onOpenChange={(open) => { if (!open && !isRequestingReschedule) setSessionToReschedule(null) }}
        session={sessionToReschedule}
        onSubmitRequest={handleRequestReschedule}
        isSubmitting={isRequestingReschedule}
      />
    </div>
  )
}
