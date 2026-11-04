import type { Recruitment } from "../../types"
import { Panel, StatusBadge, EmptyState } from "@/shared/components"
import { candidates, type Candidate } from "@/data/mock"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"

export interface DecisionsTabProps {
  recruitment: Recruitment
}

export function DecisionsTab({ recruitment }: DecisionsTabProps) {
  const pendingCandidates = candidates.filter(
    (c) => c.recruitmentId === recruitment.id && c.status === "pending"
  )

  if (pendingCandidates.length === 0) {
    return (
      <Panel className="p-8">
        <EmptyState
          title="No candidates awaiting decision"
          description="Candidates awaiting advancement or final decision will appear here."
        />
      </Panel>
    )
  }

  return (
    <Panel>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Candidate</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Action Needed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingCandidates.map((c: Candidate) => {
              const currentStage = recruitment.stages[c.stageIndex]

              return (
                <TableRow
                  key={c.id}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  <TableCell className="pl-5 py-3">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </TableCell>

                  <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                    {currentStage ? currentStage.name : `Stage ${c.stageIndex + 1}`}
                  </TableCell>

                  <TableCell className="tabular-nums text-sm font-semibold text-primary">
                    {c.testScore !== null ? `${c.testScore}` : "–"}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <StatusBadge tone="warning">Pending Review</StatusBadge>
                  </TableCell>

                  <TableCell className="pr-5 text-right">
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                      Ready for Decision
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}

