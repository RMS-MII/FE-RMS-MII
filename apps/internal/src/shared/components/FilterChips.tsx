import { X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export interface Chip {
  key: string
  label: string
  onRemove: () => void
}

export interface FilterChipsProps {
  chips: Chip[]
  onReset: () => void
}

export function FilterChips({ chips, onReset }: FilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Active filters:</span>
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-primary-50 pl-3 pr-1 text-xs font-medium text-primary"
        >
          <span>{c.label}</span>
          <button
            type="button"
            onClick={c.onRemove}
            aria-label={`Remove filter ${c.label}`}
            className="flex size-5 items-center justify-center rounded-full transition-colors hover:bg-primary-100"
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      <Button
        variant="link"
        size="sm"
        onClick={onReset}
        className="h-auto p-0 text-xs text-primary hover:underline"
      >
        Reset filters
      </Button>
    </div>
  )
}

