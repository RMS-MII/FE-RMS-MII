import { Fragment, useEffect, useState, type ReactNode } from "react"
import {
  Briefcase,
  ChevronDown,
  LayoutDashboard,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  UserCog,
  Users,
  Mail,
  CalendarCheck,
  KeyRound,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { cn } from "@/shared/lib/utils"
import { useAppSelector } from "@/app/store"
import type { UserRole } from "@/features/auth"

// Import shadcn primitives from @workspace/ui
import { Button } from "@workspace/ui/components/button"
import { AccountMenu } from "@workspace/ui/components/account-menu"
import { Brand as RekrutinBrand } from "@workspace/ui/components/brand"
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

export interface Crumb {
  label: string
  to?: string
  search?: Record<string, unknown>
}

export interface NavSubItem {
  to: string
  label: string
  roles: UserRole[]
  match: (path: string) => boolean
}

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles: UserRole[]
  match: (path: string) => boolean
  children?: NavSubItem[]
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const startsWith = (p: string) => (path: string) =>
  path === p || path.startsWith(p + "/")

const NAV: NavGroup[] = [
  {
    label: "Recruitment",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["HR", "Interviewer"],
        match: startsWith("/dashboard"),
      },
      {
        to: "/interviews/stages",
        label: "My Interviews",
        icon: CalendarCheck,
        roles: ["HR", "Interviewer"],
        match: startsWith("/interviews"),
        children: [
          {
            to: "/interviews/stages",
            label: "Stage Invitations",
            roles: ["HR", "Interviewer"],
            match: startsWith("/interviews/stages"),
          },
          {
            to: "/interviews/schedules",
            label: "Interview Schedules",
            roles: ["HR", "Interviewer"],
            match: startsWith("/interviews/schedules"),
          },
        ],
      },
      {
        to: "/recruitments",
        label: "Recruitments",
        icon: Briefcase,
        roles: ["HR"],
        match: startsWith("/recruitments"),
      },
      {
        to: "/candidates",
        label: "Candidates",
        icon: Users,
        roles: ["HR"],
        match: startsWith("/candidates"),
      },
      {
        to: "/email-logs",
        label: "Email Logs",
        icon: Mail,
        roles: ["HR"],
        match: startsWith("/email-logs"),
      },
    ],
  },
  {
    label: "Other",
    items: [
      {
        to: "/users",
        label: "Users",
        icon: UserCog,
        roles: ["HR"],
        match: startsWith("/users"),
      },
    ],
  },
]

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Rekrutin, to dashboard"
      className={cn(
        "flex items-center gap-2.5 rounded-lg",
        collapsed && "justify-center"
      )}
    >
      <RekrutinBrand compact={collapsed} />
    </Link>
  )
}

function Nav({
  path,
  collapsed,
  onNavigate,
}: {
  path: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const role = useAppSelector((state) => state.auth.user?.role) ?? "HR"

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "flex flex-1 flex-col",
        collapsed ? "overflow-visible" : "overflow-y-auto"
      )}
    >
      {NAV.map((group, gi) => {
        const visible = group.items.filter((n) => n.roles.includes(role))
        if (!visible.length) return null

        return (
          <ul
            key={gi}
            className={cn(
              "flex flex-col gap-1.5 py-6",
              collapsed ? "items-center px-3" : "px-5",
              gi > 0 && "border-t border-border"
            )}
          >
            {visible.map((n) => {
              const active = n.match(path)
              const Icon = n.icon

              return (
                <li key={n.to} className="group/item relative">
                  <Link
                    to={n.to}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    aria-label={collapsed ? n.label : undefined}
                    className={cn(
                      "flex h-10 items-center rounded-full text-sm font-medium transition-colors duration-150",
                      collapsed ? "size-10 justify-center" : "gap-3 px-4",
                      active
                        ? "bg-primary-50 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="relative shrink-0">
                      <Icon
                        className="size-4.5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                    {!collapsed && (
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className="truncate">{n.label}</span>
                        {n.children && (
                          <ChevronDown
                            className={cn(
                              "size-3.5 text-muted-foreground transition-transform duration-200",
                              active && "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    )}
                  </Link>

                  {/* Nested Sub-menu Links (when expanded and active) */}
                  {n.children && !collapsed && active && (
                    <ul className="ml-6 pl-3 border-l border-border/80 flex flex-col gap-1 mt-1 mb-1">
                      {n.children
                        .filter((sub) => sub.roles.includes(role))
                        .map((sub) => {
                          const subActive = sub.match(path)

                          return (
                            <li key={sub.to + sub.label}>
                              <Link
                                to={sub.to}
                                onClick={onNavigate}
                                className={cn(
                                  "flex h-8 items-center justify-between rounded-full px-3 text-xs font-medium transition-colors duration-150",
                                  subActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                <span className="truncate">{sub.label}</span>
                              </Link>
                            </li>
                          )
                        })}
                    </ul>
                  )}

                  {collapsed && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute top-1/2 left-full z-50 ml-4 -translate-y-1/2 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-card opacity-0 transition-opacity duration-150 group-hover/item:opacity-100 group-focus-within/item:opacity-100 shadow-md"
                    >
                      {n.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )
      })}
    </nav>
  )
}

function UserCard({
  collapsed,
  onLogout,
}: {
  collapsed?: boolean
  onLogout: () => void
}) {
  const user = useAppSelector((state) => state.auth.user)
  const name = user?.name || "User"
  const email = user?.email || ""
  const role = user?.role || ""

  return (
    <AccountMenu name={name} email={email} role={role} collapsed={collapsed} onLogout={onLogout}>
      <DropdownMenuItem render={<Link to="/change-password" />}>
        <KeyRound className="size-4" aria-hidden />
        Change Password
      </DropdownMenuItem>
    </AccountMenu>
  )
}

function formatTodayDate(): string {
  const date = new Date()
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function AppShell({
  path,
  crumbs,
  children,
  onLogout,
}: {
  path: string
  crumbs: Crumb[]
  children: ReactNode
  onLogout: () => void
}) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("rms.sidebar") === "1"
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(
    () => localStorage.setItem("rms.sidebar", collapsed ? "1" : "0"),
    [collapsed]
  )

  const toggle = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((c) => !c)
    } else {
      setSheetOpen(true)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside
        aria-label="Sidebar"
        className={cn(
          "relative my-3 ml-3 hidden shrink-0 flex-col rounded-2xl border border-border bg-card shadow-card transition-[width] duration-200 ease-out lg:flex",
          collapsed ? "w-17" : "w-62"
        )}
      >
        <div
          className={cn(
            "flex h-19 shrink-0 items-center",
            collapsed ? "justify-center px-3" : "px-5"
          )}
        >
          <Brand collapsed={collapsed} />
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={`${collapsed ? "Expand" : "Collapse"} sidebar (Ctrl+B)`}
          className="absolute top-3 -right-4.5 z-40 flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-card transition-colors duration-150 hover:bg-primary-50 hover:text-primary cursor-pointer"
        >
          {collapsed ? (
            <PanelLeftOpen
              className="size-4.5"
              strokeWidth={1.8}
              aria-hidden
            />
          ) : (
            <PanelLeftClose
              className="size-4.5"
              strokeWidth={1.8}
              aria-hidden
            />
          )}
        </button>

        <Nav path={path} collapsed={collapsed} />

        <div
          className={cn(
            "shrink-0 border-t border-border py-3",
            collapsed ? "px-3" : "px-3.5"
          )}
        >
          <UserCard collapsed={collapsed} onLogout={onLogout} />
        </div>
      </aside>

      <Drawer
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        swipeDirection="left"
      >
        <DrawerContent className="w-72 max-w-[85vw] h-full flex flex-col p-2">
          <DrawerHeader className="h-19 px-5 flex items-center justify-between border-b border-border">
            <DrawerTitle>
              <Brand />
            </DrawerTitle>
          </DrawerHeader>
          <Nav path={path} onNavigate={() => setSheetOpen(false)} />
          <div className="shrink-0 border-t border-border px-3.5 py-3">
            <UserCard onLogout={onLogout} />
          </div>
        </DrawerContent>
      </Drawer>

      <div
        id="main-scroll"
        className="relative flex min-w-0 flex-1 flex-col overflow-y-auto px-3"
      >
        <header className="sticky top-0 z-30 shrink-0 bg-background pt-3">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-3 overflow-hidden lg:block"
            >
              <span className="absolute top-1/2 -left-8.5 size-11 -translate-y-1/2 rounded-full border border-border" />
            </div>

            <div className="header-notch flex h-15.5 items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-card md:px-5 lg:pl-8">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggle}
                className="-ml-1.5 text-muted-foreground lg:hidden"
                aria-label="Open navigation"
              >
                <MenuIcon aria-hidden />
              </Button>

              <Breadcrumb className="min-w-0 flex-1">
                <BreadcrumbList className="flex min-w-0 items-center gap-1.5 text-sm">
                  {crumbs.map((c, i) => {
                    const last = i === crumbs.length - 1
                    return (
                      <Fragment key={i}>
                        {i > 0 && (
                          <BreadcrumbSeparator
                            className={cn(!last && "hidden sm:inline-flex")}
                          />
                        )}
                        <BreadcrumbItem
                          className={cn(
                            "flex min-w-0 items-center gap-1.5",
                            !last && "hidden sm:flex"
                          )}
                        >
                          {c.to && !last ? (
                            <BreadcrumbLink
                              render={
                                <Link
                                  to={c.to}
                                  search={c.search}
                                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                                />
                              }
                            >
                              {c.label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="truncate font-medium text-foreground">
                              {c.label}
                            </BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </Fragment>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>

              <span className="hidden items-center gap-2 px-3 py-1.5 text-xs font-medium sm:inline-flex">
                {formatTodayDate()}
              </span>
            </div>
          </div>
        </header>

        <main id="konten" className="w-full flex-1 pt-6 pb-3">
          {children}
        </main>
      </div>
    </div>
  )
}
