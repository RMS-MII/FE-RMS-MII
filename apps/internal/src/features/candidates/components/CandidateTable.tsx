import { Eye, FileText, ExternalLink } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import {
  EmptyState,
  TableSortHeader,
  DataTablePagination,
  type SortDirection,
} from "@/shared/components"
import { formatCurrency, safeFormatDate } from "@/shared/lib/format"
import type { Candidate, CandidateSortKey } from "../types"

export interface CandidateTableProps {
  candidates: Candidate[]
  totalItems: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  sortKey: CandidateSortKey
  sortDirection: SortDirection
  onSortChange: (key: CandidateSortKey) => void
  onSelectCandidate: (candidate: Candidate) => void
  hasActiveFilters?: boolean
  onResetFilters?: () => void
}

export function CandidateTable({
  candidates,
  totalItems,
  page,
  pageSize,
  onPageChange,
  sortKey,
  sortDirection,
  onSortChange,
  onSelectCandidate,
  hasActiveFilters,
  onResetFilters,
}: CandidateTableProps) {
  const startIndex = (page - 1) * pageSize

  const handleSort = (key: string) => {
    onSortChange(key as CandidateSortKey)
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 pl-5 text-center">#</TableHead>

              <TableSortHeader
                label="Candidate Profile"
                sortKey="name"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />

              <TableSortHeader
                label="Education & Campus"
                sortKey="education"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />

              <TableSortHeader
                label="GPA"
                sortKey="gpa"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
                align="center"
              />

              <TableSortHeader
                label="Expected Salary"
                sortKey="salary"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />

              <TableSortHeader
                label="Applied Batches"
                sortKey="batches"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
                align="center"
              />

              <TableHead className="text-center whitespace-nowrap">Documents</TableHead>

              <TableSortHeader
                label="Registered"
                sortKey="createdAt"
                currentSortKey={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />

              <TableHead className="w-16 pr-5 text-center whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-64 text-center">
                  <EmptyState
                    title="No candidates match"
                    description={
                      hasActiveFilters
                        ? "Change keywords or clear filters to view other candidates."
                        : "No candidates currently registered in the database."
                    }
                    action={
                      hasActiveFilters && onResetFilters ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onResetFilters}
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
              candidates.map((c, idx) => {
                const rowNum = startIndex + idx + 1
                return (
                  <TableRow
                    key={c.id}
                    className="border-b border-border transition-colors hover:bg-muted/40 cursor-pointer"
                    onClick={() => onSelectCandidate(c)}
                  >
                    <TableCell className="pl-5 py-3.5 text-center font-semibold text-muted-foreground tabular-nums text-xs">
                      {rowNum}
                    </TableCell>

                    {/* Profile info: FullName, Email, Phone */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {c.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Education & Institution */}
                    <TableCell className="py-3.5">
                      <div className="min-w-0 max-w-64">
                        <p className="font-medium text-foreground text-xs truncate">
                          {c.education || "-"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {c.institution || "-"}
                        </p>
                      </div>
                    </TableCell>

                    {/* GPA */}
                    <TableCell className="py-3.5 text-center whitespace-nowrap">
                      {c.gpa ? (
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
                          {c.gpa}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Expected Salary */}
                    <TableCell className="py-3.5 whitespace-nowrap text-xs font-medium text-foreground">
                      {c.expectedSalary ? (
                        <span className="tabular-nums">
                          {formatCurrency(c.expectedSalary)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Negotiable</span>
                      )}
                    </TableCell>

                    {/* Applied Batches Count */}
                    <TableCell className="py-3.5 text-center whitespace-nowrap">
                      {c.appliedBatchCount > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground tabular-nums">
                          {c.appliedBatchCount} {c.appliedBatchCount === 1 ? "Batch" : "Batches"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                          Talent Pool
                        </span>
                      )}
                    </TableCell>

                    {/* Documents Shortcut */}
                    <TableCell
                      className="py-3.5 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {c.cv ? (
                          <a
                            href={`#${c.cv}`}
                            title={`CV: ${c.cv}`}
                            className="flex size-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                          >
                            <FileText className="size-3.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}

                        {c.portfolio && (
                          <a
                            href={c.portfolio}
                            target="_blank"
                            rel="noreferrer"
                            title="Portfolio"
                            className="flex size-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </div>
                    </TableCell>

                    {/* Registered Date */}
                    <TableCell className="py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                      {safeFormatDate(c.createdAt)}
                    </TableCell>

                    {/* Action: View Profile */}
                    <TableCell
                      className="pr-5 py-3.5 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onSelectCandidate(c)}
                        title="View candidate profile"
                        className="size-8 rounded-full border-0 bg-muted hover:bg-muted/60 text-foreground cursor-pointer"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
    </>
  )
}
