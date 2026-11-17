import { useRef, useState } from "react"
import type { ReactNode } from "react"
import {
  LayoutDashboard,
  UserRound,
  CalendarDays,
  FileText,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  BriefcaseBusiness,
  LogOut,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { request, type Tasks } from "../api"
import { prefix, interviewSessionId, portalPage, pageTitle } from "../route"
import { PortalBrand } from "./PortalBrand"

export function PortalShell({
  children,
  data,
  selected,
  onSelect,
}: {
  children: ReactNode
  data?: Tasks
  selected?: string
  onSelect: (id: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
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

  const navigation = (
    <>
      <PortalBrand href={prefix} />
      <p className="nav-label">Candidate portal</p>
      <nav aria-label="Portal navigation" className="portal-nav">
        <a
          className={
            !interviewSessionId && portalPage === "overview" ? "current" : ""
          }
          aria-current={
            !interviewSessionId && portalPage === "overview"
              ? "page"
              : undefined
          }
          href={prefix}
          onClick={() => dialog.current?.close()}
        >
          <LayoutDashboard size={18} />
          Overview
        </a>
        <a
          className={
            interviewSessionId || portalPage === "interviews" ? "current" : ""
          }
          aria-current={
            interviewSessionId
              ? "location"
              : portalPage === "interviews"
                ? "page"
                : undefined
          }
          href={`${prefix}/interviews`}
          onClick={() => dialog.current?.close()}
        >
          <CalendarDays size={18} />
          Interviews
        </a>
        <a
          className={
            !interviewSessionId && portalPage === "assignments" ? "current" : ""
          }
          aria-current={
            !interviewSessionId && portalPage === "assignments"
              ? "page"
              : undefined
          }
          href={`${prefix}/assignments`}
          onClick={() => dialog.current?.close()}
        >
          <FileText size={18} />
          Take-home tasks
        </a>
        <a href="/profile"><UserRound size={18} /> My profile</a>
        <a href="/jobs"><BriefcaseBusiness size={18} /> Open positions</a>
      </nav>
      {!!data?.applications.length && (
        <>
          <p className="nav-label">Your applications</p>
          <nav aria-label="Select application" className="application-nav">
            {data.applications.map((a) => (
              <button
                key={a.id}
                className={`application-choice ${a.id === selected ? "selected" : ""}`}
                aria-pressed={a.id === selected}
                onClick={() => {
                  onSelect(a.id)
                  dialog.current?.close()
                }}
                disabled={Boolean(interviewSessionId)}
              >
                <BriefcaseBusiness size={16} />
                <span>
                  <strong>{a.batchName}</strong>
                  <small>{a.codeApplication}</small>
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </nav>
        </>
      )}
      <div className="sidebar-bottom">
        <div className="help-note">
          <HelpCircle size={17} />
          <div>
            <strong>Need help?</strong>
            <p>
              Reply to your invitation email to contact the recruitment team.
            </p>
          </div>
        </div>
        {data && (
          <div className="sidebar-profile">
            <div className="avatar" aria-hidden="true">
              {data.candidateName
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <strong>{data.candidateName}</strong>
              <small>{data.candidateEmail}</small>
            </div>
          </div>
        )}
        <Button type="button" variant="ghost" className="mt-2 w-full justify-start rounded-full" disabled={signingOut}
          onClick={() => void signOut()}>
          <LogOut size={18} aria-hidden /> {signingOut ? "Signing out…" : "Sign out"}
        </Button>
        {signOutError && <p role="alert" className="px-3 text-sm text-destructive">{signOutError}</p>}
      </div>
    </>
  )
  return (
    <div className="portal">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="desktop-sidebar">{navigation}</aside>
      <dialog
        aria-label="Candidate portal navigation"
        ref={dialog}
        className="mobile-sidebar"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close()
        }}
      >
        <div className="drawer-content">
          <Button
            className="drawer-close"
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={() => dialog.current?.close()}
          >
            <X size={18} />
          </Button>
          {navigation}
        </div>
      </dialog>
      <div className="portal-workspace">
        <header className="workspace-header">
          <div className="breadcrumb">
            <Button
              className="mobile-menu"
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              onClick={() => dialog.current?.showModal()}
            >
              <Menu size={18} />
            </Button>
            <span>Candidate portal</span>
            <ChevronRight size={13} />
            <strong>{pageTitle}</strong>
          </div>
        </header>
        {children}
        <footer className="portal-footer">
          © {new Date().getFullYear()} PT Mitra Integrasi Informatika
        </footer>
      </div>
    </div>
  )
}
