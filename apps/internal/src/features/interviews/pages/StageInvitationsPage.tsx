import { useState, useMemo } from "react"
import { RefreshCw } from "lucide-react"
import {
  PageHeader,
  Panel,
  SearchInput,
  FilterChips,
  DataTablePagination,
  type Chip,
} from "@/shared/components"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  useGetInterviewerInvitationsQuery,
  useRespondToInterviewerInvitationMutation,
} from "../api/interviewer-api"
import { mapInterviewerInvitation } from "../utils/invitationAdapter"
import type {
  GetInterviewerInvitationsParams,
  StageInvitationFilter,
  StageInvitationItem,
} from "../types"
import {
  StageInvitationsTable,
  ConfirmAcceptStageDialog,
  ConfirmDeclineStageDialog,
  type StageSortKey,
} from "../components"

const statusItems: { label: string; value: StageInvitationFilter }[] = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
]
const apiStatuses: Record<
  Exclude<StageInvitationFilter, "all">,
  GetInterviewerInvitationsParams["status"]
> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
}

export function StageInvitationsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StageInvitationFilter>("all")
  const [sortKey, setSortKey] = useState<StageSortKey>("recruitment")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [action, setAction] = useState<{
    id: string
    response: "Accepted" | "Declined"
  } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const { currentData, isLoading, isFetching, isError, error, refetch } =
    useGetInterviewerInvitationsQuery(
      {
        status: statusFilter === "all" ? undefined : apiStatuses[statusFilter],
      },
      { refetchOnMountOrArgChange: true }
    )
  const [respondToInvitation, { isLoading: isResponding }] =
    useRespondToInterviewerInvitationMutation()
  const invitations = useMemo(
    () => (currentData ?? []).map(mapInterviewerInvitation),
    [currentData]
  )
  const selectedInvitation =
    invitations.find((item) => item.id === action?.id) ?? null

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = invitations.filter(
      (item) =>
        !query ||
        item.recruitmentName.toLowerCase().includes(query) ||
        item.recruitmentBatchCode.toLowerCase().includes(query) ||
        item.stageName.toLowerCase().includes(query) ||
        item.stageTypeName.toLowerCase().includes(query)
    )
    return result.sort((a, b) => {
      let comparison: number
      switch (sortKey) {
        case "recruitment":
          comparison = a.recruitmentName.localeCompare(b.recruitmentName)
          break
        case "stage":
          comparison = a.stageName.localeCompare(b.stageName)
          break
        case "period":
          comparison =
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [invitations, search, sortKey, sortDirection])
  const totalItems = filteredInvitations.length
  const safePage = Math.min(page, Math.max(1, Math.ceil(totalItems / pageSize)))
  const start = (safePage - 1) * pageSize
  const paginatedInvitations = filteredInvitations.slice(
    start,
    start + pageSize
  )

  const handleSort = (key: string) => {
    if (!["recruitment", "stage", "period", "status"].includes(key)) return
    const nextKey = key as StageSortKey
    setSortDirection(
      sortKey === nextKey && sortDirection === "asc" ? "desc" : "asc"
    )
    setSortKey(nextKey)
    setPage(1)
  }
  const activeChips: Chip[] = []
  if (search.trim())
    activeChips.push({
      key: "search",
      label: 'Search: "' + search + '"',
      onRemove: () => {
        setSearch("")
        setPage(1)
      },
    })
  if (statusFilter !== "all")
    activeChips.push({
      key: "status",
      label:
        "Status: " +
        statusItems.find((item) => item.value === statusFilter)?.label,
      onRemove: () => {
        setStatusFilter("all")
        setPage(1)
      },
    })
  const handleResetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setPage(1)
  }

  const openResponse = (
    item: StageInvitationItem,
    response: "Accepted" | "Declined"
  ) => {
    setNotice(null)
    setAction({ id: item.id, response })
  }
  const handleResponse = async (note: string | null) => {
    if (
      !action ||
      !selectedInvitation ||
      selectedInvitation.status !== "pending"
    ) {
      throw new Error(
        "Refresh the invitation list before responding to this assignment."
      )
    }
    if (isResponding) return
    await respondToInvitation({
      invitationId: action.id,
      body: { response: action.response, note },
    }).unwrap()
    setNotice(
      action.response === "Accepted"
        ? "Stage invitation accepted."
        : "Stage invitation declined."
    )
    setAction(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage Interviewer Invitations"
        description="Review and respond to your recruitment stage assignments."
      />
      <Panel>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Search batch or stage..."
              containerClassName="sm:w-80"
            />
            <Select
              items={statusItems}
              value={statusFilter}
              onValueChange={(value) => {
                const next = statusItems.find(
                  (item) => item.value === value
                )?.value
                if (next) {
                  setStatusFilter(next)
                  setPage(1)
                }
              }}
            >
              <SelectTrigger className="h-10 w-48 rounded-full border-0 bg-muted px-4 text-sm text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-primary">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isFetching || isResponding}
            onClick={() => void refetch()}
            className="h-9 gap-2 rounded-full bg-card px-4"
          >
            <RefreshCw className="size-4" aria-hidden />
            Refresh
          </Button>
        </div>
        <FilterChips chips={activeChips} onReset={handleResetFilters} />
        {notice && (
          <p role="status" className="px-5 py-3 text-sm text-success">
            {notice}
          </p>
        )}
        <StageInvitationsTable
          invitations={paginatedInvitations}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          hasActiveFilters={activeChips.length > 0}
          onResetFilters={handleResetFilters}
          isLoading={isLoading || isFetching}
          isError={isError}
          error={error}
          onRetry={() => void refetch()}
          onAccept={(item) => openResponse(item, "Accepted")}
          onDecline={(item) => openResponse(item, "Declined")}
        />
        {!isFetching && !isError && totalItems > 0 && (
          <DataTablePagination
            page={safePage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        )}
      </Panel>

      {action?.response === "Accepted" && selectedInvitation && (
        <ConfirmAcceptStageDialog
          key={action.id}
          open
          onOpenChange={(open) => {
            if (!open && !isResponding) setAction(null)
          }}
          item={selectedInvitation}
          onConfirm={() => handleResponse(null)}
        />
      )}
      {action?.response === "Declined" && selectedInvitation && (
        <ConfirmDeclineStageDialog
          key={action.id}
          open
          onOpenChange={(open) => {
            if (!open && !isResponding) setAction(null)
          }}
          item={selectedInvitation}
          onConfirm={(note) => handleResponse(note)}
        />
      )}
    </div>
  )
}
