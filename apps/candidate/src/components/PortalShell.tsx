import { useEffect, useRef, useState } from "react"
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
} from "lucide-react"
import { SidebarHeader } from "@workspace/ui/components/sidebar-header"
import { Button } from "@workspace/ui/components/button"
import type { Tasks } from "../api"
import { prefix, interviewSessionId, portalPage, pageTitle } from "../route"
import { CandidateAccountMenu } from "./CandidateAccountMenu"
import type { CandidateSession } from "../session"
import { PortalBrand } from "./PortalBrand"

export function PortalShell({
  children,
  data,
  selected,
  session,
  onSelect,
}: {
  children: ReactNode
  session: CandidateSession
  data?: Tasks
  selected?: string
  onSelect: (id: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("candidate.sidebar") === "1"
  )
  useEffect(() => {
    localStorage.setItem("candidate.sidebar", collapsed ? "1" : "0")
  }, [collapsed])

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)")
    function onResize() {
      if (desktop.matches) dialog.current?.close()
    }
    function onKey(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "b")
        return
      if (document.querySelector("dialog[open]")) return
      event.preventDefault()
      if (desktop.matches) setCollapsed((value) => !value)
      else dialog.current?.showModal()
    }
    desktop.addEventListener("change", onResize)
    window.addEventListener("keydown", onKey)
    return () => {
      desktop.removeEventListener("change", onResize)
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  const links = [
    {
      label: "Overview",
      href: prefix,
      icon: LayoutDashboard,
      active: !interviewSessionId && portalPage === "overview",
    },
    {
      label: "Interviews",
      href: `${prefix}/interviews`,
      icon: CalendarDays,
      active: interviewSessionId || portalPage === "interviews",
    },
    {
      label: "Take-home tasks",
      href: `${prefix}/assignments`,
      icon: FileText,
      active: !interviewSessionId && portalPage === "assignments",
    },
    { label: "My profile", href: "/profile", icon: UserRound },
    { label: "Open positions", href: "/jobs", icon: BriefcaseBusiness },
  ]

  const navigation = (mobile: boolean) => {
    const compact = !mobile && collapsed
    return (
      <>
        <div className="sidebar-links">
          <p className="nav-label">Candidate portal</p>
          <nav aria-label="Portal navigation" className="portal-nav">
            {links.map(({ label, href, icon: Icon, active }) => (
              <a
                key={href}
                className={active ? "current" : undefined}
                aria-current={
                  active
                    ? interviewSessionId
                      ? "location"
                      : "page"
                    : undefined
                }
                title={compact ? label : undefined}
                href={href}
                onClick={() => dialog.current?.close()}
              >
                <Icon size={18} aria-hidden />
                <span className={compact ? "sr-only" : undefined}>{label}</span>
              </a>
            ))}
          </nav>
          {!!data?.applications.length && (
            <>
              <p className="nav-label">Your applications</p>
              <nav aria-label="Select application" className="application-nav">
                {data.applications.map((a) => (
                  <button
                    key={a.id}
                    className={`application-choice ${a.id === selected ? "selected" : ""}`}
                    title={
                      compact
                        ? `${a.batchName} · ${a.codeApplication}`
                        : undefined
                    }
                    aria-pressed={a.id === selected}
                    onClick={() => {
                      onSelect(a.id)
                      dialog.current?.close()
                    }}
                    disabled={Boolean(interviewSessionId)}
                  >
                    <BriefcaseBusiness size={16} />
                    <span className={compact ? "sr-only" : undefined}>
                      <strong>{a.batchName}</strong>
                      <small>{a.codeApplication}</small>
                    </span>
                    {!compact && <ChevronRight size={14} />}
                  </button>
                ))}
              </nav>
            </>
          )}
        </div>
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
          <div className="border-t border-border py-3">
            <CandidateAccountMenu
              collapsed={compact}
              session={session}
              container={mobile ? dialog : undefined}
            />
          </div>
        </div>
      </>
    )
  }
  return (
    <div className="portal" data-collapsed={collapsed}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="desktop-sidebar" aria-label="Sidebar">
        <SidebarHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        >
          <PortalBrand href={prefix} compact={collapsed} />
        </SidebarHeader>
        {navigation(false)}
      </aside>
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
          <div className="flex h-19 shrink-0 items-center justify-center">
            <PortalBrand href={prefix} />
          </div>
          {navigation(true)}
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
