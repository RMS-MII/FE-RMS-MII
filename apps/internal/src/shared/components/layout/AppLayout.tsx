import { useEffect } from "react"
import { Outlet, useRouterState, useNavigate } from "@tanstack/react-router"
import { AppShell } from "./AppShell"
import type { Crumb } from "./AppShell"
import { useAppDispatch, useAppSelector } from "@/app/store"
import { logout, setUser, useGetMeQuery, mapCurrentUserToAuthUser } from "@/features/auth"
import { initialRecruitments } from "@/features/recruitments/data/mock"

function getCrumbsForPath(path: string): Crumb[] {
  if (path.startsWith("/dashboard")) {
    return [{ label: "Dashboard" }]
  }

  // Recruitment manage stages page
  const stagesMatch = path.match(/^\/recruitments\/([^/]+)\/stages/)
  if (stagesMatch && stagesMatch[1]) {
    const id = stagesMatch[1]
    const rec = initialRecruitments.find((r) => r.id === id)
    return [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Recruitments", to: "/recruitments" },
      { label: rec ? rec.name : "Detail", to: `/recruitments/${id}` },
      { label: "Manage Stages" },
    ]
  }

  // Recruitment detail page
  const recruitmentMatch = path.match(/^\/recruitments\/([^/]+)/)
  if (recruitmentMatch && recruitmentMatch[1]) {
    const id = recruitmentMatch[1]
    const rec = initialRecruitments.find((r) => r.id === id)
    return [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Recruitments", to: "/recruitments" },
      { label: rec ? rec.name : "Detail" },
    ]
  }

  if (path.startsWith("/recruitments")) {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "Recruitments" }]
  }
  if (path.startsWith("/candidates")) {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "Candidates" }]
  }
  if (path.startsWith("/email-logs")) {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "Email Logs" }]
  }
  if (path.startsWith("/users")) {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "Users" }]
  }
  if (path.startsWith("/interviews/stages")) {
    return [
      { label: "Dashboard", to: "/dashboard" },
      { label: "My Interviews", to: "/interviews/stages" },
      { label: "Stage Invitations" },
    ]
  }
  if (path.startsWith("/interviews/schedules")) {
    return [
      { label: "Dashboard", to: "/dashboard" },
      { label: "My Interviews", to: "/interviews/schedules" },
      { label: "Interview Schedules" },
    ]
  }
  if (path.startsWith("/interviews")) {
    return [
      { label: "Dashboard", to: "/dashboard" },
      { label: "My Interviews", to: "/interviews/stages" },
    ]
  }
  const cleanPath = path.replace("/", "")
  const capitalized = cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1)
  return [{ label: "Dashboard", to: "/dashboard" }, { label: capitalized }]
}

export function AppLayout() {
  const routerState = useRouterState()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const path = routerState.location.pathname
  const crumbs = getCrumbsForPath(path)

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  // Rehidrasi data profil user via GET /api/auth/me jika authenticated
  const { data: currentUserData } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  })

  useEffect(() => {
    if (currentUserData) {
      dispatch(setUser(mapCurrentUserToAuthUser(currentUserData)))
    }
  }, [currentUserData, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate({ to: "/login" })
  }

  return (
    <AppShell path={path} crumbs={crumbs} onLogout={handleLogout}>
      <Outlet />
    </AppShell>
  )
}
