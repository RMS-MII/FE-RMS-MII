import { AuthPageLayout } from "../components/AuthPageLayout"
import { LoginForm } from "../components/LoginForm"

export function LoginPage() {
  return (
    <AuthPageLayout
      title="Welcome back"
      description="Sign in with your corporate username to access candidate pipelines and interview schedules."
    >
      <LoginForm />
    </AuthPageLayout>
  )
}
