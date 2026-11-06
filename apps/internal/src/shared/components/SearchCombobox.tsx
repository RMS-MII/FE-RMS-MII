import * as React from "react"
import { Search, ChevronDown, X, Check, Plus } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@/shared/lib/utils"

export interface SearchComboboxOption<T = unknown> {
  id: string
  label: string
  subLabel?: string
  category?: string // Category or Department ID/Key
  categoryLabel?: string // Category or Department display name
  meta?: string
  data?: T
  disabled?: boolean
}

export interface SearchComboboxProps<T = unknown> {
  id?: string
  options: SearchComboboxOption<T>[]
  categories?: { label: string; value: string }[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  onSelect: (option: SearchComboboxOption<T>) => void
  disabled?: boolean
  className?: string
  selectedIds?: string[]
  closeOnSelect?: boolean
}

export function SearchCombobox<T = unknown>({
  id,
  options,
  categories,
  placeholder = "Select or search...",
  searchPlaceholder = "Search...",
  emptyText = "No items found",
  onSelect,
  disabled = false,
  className,
  selectedIds = [],
  closeOnSelect = true,
}: SearchComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")

  // Filter options by category and search query
  const filteredOptions = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return options.filter((opt) => {
      // Category match
      if (selectedCategory !== "all" && opt.category !== selectedCategory) {
        return false
      }
      // Text search match
      if (!q) return true
      const matchLabel = opt.label.toLowerCase().includes(q)
      const matchSubLabel = opt.subLabel?.toLowerCase().includes(q) ?? false
      const matchMeta = opt.meta?.toLowerCase().includes(q) ?? false
      const matchCat = opt.categoryLabel?.toLowerCase().includes(q) ?? false
      return matchLabel || matchSubLabel || matchMeta || matchCat
    })
  }, [options, selectedCategory, query])

  const handleSelectOption = (opt: SearchComboboxOption<T>) => {
    onSelect(opt)
    if (closeOnSelect) {
      setOpen(false)
      setQuery("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-full border-0 bg-muted px-4 text-sm font-normal text-foreground transition-all duration-150 hover:bg-muted/60 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none cursor-pointer outline-none select-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span
          className={cn(
            "truncate",
            selectedIds.length > 0 ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[320px] sm:w-95 rounded-2xl border border-border bg-popover p-3 shadow-xl z-50"
      >
        {/* Search bar inside popover */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-full border-0 bg-muted pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Category / Department pills filter */}
        {categories && categories.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 border-b border-border/60 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer",
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer",
                  selectedCategory === cat.value
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Options list */}
        <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = selectedIds.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={opt.disabled || isSelected}
                  onClick={() => handleSelectOption(opt)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors select-none",
                    isSelected
                      ? "opacity-50 cursor-not-allowed bg-muted/30"
                      : "hover:bg-muted/60 active:bg-muted cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {opt.label.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {opt.label}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {opt.subLabel} {opt.categoryLabel ? `• ${opt.categoryLabel}` : ""}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                      <Check className="size-3" />
                      <span>Added</span>
                    </span>
                  ) : (
                    <Plus className="size-3.5 text-muted-foreground shrink-0" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

