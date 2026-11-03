import type { Recruitment } from "../../types"
import { Panel, StatusBadge, EmptyState } from "@/shared/components"
import { formatDate } from "@/shared/lib/format"
import { evaluations, interviews, candidates, users, type Recommendation } from "@/data/mock"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"

export interface EvaluationsTabProps {
  recruitment: Recruitment
}

const recommendationMap: Record<
  Recommendation,
  { label: string; tone: "success" | "warning" | "danger" }
> = {
  proceed: { label: "Proceed", tone: "success" },
  uncertain: { label: "Uncertain", tone: "warning" },
  reject: { label: "Reject", tone: "danger" },
}

export function EvaluationsTab({ recruitment }: EvaluationsTabProps) {
  const recruitmentInterviews = interviews.filter(
    (i) => i.recruitmentId === recruitment.id
  )

  const relevantEvaluations = evaluations
    .filter((e) => recruitmentInterviews.some((i) => i.id === e.interviewId))
    .map((e) => ({
      evaluation: e,
      interview: recruitmentInterviews.find((i) => i.id === e.interviewId)!,
    }))

  if (relevantEvaluations.length === 0) {
    return (
      <Panel className="p-8">
        <EmptyState
          title="No evaluations submitted"
          description="Evaluations will appear here after interviewers submit their assessment."
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
              <TableHead>Stage</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Scores (Avg)</TableHead>
              <TableHead>Recommendation</TableHead>
              <TableHead className="hidden lg:table-cell">Notes</TableHead>
              <TableHead className="pr-5 text-right">Submitted Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relevantEvaluations.map(({ evaluation: e, interview: iv }) => {
              const candidate = candidates.find((c) => c.id === iv.candidateId)
              const stage = recruitment.stages[iv.stageIndex]
              const interviewer = users.find((u) => u.id === e.interviewerId)

              const scoresArray = Object.values(e.scores).filter((s) => s > 0)
              const avgScore =
                scoresArray.length > 0
                  ? (
                      scoresArray.reduce((acc, v) => acc + v, 0) / scoresArray.length
                    ).toFixed(1)
                  : "–"

              const recMeta = e.recommendation ? recommendationMap[e.recommendation] : null

              return (
                <TableRow
                  key={`${e.interviewId}-${e.interviewerId}`}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  <TableCell className="pl-5 py-3 font-medium text-foreground whitespace-nowrap">
                    {candidate?.name ?? iv.candidateId}
                  </TableCell>

                  <TableCell className="text-sm text-foreground whitespace-nowrap">
                    {stage ? stage.name : `Stage ${iv.stageIndex + 1}`}
                  </TableCell>

                  <TableCell className="text-sm text-foreground whitespace-nowrap">
                    {interviewer?.name ?? e.interviewerId}
                  </TableCell>

                  <TableCell className="tabular-nums text-sm font-semibold text-primary whitespace-nowrap">
                    {avgScore} / 5.0
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {recMeta ? (
                      <StatusBadge tone={recMeta.tone}>{recMeta.label}</StatusBadge>
                    ) : (
                      <span className="text-xs text-muted-foreground">In Review</span>
                    )}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-sm truncate">
                    {e.notes || "–"}
                  </TableCell>

                  <TableCell className="pr-5 text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {formatDate(e.updatedAt)}
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

