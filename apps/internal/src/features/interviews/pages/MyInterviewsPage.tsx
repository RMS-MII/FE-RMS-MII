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
import { getMyInterviews } from "../data/myInterviewsMock"
import type { MyInterviewItem } from "../types"
import {
  MyInterviewsTable,
  type InterviewSortKey,
} from "../components/MyInterviewsTable"

const statusItems = [
  { label: "All Status", value: "all" },
  { label: "Pending Confirmation", value: "pending" },
  { label: "Confirmed (Upcoming)", value: "accepted" },
  { label: "Needs Assessment", value: "needs_assessment" },
  { label: "Completed", value: "completed" },
  { label: "Declined", value: "declined" },
]

const modeItems = [
  { label: "All Modes", value: "all" },
  { label: "Online Only (Meet)", value: "online" },
  { label: "Onsite Only (Office)", value: "onsite" },
]

export function MyInterviewsPage() {
  const [interviews, setInterviews] = React.useState<MyInterviewItem[]>(() =>
    getMyInterviews()
  )

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

  // Modal dialog states (for Phases 4, 5, 6)
  const [sessionToConfirm, setSessionToConfirm] =
    React.useState<MyInterviewItem | null>(null)
  const [sessionToAssess, setSessionToAssess] =
    React.useState<MyInterviewItem | null>(null)
  const [sessionToViewAssessment, setSessionToViewAssessment] =
    React.useState<MyInterviewItem | null>(null)
  const [candidateToView, setCandidateToView] =
    React.useState<MyInterviewItem | null>(null)

  // Dynamic batch filter items from data
  const batchItems = React.useMemo(() => {
    const batches = Array.from(
      new Set(interviews.map((i) => i.recruitmentBatchCode))
    )
    return [
      { label: "All Batches", value: "all" },
      ...batches.map((code) => {
        const item = interviews.find((i) => i.recruitmentBatchCode === code)
        return {
          label: `${code} - ${item?.recruitmentName || "Recruitment"}`,
          value: code,
        }
      }),
    ]
  }, [interviews])

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [search, statusFilter, modeFilter, batchFilter])

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
          i.codeApplication.toLowerCase().includes(q) ||
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
    } else if (statusFilter === "declined") {
      result = result.filter((i) => i.status === "declined")
    }

    // Mode filter
    if (modeFilter === "online") {
      result = result.filter((i) => i.isOnline)
    } else if (modeFilter === "onsite") {
      result = result.filter((i) => !i.isOnline)
    }

    // Batch filter
    if (batchFilter !== "all") {
      result = result.filter((i) => i.recruitmentBatchCode === batchFilter)
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

  const handleUpdateStatus = (
    id: string,
    status: MyInterviewItem["status"],
    reason?: string
  ) => {
    setInterviews((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          status,
          declineReason: reason || null,
        }
      })
    )
    setSessionToConfirm(null)
  }

  const handleSaveAssessment = (
    id: string,
    payload: { score: number; recommendation: any; notes: string }
  ) => {
    setInterviews((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          status: "completed",
          assessment: {
            id: `ia-${Date.now()}`,
            sessionInterviewId: item.id,
            score: payload.score,
            recommendation: payload.recommendation,
            notes: payload.notes,
            assessedAt: new Date().toISOString(),
          },
        }
      })
    )
    setSessionToAssess(null)
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header (Exact layout hierarchy of RecruitmentsListPage) */}
      <PageHeader
        title="My Interview Assignments"
        description="Review assigned candidate interviews, confirm attendance schedule, join virtual/onsite rooms, and submit evaluations."
      />

      {/* 2. Main Container Panel (Direct child of space-y-6 container) */}
      <Panel>
        {/* Top Search & Filter Bar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search candidate, email, or application code..."
              containerClassName="sm:w-80"
            />

            {/* Status Filter */}
            <Select
              items={statusItems}
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val ?? "all")}
            >
              <SelectTrigger className="h-10 w-48 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
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

        {/* 3. Table directly placed inside Panel (no extra card wrapper) */}
        <MyInterviewsTable
          interviews={paginatedInterviews}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          hasActiveFilters={activeChips.length > 0}
          onResetFilters={handleResetFilters}
          onConfirmInvitation={(item) => {
            setSessionToConfirm(item)
          }}
          onSubmitAssessment={(item) => {
            setSessionToAssess(item)
          }}
          onViewAssessment={(item) => {
            setSessionToViewAssessment(item)
          }}
          onViewCandidate={(item) => {
            setCandidateToView(item)
          }}
          onViewDeclineReason={(item) => {
            alert(`Decline Reason: ${item.declineReason || "No reason specified."}`)
          }}
        />

        {/* 4. Pagination directly at bottom of Panel */}
        {totalItems > 0 && (
          <DataTablePagination
            page={safePage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        )}
      </Panel>

      {/* State placeholders connecting to Phase 4 & 5 dialogs */}
      {sessionToConfirm && (
        <span
          className="hidden"
          onClick={() => handleUpdateStatus(sessionToConfirm.id, "accepted")}
        />
      )}
      {sessionToAssess && (
        <span
          className="hidden"
          onClick={() =>
            handleSaveAssessment(sessionToAssess.id, {
              score: 80,
              recommendation: "Recommend",
              notes: "",
            })
          }
        />
      )}
      {sessionToViewAssessment && <span className="hidden" />}
      {candidateToView && <span className="hidden" />}
    </div>
  )
}
