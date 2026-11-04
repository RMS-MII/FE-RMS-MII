import type { ComponentProps, ReactNode } from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/shared/lib/utils"

export interface CreateButtonProps extends ComponentProps<typeof Button> {
  icon?: ReactNode
}

export function CreateButton({
  children = "Create",
  icon,
  className,
  size = "sm",
  type = "button",
  ...props
}: CreateButtonProps) {
  return (
    <Button
      type={type}
      size={size}
      className={cn(
        "gap-1.5 rounded-full h-10 border-0 bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer",
        className
      )}
      {...props}
    >
      {icon ?? <Plus className="size-4 shrink-0" aria-hidden />}
      {children && <span>{children}</span>}
    </Button>
  )
}
