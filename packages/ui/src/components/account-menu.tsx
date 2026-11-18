import type { ReactNode, RefObject } from "react"
import { ChevronRight, LogOut } from "lucide-react"
import { cn } from "cn"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export function AccountMenu({
  name, email, role, collapsed, container, children, signingOut, onLogout,
}: {
  name: string
  email?: string
  role?: string
  collapsed?: boolean
  container?: RefObject<HTMLElement | null>
  children?: ReactNode
  signingOut?: boolean
  onLogout: () => void
}) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`User menu, ${name}`}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none",
              collapsed && "justify-center"
            )}
          />
        }
      >
        <Avatar className="size-9 bg-[#DCE3F0] text-primary">
          <AvatarFallback className="bg-[#DCE3F0] text-primary font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!collapsed && (
          <>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-xs text-muted-foreground">
                Welcome
              </span>
              <span className="mt-0.5 truncate text-sm font-semibold text-foreground">
                {name}
              </span>
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-foreground"
              strokeWidth={2.25}
              aria-hidden
            />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        container={container}
        align="start"
        side="top"
        sideOffset={10}
        className="w-64 p-2 rounded-xl"
      >
        <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-2">
          <Avatar className="size-8 bg-[#DCE3F0] text-primary">
            <AvatarFallback className="bg-[#DCE3F0] text-primary font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="truncate text-sm font-medium">{name}</p>
              {role && (
                <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {role}
                </span>
              )}
            </div>
            {email && (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-border/60" />

        {children}

        <DropdownMenuItem
          disabled={signingOut}
          variant="destructive"
          onClick={onLogout}
          className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-destructive cursor-pointer hover:bg-destructive/10"
        >
          <LogOut className="size-4" aria-hidden />
          <span>{signingOut ? "Signing out…" : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
