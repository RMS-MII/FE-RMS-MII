import { useCallback, useMemo, useState, type ReactNode } from "react"
import {
  BreadcrumbContext,
  type BreadcrumbOverride,
} from "./breadcrumbs-context"

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<BreadcrumbOverride | null>(null)
  const register = useCallback((entry: BreadcrumbOverride) => {
    setOverride(entry)
    return () => setOverride((current) => (current === entry ? null : current))
  }, [])
  const value = useMemo(() => ({ override, register }), [override, register])
  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}
