import { PageHeader, Panel } from "@/shared/components"
import { ChangePasswordForm } from "../components/ChangePasswordForm"

export function ChangePasswordPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Password"
        description="Update the password for your Rekrutin account."
      />
      <Panel className="max-w-xl">
        <ChangePasswordForm />
      </Panel>
    </div>
  )
}
