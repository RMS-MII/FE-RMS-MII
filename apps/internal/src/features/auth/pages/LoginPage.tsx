import { AuthBrandPanel } from "../components/AuthBrandPanel"
import { LoginForm } from "../components/LoginForm"

export function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-background font-sans antialiased">
      <AuthBrandPanel />

      <div className="flex w-full lg:w-1/2 xl:w-5/12 flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-20 bg-card/60 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 lg:hidden mb-8">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-sm text-foreground">
                METRODATA
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
                RMS MII
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Internal Recruitment Portal
            </p>
          </div>
        </div>

        {/* Center Form Section */}
        <div className="mx-auto my-auto w-full max-w-sm space-y-6">
          <div className="space-y-1.5 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in with your corporate username to access candidate pipelines and interview schedules.
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Bottom Corporate Footer */}
        <div className="pt-8 text-center text-xs text-muted-foreground">
          <p>© 2026 PT Mitra Integrasi Informatika. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
