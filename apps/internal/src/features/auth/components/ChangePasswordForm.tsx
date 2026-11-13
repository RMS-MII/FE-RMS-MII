import { useState } from "react"
import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { SaveButton } from "@/shared/components"
import { useChangePasswordForm } from "../hooks/useChangePasswordForm"

export function ChangePasswordForm() {
  const { form, onSubmit, isLoading, error, isSaved } = useChangePasswordForm()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 p-5 sm:p-6">
      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {isSaved && (
        <div role="status" className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>Your password has been changed.</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="current-password" className="text-sm font-medium">Current password</Label>
        <div className="relative">
          <Input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(form.formState.errors.currentPassword)}
            {...form.register("currentPassword")}
            className="h-10 rounded-full border-0 bg-muted pl-10 pr-11 text-sm"
          />
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <button type="button" onClick={() => setShowCurrent((value) => !value)} aria-label={showCurrent ? "Hide current password" : "Show current password"} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground hover:text-foreground">
            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.currentPassword && <p className="text-xs text-destructive">{form.formState.errors.currentPassword.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="change-new-password" className="text-sm font-medium">New password</Label>
        <div className="relative">
          <Input
            id="change-new-password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={Boolean(form.formState.errors.newPassword)}
            {...form.register("newPassword")}
            className="h-10 rounded-full border-0 bg-muted pl-10 pr-11 text-sm"
          />
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <button type="button" onClick={() => setShowNew((value) => !value)} aria-label={showNew ? "Hide new password" : "Show new password"} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground hover:text-foreground">
            {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.newPassword && <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>}
        <p className="text-xs text-muted-foreground">Use 8–128 characters with uppercase and lowercase letters, a number, and a symbol.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="change-confirm-password" className="text-sm font-medium">Confirm new password</Label>
        <div className="relative">
          <Input
            id="change-confirm-password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={Boolean(form.formState.errors.confirmPassword)}
            {...form.register("confirmPassword")}
            className="h-10 rounded-full border-0 bg-muted pl-10 pr-4 text-sm"
          />
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {form.formState.errors.confirmPassword && <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}
      </div>

      <div className="flex justify-end border-t border-border pt-5">
        <SaveButton type="submit" isLoading={isLoading} loadingText="Changing password...">
          Change Password
        </SaveButton>
      </div>
    </form>
  )
}
