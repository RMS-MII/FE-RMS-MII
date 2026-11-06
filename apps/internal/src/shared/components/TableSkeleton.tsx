import { TableRow, TableCell } from "@workspace/ui/components/table"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@/shared/lib/utils"

export type SkeletonColumnWidth = string | string[]

export interface TableSkeletonProps {
  /** Number of skeleton rows to render. Defaults to 5. */
  rowCount?: number
  /** Number of columns if colWidths is not provided. Defaults to 5. */
  colCount?: number
  /**
   * Tailwind width and alignment classes for each column's skeleton.
   * Can be a string (e.g. "w-24") or an array of strings (e.g. ["w-32", "w-20"])
   * to render a stacked multi-line skeleton (e.g. title + subtitle).
   */
  colWidths?: SkeletonColumnWidth[]
  /** Optional class names for each TableCell. */
  cellClassNames?: string[]
  /** Optional additional class for each TableRow. */
  rowClassName?: string
}

export function TableSkeleton({
  rowCount = 5,
  colCount = 5,
  colWidths = [],
  cellClassNames = [],
  rowClassName,
}: TableSkeletonProps) {
  const totalCols = colWidths.length > 0 ? colWidths.length : colCount

  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow
          key={rowIndex}
          className={cn("border-b border-border transition-colors hover:bg-transparent", rowClassName)}
        >
          {Array.from({ length: totalCols }).map((_, colIndex) => {
            const widthConfig = colWidths[colIndex] ?? "w-full"
            const cellClass = cellClassNames[colIndex]

            return (
              <TableCell key={colIndex} className={cn("py-3", cellClass)}>
                {Array.isArray(widthConfig) ? (
                  <div className="flex flex-col gap-1.5">
                    {widthConfig.map((w, lineIndex) => (
                      <Skeleton
                        key={lineIndex}
                        className={cn(lineIndex === 0 ? "h-3.5" : "h-2.5", w)}
                      />
                    ))}
                  </div>
                ) : (
                  <Skeleton className={cn("h-3.5 rounded-md", widthConfig)} />
                )}
              </TableCell>
            )
          })}
        </TableRow>
      ))}
    </>
  )
}

