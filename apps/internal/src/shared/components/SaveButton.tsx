import type { ComponentProps, ReactNode } from "react"
import { Save, CheckCircle2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/shared/lib/utils"

export interface SaveButtonProps extends ComponentProps<typeof Button> {
  icon?: ReactNode
  isSaved?: boolean
  savedText?: string
}

export function SaveButton({
  children = "Save Changes",
  icon,
  isSaved = false,
  savedText = "Saved!",
  className,
  type = "button",
  ...props
}: SaveButtonProps) {
  return (
    <Button
      type={type}
      className={cn(
        "gap-2 h-10 rounded-full border-0 bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-all duration-150",
        className
      )}
      {...props}
    >
      {isSaved ? (
        <>
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          <span>{savedText}</span>
        </>
      ) : (
        <>
          {icon ?? <Save className="size-4 shrink-0" aria-hidden />}
          {children && <span>{children}</span>}
        </>
      )}
    </Button>
  )
}

