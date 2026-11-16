import { env } from "@/config/env"
import type { LoginResponse } from "@/features/auth/types"

const AUTH_CHANNEL = "rms-auth"
const LOGOUT_PENDING_KEY = "rms_logout_pending"
let activeRefresh: Promise<LoginResponse | null> | null = null

async function requestRefresh(): Promise<LoginResponse | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${env.VITE_API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
    if (response.status === 409) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      continue
    }
    if (response.status === 401) return null
    if (!response.ok) throw new Error(`Refresh failed: ${response.status}`)
    return await response.json() as LoginResponse
  }
  throw new Error("Refresh was busy; retry shortly")
}

export function refreshSession(): Promise<LoginResponse | null> {
  if (!activeRefresh) {
    const refresh = async () => {
      if (typeof navigator !== "undefined" && navigator.locks) {
        return navigator.locks.request("rms-refresh-session", requestRefresh)
      }
      return requestRefresh()
    }
    activeRefresh = refresh().finally(() => { activeRefresh = null })
  }
  return activeRefresh
}

export async function requestLogout(): Promise<boolean> {
  try {
    const response = await fetch(`${env.VITE_API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    return response.ok
  } catch {
    return false
  }
}

export async function finishPendingLogout(): Promise<boolean> {
  if (sessionStorage.getItem(LOGOUT_PENDING_KEY) !== "1") return false
  if (await requestLogout()) sessionStorage.removeItem(LOGOUT_PENDING_KEY)
  return true
}

export function markLogoutPending(): void {
  sessionStorage.setItem(LOGOUT_PENDING_KEY, "1")
}

export function clearLogoutPending(): void {
  sessionStorage.removeItem(LOGOUT_PENDING_KEY)
}

export function broadcastLogout(): void {
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(AUTH_CHANNEL)
    channel.postMessage("logout")
    channel.close()
  }
}

export function listenForLogout(onLogout: () => void): () => void {
  if (typeof BroadcastChannel === "undefined") return () => {}
  const channel = new BroadcastChannel(AUTH_CHANNEL)
  channel.onmessage = (event) => {
    if (event.data === "logout") onLogout()
  }
  return () => channel.close()
}
