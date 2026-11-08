import { createContext, useContext, useLayoutEffect } from "react"
import { useRouterState } from "@tanstack/react-router"
import type { Crumb } from "./AppShell"

export interface BreadcrumbOverride {
  pathname: string
  crumbs: Crumb[]
}

export interface BreadcrumbContextValue {
  override: BreadcrumbOverride | null
  register: (entry: BreadcrumbOverride) => () => void
}

export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(
  null
)

export function useBreadcrumbOverride() {
  return useContext(BreadcrumbContext)?.override ?? null
}

/** Supply page-specific labels to the existing AppShell breadcrumb. */
export function usePageBreadcrumbs(crumbs: Crumb[]) {
  const context = useContext(BreadcrumbContext)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  if (!context) throw new Error("Page breadcrumbs require BreadcrumbProvider.")
  const { register } = context

  useLayoutEffect(
    () => register({ pathname, crumbs }),
    [register, pathname, crumbs]
  )
}
