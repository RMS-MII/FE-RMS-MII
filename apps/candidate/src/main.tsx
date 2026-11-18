import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@workspace/ui/globals.css"
import "./portal.css"
import { App } from "./App"
import {
  AccountLayout,
  CandidateLogin,
  CandidateProfileForm,
} from "./components/CandidateAccount"
import { JobsPage } from "./components/JobsPage"
import { candidateId } from "./route"
import { useCandidateSession } from "./hooks/useCandidateSession"
import {
  portalHome,
  profileLink,
  signInLink,
} from "./session"

const path = window.location.pathname.replace(/\/$/, "")
const isJobsPage = path === "" || path === "/jobs"

function CandidateSite() {
  const { session, error, loading } = useCandidateSession(path !== "/login")

  if (path === "/login") return <CandidateLogin />
  if (error)
    return (
      <AccountLayout title="Candidate portal unavailable">
        <p role="alert">{error}</p>
        <button
          type="button"
          className="text-primary underline"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </AccountLayout>
    )
  if (loading || session === undefined)
    return (
      <p role="status" className="p-6 text-sm text-muted-foreground">
        Loading candidate portal…
      </p>
    )
  if (isJobsPage) return <JobsPage session={session} />
  if (!session)
    return (
      <AccountLayout title="Sign in to open your candidate portal">
        <a className="text-primary underline" href={signInLink()}>
          Sign in with email
        </a>
      </AccountLayout>
    )
  if (path === "/profile") return <CandidateProfileForm session={session} />
  if (!session.profile)
    return (
      <AccountLayout title="Complete your candidate profile">
        <a className="text-primary underline" href={profileLink()}>
          Complete profile
        </a>
      </AccountLayout>
    )
  if (
    !candidateId ||
    session.profile.id.toLowerCase() !== candidateId.toLowerCase()
  )
    return (
      <AccountLayout
        title={
          candidateId
            ? "This invitation belongs to another candidate"
            : "Open your invitation link"
        }
      >
        <div className="flex gap-4">
          <a className="text-primary underline" href={portalHome(session)}>
            Open my portal
          </a>
          <a className="text-primary underline" href={signInLink()}>
            Use another email
          </a>
        </div>
      </AccountLayout>
    )
  return <App candidateSession={session} />
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CandidateSite />
  </StrictMode>
)
