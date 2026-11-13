import { Link } from "@tanstack/react-router"
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm"

export function ForgotPasswordForm() {
  const { form, onSubmit, isLoading, error, isSent } = useForgotPasswordForm()

  if (isSent) {
    return (
      <div className="space-y-5">
        <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p>If the email is registered, a password reset link will be sent. Check your inbox.</p>
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
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="forgot-email" className="px-1 text-xs font-semibold text-foreground">Corporate email</Label>
        <div className="relative">
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your corporate email"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
            className="h-11 rounded-full border-0 bg-muted pl-11 pr-4 text-sm shadow-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {form.formState.errors.email && <p className="px-1 text-xs text-destructive">{form.formState.errors.email.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="h-11 w-full gap-2 rounded-full text-sm font-semibold">
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>
      <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </form>
  )
}
