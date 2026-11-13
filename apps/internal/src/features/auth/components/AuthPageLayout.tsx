import type { ReactNode } from "react"
import { AuthBrandPanel } from "./AuthBrandPanel"

export function AuthPageLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-background font-sans antialiased">
      <AuthBrandPanel />

      <div className="flex w-full flex-col justify-between bg-card/60 p-6 backdrop-blur-xs sm:p-12 lg:w-1/2 lg:p-16 xl:w-5/12 xl:p-20">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">M</div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-foreground">METRODATA</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">RMS MII</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Internal Recruitment Portal</p>
          </div>
        </div>

        <div className="mx-auto my-auto w-full max-w-sm space-y-6">
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
          </div>
          {children}
        </div>

        <div className="pt-8 text-center text-xs text-muted-foreground">
          <p>© 2026 PT Mitra Integrasi Informatika. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
