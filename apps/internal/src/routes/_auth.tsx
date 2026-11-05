import { createFileRoute, redirect } from "@tanstack/react-router"
import { AppLayout } from "@/shared/components/layout/AppLayout"

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("rms_access_token") : null
    if (!token) {
      throw redirect({ to: "/login" })
    }
  },
  component: AppLayout,
})
