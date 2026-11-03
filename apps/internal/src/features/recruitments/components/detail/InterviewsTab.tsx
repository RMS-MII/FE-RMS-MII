import type { Recruitment } from "../../types"
import { Panel, EmptyState } from "@/shared/components"
import { formatDate } from "@/shared/lib/format"
import { interviews, candidates, users } from "@/data/mock"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"

export interface InterviewsTabProps {
  recruitment: Recruitment
}

export function InterviewsTab({ recruitment }: InterviewsTabProps) {
  const recruitmentInterviews = interviews.filter(
    (i) => i.recruitmentId === recruitment.id
  )

  if (recruitmentInterviews.length === 0) {
    return (
      <Panel className="p-8">
        <EmptyState
          title="No interviews scheduled"
          description="Interviews will appear here once candidates are invited to an interview stage."
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
              <TableHead>Date & Time</TableHead>
              <TableHead>Interviewers</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="pr-5">Location / Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recruitmentInterviews.map((iv) => {
              const candidate = candidates.find((c) => c.id === iv.candidateId)
              const stage = recruitment.stages[iv.stageIndex]
              const interviewerNames = iv.interviewerIds
                .map((uid) => users.find((u) => u.id === uid)?.name ?? uid)
                .join(", ")

              return (
                <TableRow
                  key={iv.id}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  <TableCell className="pl-5 py-3 font-medium text-foreground whitespace-nowrap">
                    {candidate?.name ?? iv.candidateId}
                  </TableCell>

                  <TableCell className="text-sm text-foreground whitespace-nowrap">
                    {stage ? stage.name : `Stage ${iv.stageIndex + 1}`}
                  </TableCell>

                  <TableCell className="tabular-nums text-sm whitespace-nowrap">
                    <span className="font-medium text-foreground">
                      {formatDate(iv.date)}
                    </span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {iv.start} – {iv.end}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {interviewerNames || "Unassigned"}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="rounded-full text-xs font-normal"
                    >
                      {iv.mode}
                    </Badge>
                  </TableCell>

                  <TableCell className="pr-5 text-sm text-muted-foreground max-w-xs truncate">
                    {iv.location}
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

