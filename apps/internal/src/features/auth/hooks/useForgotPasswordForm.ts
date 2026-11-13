import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getApiError } from "@/shared/api/api-error"
import { useForgotPasswordMutation } from "../api/auth-api"

const schema = z.object({
  email: z.email("Enter a valid email address"),
})

type FormValues = z.infer<typeof schema>

export function useForgotPasswordForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setError(null)
    try {
      await forgotPassword({ email: email.trim() }).unwrap()
      setIsSent(true)
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to request a reset link.").message)
    }
  })

  return { form, onSubmit, isLoading, error, isSent }
}
