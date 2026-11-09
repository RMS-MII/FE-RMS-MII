import { useRef } from "react"
import type { ReactNode } from "react"
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  BriefcaseBusiness,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { Tasks } from "../api"
import { prefix, route, portalPage, pageTitle } from "../route"

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
  const navigation = (
    <>
      <a className="brand" href={prefix}>
        <svg
          viewBox="0 0 28 28"
          className="portal-brand-mark"
          aria-hidden="true"
        >
          <path
            d="M3 23V5h4.2L14 14.2 20.8 5H25v18h-4.4V12.4L14 21.2l-6.6-8.8V23z"
            fill="var(--primary)"
          />
        </svg>
        <span>Metrodata</span>
      </a>
      <p className="nav-label">PORTAL KANDIDAT</p>
      <nav aria-label="Navigasi portal" className="portal-nav">
        <a
          className={!route?.[2] && portalPage === "overview" ? "current" : ""}
          aria-current={
            !route?.[2] && portalPage === "overview" ? "page" : undefined
          }
          href={prefix}
          onClick={() => dialog.current?.close()}
        >
          <LayoutDashboard size={18} />
          Ringkasan
        </a>
        <a
          className={
            !route?.[2] && portalPage === "interviews" ? "current" : ""
          }
          aria-current={
            !route?.[2] && portalPage === "interviews" ? "page" : undefined
          }
          href={`${prefix}/interviews`}
          onClick={() => dialog.current?.close()}
        >
          <CalendarDays size={18} />
          Jadwal interview
        </a>
        <a
          className={
            !route?.[2] && portalPage === "assignments" ? "current" : ""
          }
          aria-current={
            !route?.[2] && portalPage === "assignments" ? "page" : undefined
          }
          href={`${prefix}/assignments`}
          onClick={() => dialog.current?.close()}
        >
          <FileText size={18} />
          Tugas take-home
        </a>
      </nav>
      {!!data?.applications.length && (
        <>
          <p className="nav-label">
            LAMARAN ANDA <span>{data.applications.length}</span>
          </p>
          <nav aria-label="Pilih lamaran" className="application-nav">
            {data.applications.map((a) => (
              <button
                key={a.id}
                className={`application-choice ${a.id === selected ? "selected" : ""}`}
                aria-pressed={a.id === selected}
                onClick={() => {
                  onSelect(a.id)
                  dialog.current?.close()
                }}
                disabled={Boolean(route?.[2])}
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
            <strong>Butuh bantuan?</strong>
            <p>Hubungi tim HR melalui email undangan Anda.</p>
          </div>
        </div>
        {data && (
          <div className="sidebar-profile">
            <div className="avatar">{data.candidateName.slice(0, 1)}</div>
            <div>
              <strong>{data.candidateName}</strong>
              <small>{data.candidateEmail}</small>
            </div>
          </div>
        )}
      </div>
    </>
  )
  return (
    <div className="portal">
      <aside className="desktop-sidebar">{navigation}</aside>
      <dialog
        aria-label="Navigasi portal kandidat"
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
            aria-label="Tutup navigasi"
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
              aria-label="Buka navigasi"
              onClick={() => dialog.current?.showModal()}
            >
              <Menu size={18} />
            </Button>
            <span>Portal kandidat</span>
            <ChevronRight size={13} />
            <strong>{pageTitle}</strong>
          </div>
          <span className="workspace-caption">RMS MII</span>
        </header>
        {children}
        <footer className="portal-footer">
          © {new Date().getFullYear()} PT Mitra Integrasi Informatika
          <span>Portal Kandidat</span>
        </footer>
      </div>
    </div>
  )
}
