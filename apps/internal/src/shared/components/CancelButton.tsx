import type { ComponentProps } from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/shared/lib/utils"

export interface CancelButtonProps extends ComponentProps<typeof Button> {}

export function CancelButton({
  children = "Cancel",
  className,
  type = "button",
  variant = "ghost",
  ...props
}: CancelButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      className={cn(
        "h-10 rounded-full border-0 bg-muted px-5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted/40 cursor-pointer shadow-none focus-visible:ring-2 focus-visible:ring-primary outline-none",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

