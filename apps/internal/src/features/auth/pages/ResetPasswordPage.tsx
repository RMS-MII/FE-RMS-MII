import { AuthPageLayout } from "../components/AuthPageLayout"
import { ResetPasswordForm } from "../components/ResetPasswordForm"

export function ResetPasswordPage({ token }: { token: string }) {
  return (
    <AuthPageLayout
      title="Set a new password"
      description="Choose a new password for your Rekrutin account. This reset link can only be used once."
    >
      <ResetPasswordForm token={token} />
    </AuthPageLayout>
  )
}
