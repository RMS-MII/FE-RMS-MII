import { useState, useMemo } from "react"
import type { Recruitment } from "../../types"
import { Panel, SearchInput, StatusBadge, EmptyState } from "@/shared/components"
import { formatDate } from "@/shared/lib/format"
import { candidates, type Candidate, type CandidateStatus } from "@/data/mock"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"

export interface CandidatesTabProps {
  recruitment: Recruitment
  selectedStageIndex?: number | null
  onStageChange?: (stageIndex: number | null) => void
}

const candidateStatusMap: Record<CandidateStatus, { label: string; tone: "info" | "warning" | "success" | "danger" | "neutral" }> = {
  in_progress: { label: "In Progress", tone: "info" },
  pending: { label: "Pending", tone: "warning" },
  accepted: { label: "Accepted", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
}

export function CandidatesTab({
  recruitment,
  selectedStageIndex = null,
}: CandidatesTabProps) {
  const [search, setSearch] = useState("")

  const recruitmentCandidates = useMemo(() => {
    return candidates.filter((c) => c.recruitmentId === recruitment.id)
  }, [recruitment.id])

  const filteredCandidates = useMemo(() => {
    return recruitmentCandidates.filter((c) => {
      if (selectedStageIndex !== null && c.stageIndex !== selectedStageIndex) {
        return false
      }
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.education.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [recruitmentCandidates, selectedStageIndex, search])

  return (
    <Panel className="space-y-0">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredCandidates.length}
          </span>{" "}
          of {recruitmentCandidates.length} candidates
          {selectedStageIndex !== null && recruitment.stages[selectedStageIndex] && (
            <span className="ml-1 text-primary">
              in Stage {selectedStageIndex + 1}: {recruitment.stages[selectedStageIndex]?.name}
            </span>
          )}
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search candidate name or education..."
          containerClassName="sm:w-80"
        />
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No candidates found"
            description="No candidates match the selected stage or search criteria."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Candidate Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Applied Date</TableHead>
                <TableHead className="pr-5 text-right">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((c: Candidate) => {
                const stage = recruitment.stages[c.stageIndex]
                const statusMeta = candidateStatusMap[c.status]

                return (
                  <TableRow
                    key={c.id}
                    className="border-b border-border transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="pl-5 py-3">
                      <div>
                        <span className="font-medium text-foreground">{c.name}</span>
                        <p className="text-xs text-muted-foreground">{c.education}</p>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-foreground">
                      {stage ? stage.name : `Stage ${c.stageIndex + 1}`}
                    </TableCell>

                    <TableCell className="tabular-nums text-sm font-medium">
                      {c.testScore !== null ? `${c.testScore}` : "–"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <StatusBadge tone={statusMeta.tone}>
                        {statusMeta.label}
                      </StatusBadge>
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(c.appliedAt)}
                    </TableCell>

                    <TableCell className="pr-5 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {c.source}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Panel>
  )
}

