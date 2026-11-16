import { createFileRoute, redirect } from "@tanstack/react-router"
import { AppLayout } from "@/shared/components/layout/AppLayout"
import { store } from "@/app/store"

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    const token = store.getState().auth.accessToken
    if (!token) {
      throw redirect({ to: "/login" })
    }
  },
  component: AppLayout,
})
