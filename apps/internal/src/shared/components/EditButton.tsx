import type { ComponentProps, ReactNode } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/shared/lib/utils"

export interface EditButtonProps extends ComponentProps<typeof Button> {
  icon?: ReactNode
}

export function EditButton({
  children = "Edit",
  icon,
  className,
  size = "sm",
  type = "button",
  ...props
}: EditButtonProps) {
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
      {icon ?? <Pencil className="size-4 shrink-0" aria-hidden />}
      {children && <span>{children}</span>}
    </Button>
  )
}
