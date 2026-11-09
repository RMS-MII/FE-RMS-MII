import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Panel,
  PageHeader,
  SearchInput,
  FilterChips,
} from "@/shared/components"
import {
  CandidateTable,
  CandidateDetailDialog,
} from "../components"
import { useCandidatesList } from "../hooks"

export function CandidatesListPage() {
  const {
    searchTerm,
    setSearchTerm,
    gender,
    batchStatus,
    sortKey,
    sortDirection,
    page,
    pageSize,
    candidates,
    totalItems,
    isLoading,
    isFetching,
    isError,
    refetch,
    selectedCandidate,
    isDetailOpen,
    setIsDetailOpen,
    activeChips,
    genderItems,
    batchStatusItems,
    handleUpdateSearch,
    handleSortChange,
    handleOpenDetail,
    handleResetFilters,
  } = useCandidatesList()

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Candidate Pool"
        description="Browse registered candidate profiles, educational backgrounds, and their recruitment batch application history."
      />

      <Panel>
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, email, campus, or address..."
              containerClassName="sm:w-80"
            />

            <Select
              items={genderItems}
              value={gender}
              onValueChange={(val) =>
                handleUpdateSearch({ gender: (val as "all" | "male" | "female") || "all", page: 1 })
              }
            >
              <SelectTrigger className="h-10 w-40 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {genderItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              items={batchStatusItems}
              value={batchStatus}
              onValueChange={(val) =>
                handleUpdateSearch({ batchStatus: (val as "all" | "applied" | "pool") || "all", page: 1 })
              }
            >
              <SelectTrigger className="h-10 w-44 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
                <SelectValue placeholder="All Applications" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {batchStatusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <FilterChips chips={activeChips} onReset={handleResetFilters} />

        <CandidateTable
          candidates={candidates}
          totalItems={totalItems}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => handleUpdateSearch({ page: p })}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onSelectCandidate={handleOpenDetail}
          hasActiveFilters={activeChips.length > 0}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={() => refetch()}
        />
      </Panel>

      {/* Candidate Quick View Detail Dialog */}
      <CandidateDetailDialog
        candidate={selectedCandidate}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
