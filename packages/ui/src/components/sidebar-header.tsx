import type { ReactNode } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

export function SidebarHeader({
  children,
  collapsed,
  onToggle,
}: {
  children: ReactNode
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative flex h-19 shrink-0 items-center justify-center">
      {children}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={`${collapsed ? "Expand" : "Collapse"} sidebar (Ctrl+B)`}
        className="absolute top-3 -right-4.5 z-40 flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-foreground shadow-card transition-colors duration-150 hover:bg-primary-50 hover:text-primary"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4.5" strokeWidth={1.8} aria-hidden />
        ) : (
          <PanelLeftClose className="size-4.5" strokeWidth={1.8} aria-hidden />
        )}
      </button>
    </div>
  )
}
