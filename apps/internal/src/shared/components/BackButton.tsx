import type { ComponentProps } from "react"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/shared/lib/utils"

export interface BackButtonProps extends Omit<ComponentProps<typeof Button>, "children"> {
  to?: string
  fallbackTo?: string
  label?: string
}

export function BackButton({
  to,
  fallbackTo = "/",
  label = "Back",
  onClick,
  className,
  ...props
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick: ComponentProps<typeof Button>["onClick"] = (e) => {
    if (onClick) {
      onClick(e)
    } else if (to) {
      navigate({ to: to as any })
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back()
    } else {
      navigate({ to: fallbackTo as any })
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={cn(
        "mt-0.5 size-10 shrink-0 rounded-full border-0 bg-gray-200 text-foreground transition-all duration-150 hover:bg-muted hover:text-primary cursor-pointer shadow-none focus-visible:ring-2 focus-visible:ring-primary outline-none",
        className
      )}
      {...props}
    >
      <ArrowLeft className="size-4.5" strokeWidth={2} aria-hidden />
    </Button>
  )
}
