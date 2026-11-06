import type { ComponentProps, ReactNode } from "react"
import { Save, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/shared/lib/utils"

export interface SaveButtonProps extends ComponentProps<typeof Button> {
  icon?: ReactNode
  isSaved?: boolean
  savedText?: string
  isLoading?: boolean
  loadingText?: string
}

export function SaveButton({
  children = "Save Changes",
  icon,
  isSaved = false,
  savedText = "Saved!",
  isLoading = false,
  loadingText = "Saving...",
  className,
  type = "button",
  disabled,
  ...props
}: SaveButtonProps) {
  return (
    <Button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "gap-2 h-10 rounded-full border-0 bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          <span>{loadingText}</span>
        </>
      ) : isSaved ? (
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
