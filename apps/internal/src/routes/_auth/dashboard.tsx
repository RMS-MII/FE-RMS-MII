import { createFileRoute } from "@tanstack/react-router"
import { DashboardPage } from "@/features/recruitments"

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardPage,
})
