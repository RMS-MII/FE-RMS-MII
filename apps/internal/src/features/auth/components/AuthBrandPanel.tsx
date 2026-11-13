export function AuthBrandPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between overflow-hidden bg-slate-950 p-10 xl:p-14 text-white select-none">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80')`,
        }}
        aria-hidden="true"
      />
      {/* Gradient Overlay for Optimal Text Readability & Brand Color Tone */}
      <div
        className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-slate-900/60"
        aria-hidden="true"
      />

      {/* Top Header: Brand Badge & Portal Identity */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/mii.png" alt="" className="size-12 shrink-0 rounded-lg bg-white object-contain" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base text-white">
                METRODATA
              </span>
            </div>
            <p className="text-[11px] text-white/60">
              Mitra Integrasi Informatika
            </p>
          </div>
        </div>
      </div>

      {/* Center / Lower Content: Value Propositions & Tagline */}
      <div className="relative z-10 max-w-xl space-y-6">
        <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Accelerating Talent Acquisition with Precision & Intelligence.
        </h1>

        <p className="text-sm xl:text-base text-white/75 leading-relaxed font-normal">
          A centralized, seamless workspace for Metrodata HR and interview panels
          to orchestrate candidate pipelines, interview schedules, and rigorous
          competency assessments.
        </p>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 text-xs text-white/50 flex items-center justify-between">
        <span>© 2026 PT Mitra Integrasi Informatika</span>
      </div>
    </div>
  )
}

