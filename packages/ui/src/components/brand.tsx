export function Brand({ compact, subtitle }: { compact?: boolean; subtitle?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <img src="/assets/rekrutin-mark.png" alt={compact ? "Rekrutin" : ""} className="size-9 object-contain" />
      {!compact && (
        <span className="flex flex-col gap-0.5">
          <span role="img" aria-label="RekrutIn" className="font-brand text-[1.4375rem] leading-none font-bold whitespace-nowrap text-[#0e71b4]">
            Rekrut<span className="text-[#5fad48]">In</span>
          </span>
          {subtitle && <span className="text-[11px] leading-tight text-muted-foreground">{subtitle}</span>}
        </span>
      )}
    </span>
  )
}
