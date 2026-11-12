import { useState } from "react"
import { CheckCircle2, CirclePlay, CircleStop, Eye, MoreHorizontal, Plus, X } from "lucide-react"

// Primitives from @workspace/ui
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

// Shared internal components
import {
  PageHeader,
  Panel,
  SearchInput,
  FilterChips,
  TableSortHeader,
  StatusBadge,
  DataTablePagination,
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "@/shared/components"
import { formatPeriod } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"

// Feature-owned data, api & types
import type { Recruitment } from "../types"
import { getRecruitmentStatusMeta } from "../types"
import { CreateRecruitmentDialog } from "../components/CreateRecruitmentDialog"
import { OpenRecruitmentDialog } from "../components/OpenRecruitmentDialog"
import { CloseRecruitmentDialog } from "../components/CloseRecruitmentDialog"
import { formatCurrentStageText } from "../utils"
import { useRecruitmentsList } from "../hooks/useRecruitmentsList"

export function RecruitmentsListPage() {
  const [recruitmentToOpen, setRecruitmentToOpen] = useState<Recruitment | null>(null)
  const [recruitmentToClose, setRecruitmentToClose] = useState<Recruitment | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    search,
    searchTerm,
    setSearchTerm,
    statusFilter,
    sortKey,
    sortDirection,
    page,
    pageSize,
    recruitments,
    totalItems,
    isLoading,
    isError,
    refetch,
    isCreateOpen,
    setIsCreateOpen,
    activeChips,
    statusItems,
    handleStatusChange,
    handleSort,
    handlePageChange,
    handleResetFilters,
    handleViewDetail,
  } = useRecruitmentsList()

  const handleRecruitmentStatusUpdated = (batch: Recruitment) => {
    const status = getRecruitmentStatusMeta(batch.status)
    setSuccessMessage(`${batch.name} is now ${status.label}.`)
    if (
      statusFilter !== "all" &&
      getRecruitmentStatusMeta(statusFilter).label !== status.label &&
      recruitments.length === 1 &&
      page > 1
    ) {
      handlePageChange(page - 1)
    }
  }

  const renderCurrentStage = (r: Recruitment) => {
    const text = formatCurrentStageText(r)
    const isMuted =
      text === "No stages" ||
      text === "Not started" ||
      text === "All stages completed"

    return (
      <span className={cn("text-sm", isMuted ? "text-muted-foreground" : "font-normal text-foreground")}>
        {text}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitments"
        description="Each recruitment represents one job vacancy and its selection stages."
      />

      {successMessage && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          <p className="flex-1">{successMessage}</p>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-full text-emerald-800 hover:bg-emerald-100"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      )}

      <Panel>
        {/* Controls: Search, Filter, New Recruitment Button */}
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by code or position name"
            />

            <Select
              items={statusItems}
              value={statusFilter}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-36 rounded-full border-none bg-muted/60 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-primary">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-card p-1 shadow-md">
                {statusItems.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    className="cursor-pointer rounded-lg text-xs"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateOpen(true)}
              size="sm"
              className="h-10 gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="size-3.5" aria-hidden />
              <span>New Recruitment</span>
            </Button>
          </div>
        </div>

        {/* Filter chips bar */}
        {activeChips.length > 0 && (
          <div className="border-b border-border bg-muted/20 px-5 py-2.5">
            <FilterChips
              chips={activeChips}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Table Section */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableSortHeader
                  label="Code"
                  sortKey="code"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="w-52 pl-5"
                />
                <TableSortHeader
                  label="Name"
                  sortKey="name"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="left"
                  className="min-w-64"
                />
                <TableSortHeader
                  label="Current Stage"
                  sortKey="stage"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  className="w-48"
                />
                <TableSortHeader
                  label="Active Candidates"
                  sortKey="candidates"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                  className="w-36"
                />
                <TableSortHeader
                  label="Period"
                  sortKey="period"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                  className="w-56"
                />
                <TableSortHeader
                  label="Status"
                  sortKey="status"
                  currentSortKey={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                  className="w-28"
                />
                <TableSortHeader
                  label=""
                  align="right"
                  className="w-16 pr-5"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 1. Loading state (skeleton rows only; header and controls remain visible) */}
              {isLoading ? (
                <TableSkeleton
                  rowCount={5}
                  colWidths={[
                    "w-24",
                    ["w-44", "w-28"],
                    "w-32",
                    "w-12 mx-auto",
                    "w-36 mx-auto",
                    "w-20 mx-auto",
                    "w-6 ml-auto",
                  ]}
                  cellClassNames={[
                    "pl-5",
                    "py-3",
                    "",
                    "text-center",
                    "text-center",
                    "text-center",
                    "pr-5 text-right",
                  ]}
                />
              ) : isError ? (
                /* 2. Error state (generic message, reusable) */
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <ErrorState
                      title="Failed to load recruitments"
                      description="Something went wrong while fetching recruitment data. Please check your connection and try again."
                      onRetry={() => refetch()}
                    />
                  </TableCell>
                </TableRow>
              ) : recruitments.length === 0 ? (
                /* 3. Empty state */
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <EmptyState
                      title="No recruitments match"
                      description={
                        search || statusFilter !== "all"
                          ? "Change keywords or clear filters to view other recruitments."
                          : "No recruitment batches found. Create your first batch to start accepting candidates."
                      }
                      action={
                        search || statusFilter !== "all" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="rounded-full border-0 bg-muted/60 text-foreground hover:bg-muted cursor-pointer"
                          >
                            Reset filters
                          </Button>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                /* 4. Data rows */
                recruitments.map((recruitment) => {
                  const statusMeta = getRecruitmentStatusMeta(recruitment.status)
                  const candidateCount = recruitment.activeCandidateCount ?? "—"

                  return (
                    <TableRow
                      key={recruitment.id}
                      className="cursor-pointer border-b border-border transition-colors hover:bg-muted/40"
                      onClick={() => handleViewDetail(recruitment.id)}
                    >
                      <TableCell className="pl-5 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-muted-foreground">
                          {recruitment.batchCode}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleViewDetail(recruitment.id)
                            }}
                            className="text-left text-sm font-semibold text-foreground transition-colors hover:text-primary hover:underline cursor-pointer"
                          >
                            {recruitment.name}
                          </button>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {recruitment.departmentName || recruitment.division || "—"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm">
                        {renderCurrentStage(recruitment)}
                      </TableCell>

                      <TableCell className="text-center tabular-nums text-sm font-normal text-muted-foreground">
                        {candidateCount}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-center text-sm tabular-nums text-muted-foreground">
                        {formatPeriod(
                          recruitment.startDate || recruitment.openDate || "",
                          recruitment.endDate || recruitment.closeDate || ""
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-center">
                        <StatusBadge tone={statusMeta.tone}>
                          {statusMeta.label}
                        </StatusBadge>
                      </TableCell>

                      <TableCell
                        className="pr-5 text-right whitespace-nowrap"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-8 rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted cursor-pointer"
                                aria-label={`Actions for ${recruitment.name}`}
                                title="Recruitment actions"
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card p-1">
                            <DropdownMenuItem onClick={() => handleViewDetail(recruitment.id)}>
                              <Eye className="size-4" aria-hidden />
                              View Detail
                            </DropdownMenuItem>
                            {statusMeta.label === "Draft" && (
                              <DropdownMenuItem onClick={() => {
                                setSuccessMessage(null)
                                setRecruitmentToOpen(recruitment)
                              }}>
                                <CirclePlay className="size-4" aria-hidden />
                                Open Recruitment
                              </DropdownMenuItem>
                            )}
                            {statusMeta.label === "Open" && (
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={recruitment.canClose !== true}
                                title={recruitment.canClose === true
                                  ? "Close Recruitment"
                                  : "Complete all active selection stages before closing."}
                                onClick={() => {
                                  setSuccessMessage(null)
                                  setRecruitmentToClose(recruitment)
                                }}
                              >
                                <CircleStop className="size-4" aria-hidden />
                                Close Recruitment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Server Pagination */}
        {!isLoading && !isError && totalItems > 0 && (
          <div className="border-t border-border px-5 py-4">
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Panel>

      {recruitmentToOpen && (
        <OpenRecruitmentDialog
          recruitment={recruitmentToOpen}
          open
          onOpenChange={(open) => {
            if (!open) setRecruitmentToOpen(null)
          }}
          onSuccess={handleRecruitmentStatusUpdated}
        />
      )}

      {recruitmentToClose && (
        <CloseRecruitmentDialog
          recruitment={recruitmentToClose}
          open
          onOpenChange={(open) => {
            if (!open) setRecruitmentToClose(null)
          }}
          onSuccess={handleRecruitmentStatusUpdated}
        />
      )}

      <CreateRecruitmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
