import { useState, useMemo, useEffect } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
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
  type Chip,
  type SortDirection,
} from "@/shared/components"
import { mockCandidates } from "../data/mock"
import { filterCandidates, sortCandidates } from "../utils"
import {
  CandidateTable,
  CandidateDetailDialog,
} from "../components"
import type { Candidate, CandidateSearchParams, CandidateSortKey } from "../types"

const genderItems = [
  { label: "All Genders", value: "all" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
]

const batchStatusItems = [
  { label: "All Applications", value: "all" },
  { label: "Has Applications", value: "applied" },
  { label: "Talent Pool", value: "pool" },
]

export function CandidatesListPage() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: "/_auth/candidates/" })

  // Search parameters from URL with defaults
  const search = searchParams.search ?? ""
  const gender = searchParams.gender ?? "all"
  const batchStatus = searchParams.batchStatus ?? "all"
  const sortKey = (searchParams.sort as CandidateSortKey) ?? "createdAt"
  const sortDirection = (searchParams.order as SortDirection) ?? "desc"
  const page = searchParams.page ? Number(searchParams.page) : 1
  const pageSize = searchParams.pageSize ? Number(searchParams.pageSize) : 5

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Local state for smooth typing in SearchInput
  const [searchTerm, setSearchTerm] = useState(search)

  useEffect(() => {
    setSearchTerm(search)
  }, [search])

  useEffect(() => {
    if (searchTerm === search) return

    const timer = setTimeout(() => {
      handleUpdateSearch({
        search: searchTerm.trim() ? searchTerm.trim() : "",
        page: 1,
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, search])

  const handleUpdateSearch = (updates: Partial<CandidateSearchParams>) => {
    navigate({
      to: "/candidates",
      search: (prev) => ({
        ...prev,
        search: updates.search !== undefined ? (updates.search.trim() ? updates.search.trim() : undefined) : prev.search,
        gender: updates.gender !== undefined ? (updates.gender === "all" ? undefined : updates.gender) : prev.gender,
        batchStatus:
          updates.batchStatus !== undefined
            ? updates.batchStatus === "all"
              ? undefined
              : updates.batchStatus
            : prev.batchStatus,
        sort: updates.sort !== undefined ? updates.sort : prev.sort,
        order: updates.order !== undefined ? updates.order : prev.order,
        page: updates.page !== undefined ? (updates.page === 1 ? undefined : updates.page) : prev.page,
        pageSize: updates.pageSize !== undefined ? (updates.pageSize === 5 ? undefined : updates.pageSize) : prev.pageSize,
      }),
    })
  }

  // Filter & Sort candidates
  const filteredCandidates = useMemo(() => {
    return filterCandidates(mockCandidates, search, gender, batchStatus)
  }, [search, gender, batchStatus])

  const sortedCandidates = useMemo(() => {
    return sortCandidates(filteredCandidates, sortKey, sortDirection)
  }, [filteredCandidates, sortKey, sortDirection])

  // Paginated slice
  const paginatedCandidates = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedCandidates.slice(start, start + pageSize)
  }, [sortedCandidates, page, pageSize])

  const handleSortChange = (key: CandidateSortKey) => {
    if (sortKey === key) {
      handleUpdateSearch({
        sort: key,
        order: sortDirection === "asc" ? "desc" : "asc",
        page: 1,
      })
    } else {
      handleUpdateSearch({
        sort: key,
        order: "asc",
        page: 1,
      })
    }
  }

  const handleOpenDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsDetailOpen(true)
  }

  // Active filter chips for easy reset
  const activeChips: Chip[] = useMemo(() => {
    const chips: Chip[] = []
    if (search.trim()) {
      chips.push({
        key: "search",
        label: `Search: "${search}"`,
        onRemove: () => {
          setSearchTerm("")
          handleUpdateSearch({ search: "", page: 1 })
        },
      })
    }
    if (gender && gender !== "all") {
      const match = genderItems.find((g) => g.value === gender)
      chips.push({
        key: "gender",
        label: `Gender: ${match?.label || gender}`,
        onRemove: () => handleUpdateSearch({ gender: "all", page: 1 }),
      })
    }
    if (batchStatus && batchStatus !== "all") {
      const match = batchStatusItems.find((b) => b.value === batchStatus)
      chips.push({
        key: "batchStatus",
        label: `Application: ${match?.label || batchStatus}`,
        onRemove: () => handleUpdateSearch({ batchStatus: "all", page: 1 }),
      })
    }
    return chips
  }, [search, gender, batchStatus])

  const handleResetFilters = () => {
    setSearchTerm("")
    handleUpdateSearch({
      search: "",
      gender: "all",
      batchStatus: "all",
      page: 1,
    })
  }

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
              containerClassName="sm:w-96"
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
          candidates={paginatedCandidates}
          totalItems={sortedCandidates.length}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => handleUpdateSearch({ page: p })}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onSelectCandidate={handleOpenDetail}
          hasActiveFilters={activeChips.length > 0}
          onResetFilters={handleResetFilters}
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
