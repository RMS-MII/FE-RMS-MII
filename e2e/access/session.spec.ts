import { randomUUID } from "node:crypto"
import { expect, test } from "../fixtures/actors"
import { waitForCandidateCode } from "../fixtures/mail"
import { e2eUrls } from "../../scripts/e2e/environment.mjs"

// Login forms contain passwords and OTPs. Keep those values out of traces/screenshots.
test.use({ trace: "off", screenshot: "off" })

test("HR dan interviewer mempunyai sesi browser yang terpisah", async ({ hr, interviewer }) => {
  test.setTimeout(60_000)
  await hr.page.goto(`${e2eUrls.internal}/recruitments`)
  await expect(hr.page.getByRole("heading", { name: "Recruitments" })).toBeVisible()

  await interviewer.page.goto(`${e2eUrls.internal}/dashboard`)
  await expect(interviewer.page.getByRole("heading", { name: "Dashboard" })).toBeVisible()

  for (const actor of [hr, interviewer]) {
    const cookies = await actor.context.cookies(`${e2eUrls.api}/api/auth/refresh`)
    const refresh = cookies.find((cookie) => cookie.name === "rms_refresh")
    expect(refresh !== undefined).toBe(true)
    expect(refresh?.path).toBe("/api/auth")
    expect(refresh?.httpOnly).toBe(true)
    expect(refresh?.secure).toBe(true)
    expect(cookies.some((cookie) => cookie.name === "rms_candidate")).toBe(false)
  }
  const hrRefresh = (await hr.context.cookies(`${e2eUrls.api}/api/auth/refresh`))
    .find((cookie) => cookie.name === "rms_refresh")?.value
  const interviewerRefresh = (await interviewer.context.cookies(`${e2eUrls.api}/api/auth/refresh`))
    .find((cookie) => cookie.name === "rms_refresh")?.value
  expect(hrRefresh === interviewerRefresh).toBe(false)

  await hr.page.reload()
  await expect(hr.page.getByRole("heading", { name: "Recruitments" })).toBeVisible()
  await interviewer.page.reload()
  await expect(interviewer.page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
})

test("kandidat masuk memakai OTP dan cookie portal tetap berlaku setelah membuka app exam", async ({ candidate }) => {
  test.setTimeout(60_000)
  const email = `rms-e2e-${randomUUID()}@example.test`

  await candidate.page.goto(`${e2eUrls.candidate}/login`)
  await candidate.page.getByLabel("Email address").fill(email)
  const requestedAt = Date.now()
  await candidate.page.getByRole("button", { name: "Send verification code" }).click()
  await expect(candidate.page.getByLabel("Verification code")).toBeVisible()

  const code = await waitForCandidateCode(email, requestedAt)
  const codeInput = candidate.page.getByLabel("Verification code")
  await codeInput.fill(code)
  try {
    await candidate.page.getByRole("button", { name: "Sign in", exact: true }).click({ timeout: 10_000 })
    await expect(candidate.page).toHaveURL(`${e2eUrls.candidate}/profile`, { timeout: 10_000 })
  } finally {
    if (!candidate.page.isClosed()) {
      await candidate.page.evaluate(() => {
        const input = document.querySelector<HTMLInputElement>('input[autocomplete="one-time-code"]')
        if (input) input.value = ""
      })
    }
  }

  const cookies = await candidate.context.cookies(`${e2eUrls.api}/api/portal/session`)
  const candidateCookie = cookies.find((cookie) => cookie.name === "rms_candidate")
  expect(candidateCookie !== undefined).toBe(true)
  expect(candidateCookie?.path).toBe("/api/portal")
  expect(candidateCookie?.httpOnly).toBe(true)
  expect(candidateCookie?.secure).toBe(true)
  expect(cookies.some((cookie) => cookie.name === "rms_refresh")).toBe(false)

  const session = await candidate.page.evaluate(async (apiUrl) => {
    const response = await fetch(`${apiUrl}/api/portal/session`, { credentials: "include" })
    const body = response.ok ? await response.json() : null
    return { status: response.status, email: body?.email }
  }, e2eUrls.api)
  expect(session).toEqual({ status: 200, email })

  await candidate.page.goto(e2eUrls.exam)
  await expect(candidate.page.getByText("Link tes tidak valid")).toBeVisible()
  await candidate.page.goto(`${e2eUrls.candidate}/profile`)
  await expect(candidate.page).toHaveURL(`${e2eUrls.candidate}/profile`)
  await expect(candidate.page.getByLabel("Full name")).toBeVisible()
})

test("halaman dan API privat menolak browser tanpa sesi", async ({ candidate, request }) => {
  await candidate.page.goto(`${e2eUrls.internal}/recruitments`)
  await expect(candidate.page).toHaveURL(`${e2eUrls.internal}/login`)

  await candidate.page.goto(`${e2eUrls.candidate}/portal/${randomUUID()}`)
  await expect(candidate.page.getByRole("heading", { name: "Sign in to open your candidate portal" })).toBeVisible()

  const candidateSession = await request.get(`${e2eUrls.api}/api/portal/session`)
  expect(candidateSession.status()).toBe(401)

  const examTest = await request.get(
    `${e2eUrls.api}/api/exam/${randomUUID()}/stages/${randomUUID()}/test`
  )
  expect(examTest.status()).toBe(401)
})
