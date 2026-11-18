import { useState, type RefObject } from "react"
import { AccountMenu } from "@workspace/ui/components/account-menu"
import { request } from "../api"
import type { CandidateSession } from "../session"

export function CandidateAccountMenu({ session, container, collapsed }: {
  session: CandidateSession
  collapsed?: boolean
  container?: RefObject<HTMLElement | null>
}) {
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState("")

  async function signOut() {
    setSignOutError("")
    setSigningOut(true)
    try {
      await request("/portal/session/logout", {})
      window.location.assign("/jobs")
    } catch (failure) {
      setSignOutError(failure instanceof Error ? failure.message : "Could not sign out. Try again.")
      setSigningOut(false)
    }
  }

  return (
    <>
      <AccountMenu
        name={session.profile?.fullName || session.email}
        email={session.email}
        role="Candidate"
        collapsed={collapsed}
        container={container}
        signingOut={signingOut}
        onLogout={() => void signOut()}
      />
      {signOutError && <p role="alert" className="px-2 text-sm text-destructive">{signOutError}</p>}
    </>
  )
}
