import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Search,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
  const [selectedId, setSelectedId] = useState<string>()
  const [applyingTo, setApplyingTo] = useState<PublicJob>()
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("")
  const searchInput = useRef<HTMLInputElement>(null)
  const positionHeading = useRef<HTMLHeadingElement>(null)
  const departments = [
    ...new Set(
      jobs?.flatMap((job) => (job.department ? [job.department] : []))
    ),
  ].sort()
  const term = search.trim().toLowerCase()
  const visibleJobs = jobs?.filter(
    (job) =>
      (!department || job.department === department) &&
      [job.name, job.department, job.description].some((value) =>
        value?.toLowerCase().includes(term)
      )
  )
  const openedJob = visibleJobs?.find((job) => job.id === selectedId)
  const previewJob = openedJob ?? visibleJobs?.[0]

  useEffect(() => {
    if (selectedId && !applyingTo) positionHeading.current?.focus()
  }, [selectedId, applyingTo])

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
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 sm:px-8">
          <PortalBrand href="/jobs" />
          <span className="border-l border-border pl-4 text-sm font-medium text-muted-foreground">
            Careers
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6 sm:px-8 sm:py-9">
        {applyingTo ? (
          <div className="mx-auto max-w-4xl">
            <ApplicationForm
              key={applyingTo.id}
              job={applyingTo}
              onBack={() => setApplyingTo(undefined)}
            />
          </div>
        ) : (
          <>
            <div
              className={openedJob ? "hidden space-y-4 lg:block" : "space-y-4"}
            >
              <h1 className="text-2xl font-semibold tracking-tight">
                Open positions
              </h1>
              {!!jobs?.length && (
                <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-3">
                  <div className="relative min-w-0 flex-1 basis-56">
                    <Search
                      className="pointer-events-none absolute top-3 left-4 size-4 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      ref={searchInput}
                      type="search"
                      aria-label="Search positions"
                      placeholder="Search positions"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="h-10 rounded-full border-border bg-muted pl-10"
                    />
                  </div>
                  {departments.length > 1 && (
                    <select
                      aria-label="Department"
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      className="h-10 w-full rounded-full border border-border bg-muted px-4 text-sm focus-visible:outline-2 focus-visible:outline-ring sm:w-auto"
                    >
                      <option value="">All departments</option>
                      {departments.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
            <div
              className={
                previewJob
                  ? "grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
                  : ""
              }
            >
              <section
                className={
                  openedJob ? "hidden space-y-3 lg:block" : "space-y-3"
                }
                aria-label="Available positions"
              >
                {!!jobs?.length && (
                  <p
                    className="text-sm text-muted-foreground"
                    aria-live="polite"
                  >
                    {visibleJobs?.length} of {jobs.length} positions
                  </p>
                )}
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
                ) : !visibleJobs?.length ? (
                  <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                      No positions match your search.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setSearch("")
                        setDepartment("")
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {visibleJobs.map((job) => (
                      <li key={job.id}>
                        <article
                          className={`group relative space-y-2.5 rounded-2xl border bg-card p-5 hover:border-primary/50 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 ${
                            previewJob?.id === job.id
                              ? "border-border lg:border-primary/50 lg:bg-primary-50"
                              : "border-border"
                          }`}
                        >
                          <h2 className="pr-7 text-base font-semibold wrap-break-word">
                            <button
                              type="button"
                              aria-label={`View position: ${job.name}`}
                              className="cursor-pointer text-left outline-none group-hover:text-primary after:absolute after:inset-0 after:rounded-2xl"
                              onClick={() => {
                                setSelectedId(job.id)
                                if (openedJob?.id === job.id)
                                  positionHeading.current?.focus()
                              }}
                            >
                              {job.name}
                              <ChevronRight
                                className="absolute top-5 right-5 size-5 text-primary"
                                aria-hidden
                              />
                            </button>
                          </h2>
                          <JobDetails job={job} />
                          {job.description && (
                            <p className="line-clamp-2 text-sm leading-relaxed wrap-break-word text-muted-foreground">
                              {job.description}
                            </p>
                          )}
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              {previewJob && (
                <div
                  className={`space-y-4 lg:sticky lg:top-6 lg:mt-8 ${openedJob ? "" : "hidden lg:block"}`}
                >
                  <Button
                    variant="outline"
                    className="rounded-full lg:hidden"
                    onClick={() => {
                      setSelectedId(undefined)
                      requestAnimationFrame(() => searchInput.current?.focus())
                    }}
                  >
                    <ArrowLeft aria-hidden /> Back to positions
                  </Button>
                  <section
                    key={previewJob.id}
                    aria-labelledby="position-title"
                    className="rounded-2xl border border-border bg-card shadow-card lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto"
                  >
                    <div className="space-y-4 rounded-t-2xl border-b border-border bg-primary-50 p-5 sm:p-7">
                      <h2
                        id="position-title"
                        tabIndex={-1}
                        ref={positionHeading}
                        className="text-2xl font-semibold tracking-tight wrap-break-word outline-none"
                      >
                        {previewJob.name}
                      </h2>
                      <JobDetails job={previewJob} />
                      <Button
                        className="h-10 rounded-full px-5"
                        onClick={() => {
                          setSelectedId(previewJob.id)
                          setApplyingTo(previewJob)
                        }}
                      >
                        Apply for this position
                      </Button>
                    </div>
                    <div className="space-y-3 p-5 sm:p-7">
                      <h3 className="text-base font-semibold">
                        Job description
                      </h3>
                      <p className="max-w-[68ch] text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground">
                        {previewJob.description ||
                          "No description has been provided for this position."}
                      </p>
                    </div>
                  </section>
                </div>
              )}
            </div>
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
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    heading.current?.focus()
  }, [submitted])

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
        <ArrowLeft aria-hidden /> Back to position
      </Button>
      <section className="space-y-2.5 rounded-2xl border border-border bg-primary-50 px-5 py-6 sm:px-7">
        <h1 className="text-2xl font-semibold tracking-tight wrap-break-word">
          {job.name}
        </h1>
        <JobDetails job={job} />
      </section>
      {submitted ? (
        <section
          className="space-y-2 rounded-2xl border border-border bg-card p-6"
          role="status"
        >
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-base font-semibold outline-none"
          >
            Application received
          </h2>
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
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-base font-semibold outline-none"
          >
            Application details
          </h2>
          <fieldset
            disabled={busy}
            className="grid gap-x-6 gap-y-4 sm:grid-cols-2"
          >
            <div className="grid content-start gap-4">
              <JobField
                name="fullName"
                label="Full Name"
                maxLength={100}
                placeholder="e.g. Budi Raharjo"
              />
              <JobField
                name="email"
                label="Email Address"
                type="email"
                maxLength={100}
                placeholder="e.g. budi@example.com"
              />
              <JobField
                name="phoneNumber"
                label="Phone Number"
                type="tel"
                maxLength={20}
                placeholder="e.g. +62 812-3456-7890"
              />
              <div className="grid gap-3 min-[420px]:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium">
                  Gender
                  <select
                    name="gender"
                    defaultValue="1"
                    className="h-10 rounded-full border border-border bg-muted px-4"
                  >
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                  </select>
                </label>
                <JobField name="birthDate" label="Birth Date" type="date" />
              </div>
            </div>
            <div className="grid content-start gap-4">
              <JobField
                name="education"
                label="Education Degree & Major"
                maxLength={50}
                placeholder="e.g. S1 Computer Science"
              />
              <JobField
                name="institution"
                label="University / Campus"
                maxLength={100}
                placeholder="e.g. Universitas Indonesia"
              />
              <div className="grid grid-cols-2 gap-3">
                <JobField
                  name="gpa"
                  label="GPA"
                  type="number"
                  min={0}
                  max={4}
                  step="0.01"
                  placeholder="e.g. 3.75"
                />
                <JobField
                  name="expectedSalary"
                  label="Expected Salary (IDR)"
                  type="number"
                  min={0}
                  step="1"
                  required={false}
                  placeholder="e.g. 10000000"
                />
              </div>
              <JobField
                name="cv"
                label="CV / Resume URL"
                type="url"
                maxLength={200}
                required={false}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="grid gap-4 border-t border-border pt-4 sm:col-span-2 sm:grid-cols-2">
              <JobField
                name="address"
                label="Address"
                maxLength={200}
                placeholder="e.g. Jl. Jendral Sudirman No. 12, Jakarta Selatan"
              />
              <JobField
                name="portfolio"
                label="Portfolio / GitHub URL"
                type="url"
                maxLength={200}
                required={false}
                placeholder="https://github.com/username"
              />
            </div>
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
        {required ? (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </span>
      <Input
        required={required}
        className="h-10 min-w-0 rounded-full border-border bg-muted px-4"
        {...props}
      />
    </label>
  )
}
