import { useState } from "react"
import { useDispatch } from "react-redux"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getApiError } from "@/shared/api/api-error"
import { useResetPasswordMutation } from "../api/auth-api"
import { passwordSchema } from "../schemas/passwordSchema"
import { logout } from "../store/auth-slice"
import { broadcastLogout } from "@/shared/api/auth-session"

const schema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine((values) => values.newPassword === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
})

type FormValues = z.infer<typeof schema>

export function useResetPasswordForm(token: string) {
  const dispatch = useDispatch()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const hasValidToken = /^[0-9A-Fa-f]{64}$/.test(token)

  const onSubmit = form.handleSubmit(async ({ newPassword }) => {
    if (!hasValidToken) return
    setError(null)
    try {
      await resetPassword({ token, newPassword }).unwrap()
      dispatch(logout())
      broadcastLogout()
      setIsComplete(true)
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to reset your password.").message)
    }
  })

  return { form, onSubmit, isLoading, error, isComplete, hasValidToken }
}
