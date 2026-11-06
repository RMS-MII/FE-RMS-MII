import { useState, useMemo } from "react"
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
import { getStageInvitations } from "../data/stageInvitationsMock"
import type { StageInvitationItem, StageInvitationStatus } from "../types"
import {
  StageInvitationsTable,
  ConfirmAcceptStageDialog,
  ConfirmDeclineStageDialog,
  type StageSortKey,
} from "../components"

const statusItems: { label: string; value: StageInvitationStatus | "all" }[] = [
  { label: "All Status", value: "all" },
  { label: "Pending Response", value: "pending" },
  { label: "Accepted (Active)", value: "accepted" },
  { label: "Declined", value: "declined" },
]

export function StageInvitationsPage() {
  const [invitations, setInvitations] = useState<StageInvitationItem[]>(() =>
    getStageInvitations()
  )

  // Filters state
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StageInvitationStatus | "all">("all")

  // Sorting and pagination state
  const [sortKey, setSortKey] = useState<StageSortKey>("recruitment")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const pageSize = 5

  // Action dialog states
  const [stageToAccept, setStageToAccept] = useState<StageInvitationItem | null>(null)
  const [stageToDecline, setStageToDecline] = useState<StageInvitationItem | null>(null)

  // Filtered invitations list
  const filteredInvitations = useMemo(() => {
    let result = [...invitations]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.recruitmentName.toLowerCase().includes(q) ||
          i.recruitmentBatchCode.toLowerCase().includes(q) ||
          i.stageName.toLowerCase().includes(q) ||
          i.department.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter)
    }

    return result.sort((a, b) => {
      let comparison = 0
      if (sortKey === "recruitment") {
        comparison = a.recruitmentName.localeCompare(b.recruitmentName)
      } else if (sortKey === "stage") {
        comparison = a.stageName.localeCompare(b.stageName)
      } else if (sortKey === "period") {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      } else if (sortKey === "candidates") {
        comparison = a.estimatedCandidates - b.estimatedCandidates
      } else if (sortKey === "status") {
        comparison = a.status.localeCompare(b.status)
      }
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [invitations, search, statusFilter, sortKey, sortDirection])

  // Pagination slice
  const totalItems = filteredInvitations.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const safePage = Math.min(page, totalPages)

  const paginatedInvitations = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredInvitations.slice(start, start + pageSize)
  }, [filteredInvitations, safePage, pageSize])

  const handleSort = (key: string) => {
    const k = key as StageSortKey
    if (sortKey === k) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(k)
      setSortDirection("asc")
    }
  }

  // Active filter chips
  const activeChips: Chip[] = useMemo(() => {
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
    return chips
  }, [search, statusFilter])

  const handleResetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setPage(1)
  }

  const handleConfirmAccept = () => {
    if (!stageToAccept) return
    const id = stageToAccept.id
    setInvitations((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          status: "accepted",
          declineReason: null,
          respondedAt: new Date().toISOString(),
        }
      })
    )
    setStageToAccept(null)
  }

  const handleConfirmDecline = (reason: string) => {
    if (!stageToDecline) return
    const id = stageToDecline.id
    setInvitations((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          status: "declined",
          declineReason: reason,
          respondedAt: new Date().toISOString(),
        }
      })
    )
    setStageToDecline(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage Interviewer Invitations"
        description="Review and respond to recruitment stage assignments from HR. Accepting a stage mandate confirms your role before candidate interviews are scheduled."
      />

      <Panel>
        {/* Top Search & Filter Bar */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val)
                setPage(1)
              }}
              placeholder="Search batch, stage name, or department..."
              containerClassName="sm:w-80"
            />

            {/* Status Filter */}
            <Select
              items={statusItems}
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter((val as StageInvitationStatus | "all") ?? "all")
                setPage(1)
              }}
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
          </div>
        </div>

        {/* Removable Active Filter Chips */}
        <FilterChips chips={activeChips} onReset={handleResetFilters} />

        {/* Stage Invitations Table */}
        <StageInvitationsTable
          invitations={paginatedInvitations}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          hasActiveFilters={activeChips.length > 0}
          onResetFilters={handleResetFilters}
          onAccept={(item) => setStageToAccept(item)}
          onDecline={(item) => setStageToDecline(item)}
        />

        {/* Pagination directly at bottom of Panel */}
        {totalItems > 0 && (
          <DataTablePagination
            page={safePage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        )}
      </Panel>

      {/* Confirm Accept Dialog Component */}
      <ConfirmAcceptStageDialog
        open={Boolean(stageToAccept)}
        onOpenChange={(open) => {
          if (!open) setStageToAccept(null)
        }}
        item={stageToAccept}
        onConfirm={handleConfirmAccept}
      />

      {/* Confirm Decline Dialog Component */}
      <ConfirmDeclineStageDialog
        open={Boolean(stageToDecline)}
        onOpenChange={(open) => {
          if (!open) setStageToDecline(null)
        }}
        item={stageToDecline}
        onConfirm={handleConfirmDecline}
      />
    </div>
  )
}
