import { createFileRoute } from "@tanstack/react-router"
import { useAppSelector } from "@/app/store"
import { HrDashboardPage } from "@/features/recruitments"
import { InterviewerDashboardPage } from "@/features/interviews"

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardRoute,
})

function DashboardRoute() {
  const role = useAppSelector((state) => state.auth.user?.role)

  // Tunggu profil user selesai dihidrasi agar dashboard HR tidak sempat
  // memanggil endpoint HR-only ketika sesi interviewers dimuat ulang.
  if (!role) {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-border bg-card" />
    )
  }

  if (role === "Interviewer") {
    return <InterviewerDashboardPage />
  }

  return <HrDashboardPage />
}
