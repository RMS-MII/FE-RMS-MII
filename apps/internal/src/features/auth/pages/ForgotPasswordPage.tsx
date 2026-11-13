import { AuthPageLayout } from "../components/AuthPageLayout"
import { ForgotPasswordForm } from "../components/ForgotPasswordForm"

export function ForgotPasswordPage() {
  return (
    <AuthPageLayout
      title="Forgot your password?"
      description="Enter the email linked to your account. We will send a reset link if the email is registered."
    >
      <ForgotPasswordForm />
    </AuthPageLayout>
  )
}
