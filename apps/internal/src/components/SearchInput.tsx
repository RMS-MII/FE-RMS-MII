import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@/shared/lib/utils"

export interface SearchInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  containerClassName?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center w-full sm:w-80", containerClassName)}>
      <Search
        className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-full border border-border bg-card pl-10 pr-8 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary",
          className
        )}
        {...props}
      />
    </div>
  )
}
