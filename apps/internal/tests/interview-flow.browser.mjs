import { createRequire } from "node:module"
import assert from "node:assert/strict"

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright")
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : {}),
})

try {
  const page = await browser.newPage()
  const user = {
    accountId: "account",
    employeeId: "employee",
    username: "interviewer",
    fullName: "Interviewer",
    email: "interviewer@example.test",
    role: "Interviewer",
  }
  await page.addInitScript(({ accountId, fullName, ...profile }) => {
    localStorage.setItem("rms_access_token", "test-token")
    localStorage.setItem(
      "rms_user",
      JSON.stringify({ id: accountId, name: fullName, ...profile })
    )
  }, user)

  const baseSession = {
    sessionName: "Technical Interview",
    batchName: "Test Batch",
    stageName: "Interview",
    scheduledStart: new Date(Date.now() - 7200000).toISOString(),
    scheduledEnd: new Date(Date.now() - 3600000).toISOString(),
    interviewerStatus: "InProgress",
    isOnline: true,
    meetingUrl: "https://meet.google.com/example",
    isAssessmentSubmitted: false,
    assessmentScore: null,
    assessmentRecommendation: null,
    hasTakeHome: false,
    fileTakeHome: null,
    fileSubmission: null,
  }
  const sessions = [
    {
      ...baseSession,
      sessionInterviewId: "waiting-assignment",
      interviewSessionId: "waiting-session",
      candidateName: "Waiting Applicant",
      candidateEmail: "waiting@example.test",
      sessionStatus: "AcceptedByInterviewer",
      canAssignTakeHome: false,
    },
    {
      ...baseSession,
      sessionInterviewId: "finished-assignment",
      interviewSessionId: "finished-session",
      candidateName: "Confirmed Applicant",
      candidateEmail: "confirmed@example.test",
      sessionStatus: "AcceptedByCandidate",
      canAssignTakeHome: true,
      endedSubmissionAt: new Date(Date.now() + 86400000).toISOString(),
    },
  ]
  sessions.push({
    ...baseSession,
    sessionInterviewId: "upcoming-assignment",
    interviewSessionId: "upcoming-session",
    candidateName: "Upcoming Applicant",
    candidateEmail: "upcoming@example.test",
    sessionStatus: "AcceptedByCandidate",
    scheduledStart: new Date(Date.now() + 3600000).toISOString(),
    scheduledEnd: new Date(Date.now() + 7200000).toISOString(),
    canAssignTakeHome: true,
  })
  const taskLink = "https://drive.google.com/drive/folders/test-take-home"
  const assignments = []
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith("/auth/me")) return route.fulfill({ json: user })
    if (path.endsWith("/interviewer/sessions"))
      return route.fulfill({ json: sessions })
    if (path.endsWith("/interview-sessions/finished-session/take-home")) {
      assert.equal(route.request().method(), "POST")
      assignments.push(route.request().postDataJSON())
      sessions[1].fileTakeHome = taskLink
      return route.fulfill({
        json: { emailSent: true, message: "Assignment saved." },
      })
    }
    return route.fulfill({ json: [] })
  })

  await page.goto(
    (process.env.INTERNAL_URL || "http://127.0.0.1:5186") +
      "/interviews/schedules"
  )
  await page.getByText("Awaiting Candidate", { exact: true }).waitFor()
  await page
    .getByRole("button", { name: "Actions for Waiting Applicant" })
    .click()
  await page.getByRole("menuitem", { name: "Request Reschedule" }).waitFor()
  assert.equal(
    await page.getByRole("menuitem", { name: "Submit Evaluation" }).count(),
    0
  )
  const waitingTakeHome = page.getByRole("menuitem", {
    name: /Assign Take-home/,
  })
  assert.equal(await waitingTakeHome.isDisabled(), true)
  assert.match(
    await waitingTakeHome.textContent(),
    /Waiting for candidate confirmation/
  )
  await page.keyboard.press("Escape")
  await page.getByRole("menu").waitFor({ state: "hidden" })

  await page
    .getByRole("button", { name: "Actions for Upcoming Applicant" })
    .click()
  const upcomingTakeHome = page.getByRole("menuitem", {
    name: /Assign Take-home/,
  })
  await upcomingTakeHome.waitFor()
  assert.equal(await upcomingTakeHome.isEnabled(), true)
  await upcomingTakeHome.click()
  const upcomingDialog = page.getByRole("dialog", { name: "Assign Take-home" })
  await upcomingDialog.waitFor()
  await page.keyboard.press("Escape")
  await upcomingDialog.waitFor({ state: "hidden" })

  await page
    .getByRole("button", { name: "Actions for Confirmed Applicant" })
    .click()
  await page.getByRole("menuitem", { name: "Submit Evaluation" }).waitFor()
  await page.getByRole("menuitem", { name: "Assign Take-home" }).click()
  const dialog = page.getByRole("dialog", { name: "Assign Take-home" })
  await dialog.getByLabel("Task title").fill("Technical assignment")
  await dialog.getByLabel("Assignment link").fill(taskLink)
  await dialog
    .getByLabel("Instructions for the email")
    .fill("Use the files in the shared folder.")
  await dialog.getByRole("button", { name: "Save Assignment" }).click()
  await page.getByText("Assignment saved.", { exact: true }).waitFor()
  assert.equal(assignments.length, 1)
  assert.equal(assignments[0].fileTakeHome, taskLink)
  assert.equal(assignments[0].taskTitle, "Technical assignment")
  assert.equal(
    assignments[0].instructions,
    "Use the files in the shared folder."
  )
  assert.ok(Date.parse(assignments[0].endedSubmissionAt) > Date.now())
  assert.deepEqual(errors, [])
  console.log(
    "PASS: evaluation and take-home gating, assignment dialog, correct session ID and payload."
  )
} finally {
  await browser.close()
}
