import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAppDispatch } from "@/app/store"
import { broadcastLogout } from "@/shared/api/auth-session"
import { logout } from "../store/auth-slice"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getApiError } from "@/shared/api/api-error"
import { useChangePasswordMutation } from "../api/auth-api"
import { passwordSchema } from "../schemas/passwordSchema"

const schema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine((values) => values.newPassword !== values.currentPassword, {
  path: ["newPassword"],
  message: "New password must be different from your current password",
}).refine((values) => values.newPassword === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
})

type FormValues = z.infer<typeof schema>

export function useChangePasswordForm() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const onSubmit = form.handleSubmit(async ({ currentPassword, newPassword }) => {
    setError(null)
    setIsSaved(false)
    try {
      await changePassword({ currentPassword, newPassword }).unwrap()
      form.reset()
      setIsSaved(true)
      dispatch(logout())
      broadcastLogout()
      void navigate({ to: "/login", replace: true })
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to change your password.").message)
    }
  })

  return { form, onSubmit, isLoading, error, isSaved }
}
