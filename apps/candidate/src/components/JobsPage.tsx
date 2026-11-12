import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { date, request } from "../api"
import { PortalBrand } from "./PortalBrand"

interface PublicJob {
  id: string
  name: string
  department: string | null
  description: string
  applicationDeadlineAt?: string | null
}

export function JobsPage() {
  const [jobs, setJobs] = useState<PublicJob[]>()
  const [loadError, setLoadError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [selected, setSelected] = useState<PublicJob>()

  useEffect(() => {
    const controller = new AbortController()
    request<PublicJob[]>("/portal/jobs", undefined, controller.signal)
      .then(setJobs)
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true)
      })
    return () => controller.abort()
  }, [loadAttempt])

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center px-5 py-4 sm:px-8">
          <PortalBrand href="/jobs" />
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 px-5 py-9 sm:px-8">
        {selected ? (
          <ApplicationForm
            key={selected.id}
            job={selected}
            onBack={() => setSelected(undefined)}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                Open positions
              </h1>
              {!!jobs?.length && (
                <p className="text-sm text-muted-foreground">
                  {jobs.length} {jobs.length === 1 ? "position" : "positions"}{" "}
                  available
                </p>
              )}
            </div>
            <section className="grid gap-4" aria-label="Available positions">
              {loadError ? (
                <div
                  className="space-y-3 rounded-2xl border border-border bg-card p-6"
                  role="alert"
                >
                  <p>We couldn’t load the open positions.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLoadError(false)
                      setLoadAttempt((attempt) => attempt + 1)
                    }}
                  >
                    Try again
                  </Button>
                </div>
              ) : !jobs ? (
                <p
                  className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"
                  role="status"
                >
                  Loading positions…
                </p>
              ) : jobs.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                  There are no open positions right now.
                </p>
              ) : (
                jobs.map((job) => (
                  <article
                    key={job.id}
                    className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6"
                  >
                    <div className="min-w-0 space-y-2.5">
                      <h2 className="text-base font-semibold wrap-break-word">
                        {job.name}
                      </h2>
                      <JobDetails job={job} />
                      {job.description && (
                        <p className="line-clamp-2 max-w-[68ch] text-sm leading-relaxed wrap-break-word text-muted-foreground">
                          {job.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="h-9 justify-self-start rounded-full"
                      onClick={() => setSelected(job)}
                    >
                      View position <ChevronRight aria-hidden />
                    </Button>
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function JobDetails({ job }: { job: PublicJob }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
      {job.department && (
        <span className="inline-flex items-center gap-2">
          <BriefcaseBusiness size={15} aria-hidden /> {job.department}
        </span>
      )}
      <span className="inline-flex items-center gap-2">
        <CalendarDays size={15} aria-hidden />
        {job.applicationDeadlineAt
          ? `Apply by ${date(job.applicationDeadlineAt)}`
          : "Open for applications"}
      </span>
    </div>
  )
}

function ApplicationForm({
  job,
  onBack,
}: {
  job: PublicJob
  onBack: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const submitting = useRef(false)

  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const fields = new FormData(event.currentTarget)
    const value = (name: string) => String(fields.get(name) ?? "").trim()
    submitting.current = true
    setBusy(true)
    setError("")
    try {
      await request<void>(`/portal/jobs/${job.id}/applications`, {
        fullName: value("fullName"),
        gender: Number(value("gender")),
        email: value("email").toLowerCase(),
        phoneNumber: value("phoneNumber"),
        birthDate: value("birthDate"),
        address: value("address"),
        education: value("education"),
        institution: value("institution"),
        gpa: Number(value("gpa")),
        expectedSalary: Number(value("expectedSalary")),
        cv: value("cv") || null,
        portfolio: value("portfolio") || null,
      })
      setSubmitted(true)
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "We couldn’t submit your application. Try again."
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <Button
        variant="outline"
        className="rounded-full"
        disabled={busy}
        onClick={onBack}
      >
        <ArrowLeft aria-hidden /> Back to positions
      </Button>
      <section className="rounded-2xl border border-border bg-card">
        <div className="space-y-2.5 rounded-t-2xl bg-primary-50 px-5 py-6 sm:px-7">
          <h1 className="text-2xl font-semibold tracking-tight wrap-break-word">
            {job.name}
          </h1>
          <JobDetails job={job} />
        </div>
        {job.description && (
          <div className="space-y-2 border-t border-border px-5 py-5 sm:px-7">
            <h2 className="text-base font-semibold">Job description</h2>
            <p className="max-w-[70ch] text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground">
              {job.description}
            </p>
          </div>
        )}
      </section>
      {submitted ? (
        <section
          className="space-y-2 rounded-2xl border border-border bg-card p-6"
          role="status"
        >
          <h2 className="text-base font-semibold">Application received</h2>
          <p className="text-sm text-muted-foreground">
            The recruitment team will contact you by email if there are next
            steps.
          </p>
        </section>
      ) : (
        <form
          onSubmit={(event) => void apply(event)}
          className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2 className="text-base font-semibold">Application details</h2>
          <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
            <JobField name="fullName" label="Full name" maxLength={100} />
            <label className="grid gap-1.5 text-sm font-medium">
              Gender
              <select
                name="gender"
                required
                className="h-8 rounded-lg border border-input bg-card px-2.5"
              >
                <option value="">Select gender</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </label>
            <JobField name="email" label="Email" type="email" maxLength={100} />
            <JobField
              name="phoneNumber"
              label="Phone number"
              type="tel"
              maxLength={20}
            />
            <JobField name="birthDate" label="Date of birth" type="date" />
            <JobField
              name="education"
              label="Highest education"
              maxLength={50}
            />
            <JobField name="institution" label="Institution" maxLength={100} />
            <JobField
              name="gpa"
              label="GPA (0–4)"
              type="number"
              min={0}
              max={4}
              step="0.01"
            />
            <JobField
              name="expectedSalary"
              label="Expected salary (IDR)"
              type="number"
              min={0}
              step="1"
              required={false}
            />
            <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
              Address <Textarea name="address" required maxLength={200} />
            </label>
            <JobField
              name="cv"
              label="CV link"
              type="url"
              maxLength={200}
              required={false}
            />
            <JobField
              name="portfolio"
              label="Portfolio link"
              type="url"
              maxLength={200}
              required={false}
            />
          </fieldset>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="h-10 rounded-full" disabled={busy}>
            {busy ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      )}
    </div>
  )
}

function JobField({
  label,
  required = true,
  ...props
}: React.ComponentProps<typeof Input> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>
        {label}
        {!required && (
          <span className="ml-2 font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </span>
      <Input required={required} {...props} />
    </label>
  )
}
