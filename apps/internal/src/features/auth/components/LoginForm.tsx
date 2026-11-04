import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useDispatch } from "react-redux"
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { setCredentials } from "../store/auth-slice"
import type { AuthUser } from "../types"
import { cn } from "@/shared/lib/utils"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid work email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "hr@metrodata.co.id",
      password: "password123",
      rememberMe: true,
    },
  })

  const rememberMe = watch("rememberMe")

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)

    // Simulate authentication latency for realistic UX
    setTimeout(() => {
      setIsLoading(false)

      const isInterviewer = values.email.toLowerCase().includes("interviewer")

      const mockUser: AuthUser = {
        id: isInterviewer ? "usr-interviewer-1" : "usr-hr-1",
        name: isInterviewer ? "Bambang Wijaya" : "Fajar Mahendra",
        email: values.email.trim(),
        role: isInterviewer ? "Interviewer" : "HR",
      }

      dispatch(
        setCredentials({
          accessToken: `jwt-mock-${Date.now()}`,
          user: mockUser,
        })
      )

      if (onSuccess) {
        onSuccess()
      } else {
        navigate({ to: "/" })
      }
    }, 600)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Input */}
      <div className="space-y-1.5">
        <Label
          htmlFor="login-email"
          className="text-xs font-semibold text-foreground px-1"
        >
          Work Email
        </Label>
        <div className="relative">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="name@metrodata.co.id"
            {...register("email")}
            aria-invalid={!!errors.email}
            className={cn(
              "h-11 rounded-full border-0 bg-muted pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none",
              errors.email && "ring-2 ring-destructive"
            )}
          />
          <Mail className="size-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive px-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <Label
            htmlFor="login-password"
            className="text-xs font-semibold text-foreground"
          >
            Password
          </Label>
          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault()
              alert("Please contact the Metrodata IT Helpdesk to reset your internal credentials.")
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••••••"
            {...register("password")}
            aria-invalid={!!errors.password}
            className={cn(
              "h-11 rounded-full border-0 bg-muted pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none",
              errors.password && "ring-2 ring-destructive"
            )}
          />
          <Lock className="size-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive px-1">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me checkbox */}
      <div className="flex items-center space-x-2 pt-1 px-1">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => setValue("rememberMe", Boolean(checked))}
        />
        <label
          htmlFor="rememberMe"
          className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
        >
          Remember this device for 30 days
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full gap-2 rounded-full border-0 bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-all duration-150 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In to Portal</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
