import { createFileRoute, redirect } from "@tanstack/react-router"
import { LoginPage } from "../features/auth"
import { store } from "@/app/store"

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const token = store.getState().auth.accessToken
    if (token) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: LoginPage,
})
