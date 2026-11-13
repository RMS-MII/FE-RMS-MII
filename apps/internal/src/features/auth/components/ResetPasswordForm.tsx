import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useResetPasswordForm } from "../hooks/useResetPasswordForm"

export function ResetPasswordForm({ token }: { token: string }) {
  const { form, onSubmit, isLoading, error, isComplete, hasValidToken } = useResetPasswordForm(token)
  const [showPassword, setShowPassword] = useState(false)

  if (!hasValidToken) {
    return (
      <div className="space-y-5">
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <p>This reset link is invalid. Request a new link to continue.</p>
        </div>
        <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="size-4" /> Request a new link
        </Link>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="space-y-5">
        <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p>Your password has been reset. Sign in with your new password.</p>
        </div>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            {error} <Link to="/forgot-password" className="font-semibold underline">Request a new link</Link>
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="new-password" className="px-1 text-xs font-semibold text-foreground">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Enter your new password"
            aria-invalid={Boolean(form.formState.errors.newPassword)}
            {...form.register("newPassword")}
            className="h-11 rounded-full border-0 bg-muted pl-11 pr-11 text-sm shadow-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.newPassword && <p className="px-1 text-xs text-destructive">{form.formState.errors.newPassword.message}</p>}
        <p className="px-1 text-xs text-muted-foreground">Use 8–128 characters with uppercase and lowercase letters, a number, and a symbol.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-password" className="px-1 text-xs font-semibold text-foreground">Confirm new password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Enter your new password again"
            aria-invalid={Boolean(form.formState.errors.confirmPassword)}
            {...form.register("confirmPassword")}
            className="h-11 rounded-full border-0 bg-muted pl-11 pr-4 text-sm shadow-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {form.formState.errors.confirmPassword && <p className="px-1 text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="h-11 w-full gap-2 rounded-full text-sm font-semibold">
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {isLoading ? "Saving..." : "Reset password"}
      </Button>
      <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </form>
  )
}
