import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  UserCog,
  Users,
  Check,
  Mail,
  CalendarCheck,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { cn } from "@/shared/lib/utils"
import { useAppDispatch, useAppSelector } from "@/app/store"
import { setRole, setDataMode } from "@/features/auth"
import type { DataMode, UserRole } from "@/features/auth"

// Import shadcn primitives from @workspace/ui
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
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
}

type BadgeKey = "interviews" | "stageInvitations" | "offerings"

export interface NavSubItem {
  to: string
  label: string
  roles: UserRole[]
  match: (path: string) => boolean
  badge?: BadgeKey
}

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles: UserRole[]
  match: (path: string) => boolean
  badge?: BadgeKey
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
        roles: ["Interviewer", "HR"],
        match: startsWith("/interviews"),
        badge: "interviews",
        children: [
          {
            to: "/interviews/stages",
            label: "Stage Invitations",
            roles: ["Interviewer", "HR"],
            match: startsWith("/interviews/stages"),
            badge: "stageInvitations",
          },
          {
            to: "/interviews/schedules",
            label: "Interview Schedules",
            roles: ["Interviewer", "HR"],
            match: startsWith("/interviews/schedules"),
            badge: "interviews",
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

function useBadges(): Record<BadgeKey, number> {
  const role = useAppSelector((state) => state.auth.user?.role) ?? "HR"
  return useMemo(() => {
    const stageInvitationsCount = 1
    const interviewsCount = 1
    const offeringsCount = role === "HR" ? 2 : 0
    return {
      interviews: interviewsCount,
      stageInvitations: stageInvitationsCount,
      offerings: offeringsCount,
    }
  }, [role])
}

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <path
        d="M3 23V5h4.2L14 14.2 20.8 5H25v18h-4.4V12.4L14 21.2l-6.6-8.8V23z"
        fill="var(--primary)"
      />
    </svg>
  )
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="RMS Metrodata, to dashboard"
      className={cn(
        "flex items-center gap-2.5 rounded-lg",
        collapsed && "justify-center"
      )}
    >
      <Mark className="size-8 shrink-0" />
      {!collapsed && (
        <span className="truncate text-lg font-semibold tracking-tight text-foreground">
          Metrodata
        </span>
      )}
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
  const badges = useBadges()

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
              const count = n.badge ? badges[n.badge] : 0

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
                      {count > 0 && (
                        <span
                          aria-hidden
                          className="absolute -bottom-0.5 -left-0.5 size-1.75 rounded-full bg-attention ring-2 ring-card"
                        />
                      )}
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
                    {count > 0 && (
                      <span className="sr-only">, {count} pending action</span>
                    )}
                  </Link>

                  {/* Nested Sub-menu Links (when expanded and active) */}
                  {n.children && !collapsed && active && (
                    <ul className="ml-6 pl-3 border-l border-border/80 flex flex-col gap-1 mt-1 mb-1">
                      {n.children
                        .filter((sub) => sub.roles.includes(role))
                        .map((sub) => {
                          const subActive = sub.match(path)
                          const subCount = sub.badge ? badges[sub.badge] : 0

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
                                {subCount > 0 && (
                                  <span className="flex items-center justify-center min-w-4.5 h-4 px-1.5 rounded-full bg-attention text-[10px] font-bold text-white leading-none">
                                    {subCount}
                                  </span>
                                )}
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
                      {count > 0 && (
                        <span className="ml-1.5 opacity-70 tabular-nums">
                          {count}
                        </span>
                      )}
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

const MODES: { id: DataMode; label: string }[] = [
  { id: "normal", label: "Populated" },
  { id: "loading", label: "Loading" },
  { id: "empty", label: "Empty" },
  { id: "error", label: "Error" },
]

function UserCard({
  collapsed,
  onLogout,
}: {
  collapsed?: boolean
  onLogout: () => void
}) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const role = user?.role ?? "HR"
  const dataMode = useAppSelector((state) => state.auth.dataMode)

  const me = {
    name: user?.name ?? "Fajar Mahendra",
    email: user?.email ?? "fajar.mahendra@metrodata.co.id",
  }

  const initials = me.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`User menu, ${me.name}`}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-colors hover:bg-muted outline-none",
              collapsed && "justify-center"
            )}
          />
        }
      >
        <Avatar className="size-9 bg-[#DCE3F0] text-primary">
          <AvatarFallback className="bg-[#DCE3F0] text-primary font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!collapsed && (
          <>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-xs text-muted-foreground">
                Welcome
              </span>
              <span className="mt-0.5 truncate text-sm font-semibold text-foreground">
                {me.name}
              </span>
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-foreground"
              strokeWidth={2.25}
              aria-hidden
            />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={10}
        className="w-64 p-2 rounded-xl"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-2 pt-1.5 pb-2.5">
          <Avatar className="size-8 bg-[#DCE3F0] text-primary">
            <AvatarFallback className="bg-[#DCE3F0] text-primary font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{me.name}</p>
            <p className="truncate text-xs text-muted-foreground">{me.email}</p>
          </div>
        </div>

        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">
            Sign in as (demo)
          </DropdownMenuLabel>
          {(["HR", "Interviewer"] as UserRole[]).map((r) => (
            <DropdownMenuItem
              key={r}
              onClick={() => dispatch(setRole(r))}
              className="flex items-center justify-between px-2 py-1.5 text-sm rounded-md cursor-pointer"
            >
              <span>{r}</span>
              {role === r && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
            Data state preview
          </DropdownMenuLabel>
          {MODES.map((m) => (
            <DropdownMenuItem
              key={m.id}
              onClick={() => dispatch(setDataMode(m.id))}
              className="flex items-center justify-between px-2 py-1.5 text-sm rounded-md cursor-pointer"
            >
              <span>{m.label}</span>
              {dataMode === m.id && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-destructive cursor-pointer hover:bg-destructive/10"
        >
          <LogOut className="size-4" aria-hidden />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const dataMode = useAppSelector((state) => state.auth.dataMode)
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

              {dataMode !== "normal" && (
                <span className="hidden rounded-full bg-warning-soft px-3 py-1 text-xs font-medium text-warning md:inline">
                  Preview state: {MODES.find((m) => m.id === dataMode)?.label}
                </span>
              )}

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
