import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "hr@metrodata.co.id",
      password: "password123",
    },
  })

  const onSubmit = () => {
    // Mode UI preview: navigasi langsung tanpa memanggil backend API
    navigate({ to: "/dashboard" })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
          Sistem Manajemen Rekrutmen
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Portal internal untuk HR dan Interviewer Metrodata
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 border border-border rounded-lg sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className={`w-full h-9 px-3 rounded-md border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.email ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Kata sandi
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className={`w-full h-9 px-3 rounded-md border text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.password ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                Masuk
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/dashboard"
              className="text-xs text-primary hover:underline font-medium"
            >
              Lewati dan langsung ke Dashboard &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
