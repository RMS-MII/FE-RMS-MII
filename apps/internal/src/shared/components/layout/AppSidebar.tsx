import { Link, useRouterState } from "@tanstack/react-router"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  FileCheck,
  FileText,
  UserCog,
} from "lucide-react"
import { useAppSelector } from "@/app/store"
import type { UserRole } from "@/features/auth"

interface NavItem {
  title: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["HR", "Interviewer"],
  },
  {
    title: "Rekrutmen",
    to: "/recruitments",
    icon: Briefcase,
    roles: ["HR"],
  },
  {
    title: "Kandidat",
    to: "/candidates",
    icon: Users,
    roles: ["HR"],
  },
  {
    title: "Wawancara",
    to: "/interviews",
    icon: Calendar,
    roles: ["HR", "Interviewer"],
  },
  {
    title: "Evaluasi",
    to: "/evaluations",
    icon: FileCheck,
    roles: ["Interviewer"],
  },
  {
    title: "Offering Letter",
    to: "/offering-letters",
    icon: FileText,
    roles: ["HR"],
  },
  {
    title: "Pengguna",
    to: "/users",
    icon: UserCog,
    roles: ["HR"],
  },
]

export function AppSidebar() {
  const routerState = useRouterState()
  const userRole = useAppSelector((state) => state.auth.user?.role) ?? "HR"
  const currentPath = routerState.location.pathname

  const accessibleItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <aside className="w-[248px] shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-border flex items-center gap-2">
        <span className="font-semibold text-base text-primary tracking-tight">
          RMS MII
        </span>
        <span className="text-xs text-muted-foreground font-medium">Internal</span>
      </div>

      {/* Navigation List */}
      <nav className="p-3 flex-1 space-y-1" aria-label="Navigasi Utama">
        {accessibleItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === "/dashboard"
              ? currentPath === "/dashboard" || currentPath === "/"
              : currentPath.startsWith(item.to)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`h-9 px-3 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-secondary text-accent-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-accent-foreground" : "text-muted-foreground"
                }`}
              />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        Metrodata Recruitment
      </div>
    </aside>
  )
}

