import type { ReactNode } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { TableHead } from "@workspace/ui/components/table"
import { cn } from "@/shared/lib/utils"

export type SortDirection = "asc" | "desc" | null

export interface TableSortHeaderProps {
  label: ReactNode
  sortKey?: string
  currentSortKey?: string | null
  currentDirection?: SortDirection
  onSort?: (key: string) => void
  className?: string
  align?: "left" | "right" | "center"
}

export function TableSortHeader({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  className,
  align = "left",
}: TableSortHeaderProps) {
  const isSortable = !!sortKey && !!onSort
  const isActive = isSortable && currentSortKey === sortKey

  return (
    <TableHead
      className={cn(
        "h-11 font-medium text-muted-foreground select-none whitespace-nowrap",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {isSortable ? (
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className={cn(
            "group inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground",
            align === "right" && "ml-auto flex-row-reverse",
            align === "center" && "mx-auto justify-center",
            isActive && "text-foreground font-semibold"
          )}
        >
          <span>{label}</span>
          <span className="text-muted-foreground/60 transition-colors group-hover:text-foreground">
            {isActive && currentDirection === "asc" ? (
              <ArrowUp className="size-3 text-primary" strokeWidth={2.2} />
            ) : isActive && currentDirection === "desc" ? (
              <ArrowDown className="size-3 text-primary" strokeWidth={2.2} />
            ) : (
              <ArrowUpDown className="size-3 opacity-30 group-hover:opacity-80" />
            )}
          </span>
        </button>
      ) : (
        <span>{label}</span>
      )}
    </TableHead>
  )
}
