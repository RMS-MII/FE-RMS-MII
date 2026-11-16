import { useEffect } from "react"
import { ExamInvalidLinkScreen } from "@/features/exam/components/ExamStateScreens"
import { ExamTestPage } from "@/features/exam/ExamTestPage"
import { candidatePortalUrl } from "@/lib/candidate-portal-url"
import { parseAppRoute } from "@/lib/route"

function CandidatePortalRedirect({ candidateId }: { candidateId: string }) {
  const destination = candidatePortalUrl(`/portal/${encodeURIComponent(candidateId)}`)

  useEffect(() => {
    window.location.replace(destination)
  }, [destination])

  return <a href={destination}>Open candidate portal</a>
}

export function App() {
  const route = parseAppRoute(window.location.pathname)

  if (!route) {
    return <ExamInvalidLinkScreen />
  }

  if (route.kind === "portal") {
    return <CandidatePortalRedirect candidateId={route.candidateId} />
  }

  return (
    <ExamTestPage
      key={`${route.candidateId}:${route.stageId}`}
      candidateId={route.candidateId}
      stageId={route.stageId}
    />
  )
}
