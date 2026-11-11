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
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  })
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  const candidate = "11111111-1111-1111-1111-111111111111",
    session = "22222222-2222-2222-2222-222222222222"
  const data = {
    candidateId: candidate,
    candidateName: "Alya Putri",
    candidateEmail: "alya@example.test",
    applications: [
      {
        id: "a",
        batchName: "Software Engineer Development Program",
        codeApplication: "APP-2026-0142",
        departmentName: "Application Development",
        status: "InProcess",
        pipeline: [
          { batchStageId: "b1", stageName: "Technical assessment" },
          { batchStageId: "b2", stageName: "Technical interview" },
          { batchStageId: "b3", stageName: "Final interview" },
        ],
        stages: [
          {
            applicationStageId: "st1",
            batchStageId: "b1",
            stageName: "Technical assessment",
            status: "Prioritized",
            endAt: "2027-01-01T00:00:00Z",
            canTakeTest: false,
            sessions: [],
          },
          {
            applicationStageId: "st2",
            batchStageId: "b2",
            stageName: "Technical interview",
            status: "InProgress",
            endAt: "2027-01-10T00:00:00Z",
            canTakeTest: false,
            sessions: [
              {
                id: session,
                sessionName: "Technical interview",
                scheduledStart: "2027-01-09T03:00:00Z",
                scheduledEnd: "2027-01-09T04:00:00Z",
                status: "AcceptedByInterviewer",
                isOnline: true,
                meetingUrl: "https://meet.google.com/example",
                endedSubmissionAt: "2027-01-08T16:59:00Z",
                canConfirm: true,
                canRequestReschedule: true,
                canUploadSubmission: true,
                isSubmitted: false,
                interviewers: ["Budi Santoso"],
              },
            ],
          },
        ],
      },
    ],
  }
  const taskUrl = "https://drive.google.com/drive/folders/take-home"
  const submissionUrl =
    "https://drive.google.com/file/d/" + "a".repeat(130) + "/view"
  data.applications[0].stages[1].sessions[0].fileTakeHome = taskUrl
  const calls = []
  let failSubmission = true
  await page.route("**/api/portal/**", async (route) => {
    const req = route.request()
    calls.push(req.url())
    if (req.method() === "POST") {
      const body = req.postDataJSON()
      const s = data.applications[0].stages[1].sessions[0]
      if (req.url().endsWith("/submission") && failSubmission) {
        failSubmission = false
        return route.fulfill({
          status: 422,
          json: { detail: "Pengumpulan tugas sudah ditutup." },
        })
      }
      if (req.url().endsWith("/submission")) {
        assert.equal(body.fileSubmission, submissionUrl)
        s.fileSubmission = body.fileSubmission
        s.isSubmitted = true
      }
      if (req.url().endsWith("/confirm")) {
        s.canConfirm = false
        s.status = "AcceptedByCandidate"
      }
      if (req.url().endsWith("/reschedule")) {
        assert.equal(
          new Date(body.proposedEnd) - new Date(body.proposedStart),
          3600000
        )
        assert.equal(
          new Date(body.proposedStart).toDateString(),
          new Date(body.proposedEnd).toDateString()
        )
        assert.equal(body.reason, "I have a scheduling conflict.")
        s.canRequestReschedule = false
        s.reschedule = {
          status: "Pending",
          proposedStart: body.proposedStart,
          proposedEnd: body.proposedEnd,
        }
      }
      return route.fulfill({ json: {} })
    }
    return route.fulfill({ json: data })
  })
  const base = process.env.PORTAL_URL || "http://127.0.0.1:5175"
  await page.goto(`${base}/portal/${candidate}`)
  await page
    .getByRole("heading", { name: "Software Engineer Development Program" })
    .waitFor()
  await page.getByText("Final interview", { exact: true }).waitFor()
  await page.getByRole("heading", { name: "Application progress" }).waitFor()
  await page.getByRole("heading", { name: "Next steps" }).waitFor()
  assert.equal(await page.locator("html").getAttribute("lang"), "en")
  assert.equal(await page.getByText("1 of 3 stages passed").count(), 1)
  assert.equal(
    await page
      .locator('[aria-current="step"]')
      .getByText("Technical interview", { exact: true })
      .count(),
    1
  )
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: process.env.SCREENSHOT_DIR + "/candidate-desktop.png",
      fullPage: true,
      animations: "disabled",
    })
  await page.setViewportSize({ width: 320, height: 844 })
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth
    ),
    false,
    "Dashboard mobile must not overflow"
  )
  assert.equal(
    await page.locator("h1").evaluate((el) => getComputedStyle(el).fontSize),
    "24px"
  )
  assert.equal(
    await page
      .locator(".stage-deadline")
      .evaluate((el) => getComputedStyle(el).fontSize),
    "12px"
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("button", { name: "Open navigation" }).click()
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Take-home tasks" })
    .click()
  await page
    .getByRole("heading", { name: "Take-home tasks", exact: true })
    .waitFor()
  assert.equal(new URL(page.url()).pathname, `/portal/${candidate}/assignments`)
  await page
    .getByRole("button", { name: "View submission", exact: true })
    .waitFor()
  assert.equal(
    await page
      .getByRole("link", { name: "Open materials" })
      .getAttribute("href"),
    taskUrl
  )
  assert.equal(await page.getByRole("dialog").isVisible(), false)
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth
    ),
    false,
    "Assignments mobile must not overflow"
  )
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: process.env.SCREENSHOT_DIR + "/candidate-dashboard-mobile.png",
      fullPage: true,
      animations: "disabled",
    })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole("link", { name: "Interviews", exact: true }).click()
  await page.getByRole("heading", { name: "Interviews", exact: true }).waitFor()
  assert.equal(new URL(page.url()).pathname, `/portal/${candidate}/interviews`)
  await page.reload()
  await page.getByRole("heading", { name: "Interviews", exact: true }).waitFor()
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: process.env.SCREENSHOT_DIR + "/candidate-interviews.png",
      fullPage: true,
      animations: "disabled",
    })
  await page.getByRole("link", { name: "Review invitation" }).click()
  const confirm = page.getByRole("button", { name: "Confirm attendance" })
  const reschedule = page.getByRole("button", { name: "Request reschedule" })
  const buttonShape = (button) => ({
    height: button.getBoundingClientRect().height,
    top: button.getBoundingClientRect().top,
    radius: getComputedStyle(button).borderRadius,
  })
  assert.deepEqual(
    await reschedule.evaluate(buttonShape),
    await confirm.evaluate(buttonShape)
  )
  await confirm.click()
  await page.getByText("Your attendance is confirmed.").waitFor()
  assert.equal(await page.getByLabel("Google Drive link").count(), 0)
  await reschedule.click()
  await page.getByRole("dialog", { name: "Request reschedule" }).waitFor()
  await page
    .getByLabel("Reason", { exact: true })
    .fill("I have a scheduling conflict.")
  await page.getByRole("button", { name: "Send request" }).click()
  await page.getByText("Select a date, start time, and end time.").waitFor()
  await page.getByLabel("Proposed date", { exact: true }).click()
  await page
    .getByRole("combobox", { name: "Choose the Year" })
    .selectOption("2027")
  await page
    .getByRole("combobox", { name: "Choose the Month" })
    .selectOption("0")
  await page.locator('[data-day="1/11/2027"]').click()
  for (const [label, hour] of [
    ["Start time", "10"],
    ["End time", "11"],
  ]) {
    await page.getByLabel(label, { exact: true }).click()
    await page
      .locator('[data-slot="popover-content"]')
      .getByRole("button", { name: hour, exact: true })
      .first()
      .click()
    await page.keyboard.press("Escape")
  }
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: process.env.SCREENSHOT_DIR + "/candidate-reschedule-desktop.png",
      fullPage: true,
      animations: "disabled",
    })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel("Proposed date", { exact: true }).click()
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth
    ),
    false,
    "Calendar mobile must not overflow"
  )
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path:
        process.env.SCREENSHOT_DIR +
        "/candidate-reschedule-calendar-mobile.png",
      fullPage: true,
      animations: "disabled",
    })
  await page.keyboard.press("Escape")
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth
    ),
    false,
    "Reschedule form must not overflow"
  )
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: process.env.SCREENSHOT_DIR + "/candidate-reschedule-mobile.png",
      fullPage: true,
      animations: "disabled",
    })
  await page
    .getByLabel("Reason", { exact: true })
    .fill("I have a scheduling conflict.")
  await page.getByRole("button", { name: "Send request" }).click()
  await page.getByText("Reschedule: Awaiting review").waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth
    ),
    false,
    "Mobile must not overflow"
  )
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: process.env.SCREENSHOT_DIR + "/candidate-mobile.png",
      fullPage: true,
      animations: "disabled",
    })
  await page.goto(`${base}/portal/${candidate}/assignments`)
  await page
    .getByRole("button", { name: "View submission", exact: true })
    .click()
  const submissionDialog = page.getByRole("dialog", {
    name: "Take-home submission",
  })
  assert.equal(
    await submissionDialog
      .getByRole("link", { name: "Open materials" })
      .getAttribute("href"),
    taskUrl
  )
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth
    ),
    false,
    "Submission modal must not overflow"
  )
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: process.env.SCREENSHOT_DIR + "/candidate-submission-mobile.png",
      fullPage: true,
      animations: "disabled",
    })
  await submissionDialog.getByLabel("Google Drive link").fill(submissionUrl)
  await submissionDialog
    .getByRole("button", { name: "Submit work", exact: true })
    .click()
  await submissionDialog
    .getByRole("alert")
    .getByText(
      "Could not save your work. Check the link and the submission deadline."
    )
    .waitFor()
  await submissionDialog
    .getByRole("button", { name: "Submit work", exact: true })
    .click()
  await submissionDialog.getByText("Your submission link was saved.").waitFor()
  assert.equal(
    await submissionDialog
      .getByRole("link", { name: "View submitted work" })
      .getAttribute("href"),
    submissionUrl
  )
  await submissionDialog
    .locator("form")
    .getByRole("button", { name: "Close", exact: true })
    .click()
  await submissionDialog.waitFor({ state: "hidden" })
  data.applications.unshift({
    ...data.applications[0],
    id: "b",
    batchName: "Another recruitment batch",
    stages: [],
  })
  for (const route of [
    `/assignments?session=${session}`,
    `/sessions/${session}/submission`,
  ]) {
    await page.goto(`${base}/portal/${candidate}${route}`)
    await submissionDialog
      .getByRole("link", { name: "View submitted work" })
      .waitFor()
    await page.keyboard.press("Escape")
    await submissionDialog.waitFor({ state: "hidden" })
    await page
      .locator(".application-context")
      .getByText("Software Engineer Development Program", { exact: true })
      .waitFor()
  }
  data.applications.shift()
  assert.equal(
    calls.some((url) => url.includes("/test")),
    false,
    "No exam API calls"
  )
  data.applications[0].stages[1].sessions = []
  await page.goto(`${base}/portal/${candidate}/interviews`)
  await page.getByRole("heading", { name: "No interviews yet" }).waitFor()
  await page.goto(`${base}/portal/${candidate}/assignments`)
  await page.getByRole("heading", { name: "No take-home tasks yet" }).waitFor()
  await page.goto(base)
  await page
    .getByRole("heading", { name: "Open your invitation link" })
    .waitFor()
  assert.deepEqual(errors, [])
  console.log(
    "Browser checks passed: overview, confirmation, submission, reschedule, mobile, invalid link; no exam calls."
  )
} finally {
  await browser.close()
}
