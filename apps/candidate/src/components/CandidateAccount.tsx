import { useState, type FormEvent, type ReactNode } from "react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { DatePicker } from "@workspace/ui/components/date-picker"
import { Input } from "@workspace/ui/components/input"
import { request } from "../api"
import {
  portalHome,
  sessionDestination,
  type CandidateSession,
} from "../session"
import { CandidateAccountMenu } from "./CandidateAccountMenu"
import { PortalBrand } from "./PortalBrand"

export function AccountLayout({
  title,
  wide,
  account,
  children,
}: {
  title: string
  wide?: boolean
  account?: CandidateSession
  children: ReactNode
}) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <PortalBrand href="/jobs" />
          {account && <div className="min-w-0 max-w-48"><CandidateAccountMenu session={account} /></div>}
        </div>
      </header>
      <main className={`mx-auto px-5 py-10 ${wide ? "max-w-4xl" : "max-w-md"}`}>
        <section className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {children}
        </section>
      </main>
    </div>
  )
}

const fieldStyle = "h-10 rounded-full border-border bg-muted px-4"

export function CandidateLogin() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [verificationId, setVerificationId] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function sendCode() {
    const result = await request<{ verificationId: string }>(
      "/portal/session/code",
      { email }
    )
    setVerificationId(result.verificationId)
    setCode("")
  }

  async function run(action: () => Promise<void>) {
    if (busy) return
    setError("")
    setBusy(true)
    try {
      await action()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Please try again.")
    } finally {
      setBusy(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void run(async () => {
      if (!verificationId) return sendCode()

      const session = await request<CandidateSession>(
        "/portal/session/verify",
        { verificationId, code }
      )
      window.location.replace(sessionDestination(session))
    })
  }

  return (
    <AccountLayout
      title={
        verificationId ? "Verify your email" : "Sign in to the candidate portal"
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {verificationId ? (
          <>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to {email}. It expires in 10 minutes.
            </p>
            <label className="grid gap-1.5 text-sm font-medium">
              Verification code
              <Input
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className={fieldStyle}
                disabled={busy}
              />
            </label>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in or create a candidate profile.
            </p>
            <label className="grid gap-1.5 text-sm font-medium">
              Email address
              <Input
                type="email"
                autoComplete="email"
                required
                maxLength={100}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldStyle}
                disabled={busy}
              />
            </label>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={busy}
          className="h-10 rounded-full px-5"
        >
          {busy
            ? "Please wait…"
            : verificationId
              ? "Sign in"
              : "Send verification code"}
        </Button>
        {verificationId && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              className="rounded-full"
              onClick={() => void run(sendCode)}
            >
              Resend code
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              className="rounded-full"
              onClick={() => {
                setVerificationId("")
                setError("")
              }}
            >
              Change email
            </Button>
          </div>
        )}
      </form>
      <a
        className="text-sm font-medium text-primary hover:underline"
        href="/jobs"
      >
        Browse positions
      </a>
    </AccountLayout>
  )
}

export function CandidateProfileForm({
  session,
}: {
  session: CandidateSession
}) {
  const profile = session.profile
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const fields = [
    {
      name: "fullName",
      label: "Full name",
      value: profile?.fullName,
      maxLength: 100,
    },
    {
      name: "phoneNumber",
      label: "Phone number",
      type: "tel",
      value: profile?.phoneNumber,
      maxLength: 20,
    },
    {
      name: "education",
      label: "Education degree and major",
      value: profile?.education,
      maxLength: 50,
    },
    {
      name: "institution",
      label: "University or campus",
      value: profile?.institution,
      maxLength: 100,
    },
    {
      name: "address",
      label: "Address",
      value: profile?.address,
      maxLength: 200,
    },
    {
      name: "cv",
      label: "CV or résumé URL (optional)",
      value: profile?.cv,
      type: "url",
      maxLength: 200,
    },
    {
      name: "portfolio",
      label: "Portfolio URL (optional)",
      value: profile?.portfolio,
      type: "url",
      maxLength: 200,
    },
  ]

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setSaved(false)
    setError("")
    if (!birthDate) {
      setError("Select your birth date.")
      return
    }

    const values = new FormData(event.currentTarget)
    const value = (name: string) => String(values.get(name) ?? "").trim()
    setBusy(true)
    try {
      const updated = await request<CandidateSession>(
        "/portal/session/profile",
        {
          fullName: value("fullName"),
          phoneNumber: value("phoneNumber"),
          birthDate,
          gender: Number(value("gender")),
          gpa: Number(value("gpa")),
          education: value("education"),
          institution: value("institution"),
          address: value("address"),
          cv: value("cv") || null,
          portfolio: value("portfolio") || null,
        },
        undefined,
        "PUT"
      )
      if (!profile || new URLSearchParams(window.location.search).has("next")) {
        window.location.replace(sessionDestination(updated))
      } else {
        setSaved(true)
      }
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not save your profile."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <AccountLayout
      wide
      account={profile ? undefined : session}
      title={profile ? "My profile" : "Complete your candidate profile"}
    >
      <form onSubmit={(event) => void submit(event)} className="space-y-5">
        <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            Verified email
            <Input value={session.email} readOnly className={fieldStyle} />
          </label>
          {fields.map(({ name, label, value, type, maxLength }) => (
            <label key={name} className="grid gap-1.5 text-sm font-medium">
              {label}
              <Input
                name={name}
                type={type}
                defaultValue={value ?? ""}
                maxLength={maxLength}
                required={type !== "url"}
                className={fieldStyle}
              />
            </label>
          ))}
          <label className="grid gap-1.5 text-sm font-medium">
            Gender
            <select
              name="gender"
              defaultValue={
                profile?.gender === "Female" || profile?.gender === 2
                  ? "2"
                  : "1"
              }
              className={fieldStyle + " border text-sm"}
            >
              <option value="1">Male</option>
              <option value="2">Female</option>
            </select>
          </label>
          <div className="grid gap-1.5 text-sm font-medium">
            <label htmlFor="profile-birth-date">Birth date</label>
            <DatePicker
              id="profile-birth-date"
              value={birthDate}
              defaultMonth="2000-01-01"
              maxDate={new Date()}
              disabled={busy}
              onChange={setBirthDate}
            />
          </div>
          <label className="grid gap-1.5 text-sm font-medium">
            GPA
            <Input
              name="gpa"
              type="number"
              min={0}
              max={4}
              step="0.01"
              required
              defaultValue={profile?.gpa}
              className={fieldStyle}
            />
          </label>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-sm text-primary">
            Profile saved.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={busy}
            className="h-10 rounded-full px-5"
          >
            {busy ? "Saving…" : "Save profile"}
          </Button>
          <a
            className={buttonVariants({
              variant: "outline",
              className: "h-10 rounded-full px-5",
            })}
            href={profile ? portalHome(session) : "/jobs"}
          >
            {profile ? "Back to portal" : "Browse positions"}
          </a>
        </div>
      </form>
    </AccountLayout>
  )
}
