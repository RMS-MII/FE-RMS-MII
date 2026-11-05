import { createFileRoute, redirect } from "@tanstack/react-router"
import { LoginPage } from "../features/auth"

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("rms_access_token") : null
    if (token) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: LoginPage,
})
