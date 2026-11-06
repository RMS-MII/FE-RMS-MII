import { ExamInvalidLinkScreen } from "@/features/exam/components/ExamStateScreens"
import { ExamTestPage } from "@/features/exam/ExamTestPage"
import { CandidatePortalPage } from "@/features/portal/CandidatePortalPage"
import { parseAppRoute } from "@/lib/route"

export function App() {
  const route = parseAppRoute(window.location.pathname)

  if (!route) {
    return <ExamInvalidLinkScreen />
  }

  if (route.kind === "portal") {
    return <CandidatePortalPage candidateId={route.candidateId} />
  }

  return (
    <ExamTestPage
      key={`${route.candidateId}:${route.stageId}`}
      candidateId={route.candidateId}
      stageId={route.stageId}
    />
  )
}
