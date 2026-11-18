export function Brand({ compact, subtitle }: { compact?: boolean; subtitle?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <img src="/assets/rekrutin-mark.png" alt={compact ? "Rekrutin" : ""} className="size-9 object-contain" />
      {!compact && (
        <span className="flex flex-col gap-0.5">
          <img src="/assets/rekrutin-wordmark.png" alt="Rekrutin" className="h-auto w-24" />
          {subtitle && <span className="text-[11px] leading-tight text-muted-foreground">{subtitle}</span>}
        </span>
      )}
    </span>
  )
}
