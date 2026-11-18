import { cn } from "@/shared/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Check, ChevronDown, Loader2, Plus, Search, X } from "lucide-react"
import * as React from "react"

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
  searchValue?: string
  onSearchChange?: (value: string) => void
  shouldFilter?: boolean
  renderOption?: (option: SearchComboboxOption<T>) => React.ReactNode
  popoverClassName?: string
  isLoading?: boolean
  loadingText?: string
  errorContent?: React.ReactNode
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
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
  searchValue,
  onSearchChange,
  shouldFilter = true,
  renderOption,
  popoverClassName,
  isLoading = false,
  loadingText = "Loading...",
  errorContent,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: SearchComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [internalQuery, setInternalQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const query = searchValue ?? internalQuery

  const handleSearchChange = (value: string) => {
    setInternalQuery(value)
    onSearchChange?.(value)
  }

  // Filter options by category and search query
  const filteredOptions = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return options.filter((opt) => {
      // Category match
      if (selectedCategory !== "all" && opt.category !== selectedCategory) {
        return false
      }
      // Text search match
      if (!shouldFilter || !q) return true
      const matchLabel = opt.label.toLowerCase().includes(q)
      const matchSubLabel = opt.subLabel?.toLowerCase().includes(q) ?? false
      const matchMeta = opt.meta?.toLowerCase().includes(q) ?? false
      const matchCat = opt.categoryLabel?.toLowerCase().includes(q) ?? false
      return matchLabel || matchSubLabel || matchMeta || matchCat
    })
  }, [options, selectedCategory, query, shouldFilter])

  const handleSelectOption = (opt: SearchComboboxOption<T>) => {
    onSelect(opt)
    if (closeOnSelect) {
      setOpen(false)
      handleSearchChange("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-full border-0 bg-muted px-4 text-sm font-normal text-foreground shadow-none transition-all duration-150 outline-none select-none hover:bg-muted/60 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
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
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          "z-50 w-[320px] rounded-2xl bg-popover p-3 shadow-xs sm:w-95",
          popoverClassName
        )}
      >
        {/* Search bar inside popover */}
        <div className="relative mb-2.5">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 w-full rounded-full border-0 bg-muted pr-7 pl-8 text-xs text-foreground transition-all duration-150 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Category / Department pills filter */}
        {categories && categories.length > 0 && (
          <div className="scrollbar-none mb-2 flex items-center gap-1 overflow-x-auto border-b border-border/60 pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors",
                selectedCategory === "all"
                  ? "bg-primary font-semibold text-primary-foreground"
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
                  "cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors",
                  selectedCategory === cat.value
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Options list */}
        <div
          className="max-h-56 space-y-1 overflow-y-auto pr-0.5"
          aria-busy={isLoading}
          onScroll={(event) => {
            const list = event.currentTarget
            if (hasMore && !isLoadingMore &&
              list.scrollTop + list.clientHeight >= list.scrollHeight - 32)
              onLoadMore?.()
          }}
        >
          {isLoading ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground"
            >
              <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
              {loadingText}
            </div>
          ) : errorContent ? (
            errorContent
          ) : filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            <>
            {filteredOptions.map((opt) => {
              const isSelected = selectedIds.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={opt.disabled || isSelected}
                  onClick={() => handleSelectOption(opt)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors select-none",
                    isSelected
                      ? "cursor-not-allowed bg-muted/30 opacity-50"
                      : "cursor-pointer hover:bg-muted/60 active:bg-muted"
                  )}
                >
                  {renderOption ? (
                    <div className="min-w-0 flex-1">{renderOption(opt)}</div>
                  ) : (
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {opt.label.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {opt.label}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {opt.subLabel}{" "}
                          {opt.categoryLabel ? `• ${opt.categoryLabel}` : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {isSelected ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Check className="size-3" />
                      <span>Added</span>
                    </span>
                  ) : (
                    <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              )
            })}
            {hasMore && (
              <div className="py-2 text-center text-xs text-muted-foreground">
                {isLoadingMore ? (
                  <span role="status">Loading more candidates...</span>
                ) : (
                  <button type="button" onClick={onLoadMore} className="cursor-pointer underline hover:text-foreground">
                    Load more
                  </button>
                )}
              </div>
            )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
