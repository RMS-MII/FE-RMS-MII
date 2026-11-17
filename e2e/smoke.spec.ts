import { expect, test } from "@playwright/test"
import { e2eUrls } from "../scripts/e2e/environment.mjs"

test("semua aplikasi dan layanan E2E tersedia", async ({ page, request }) => {
  const jobs = await request.get(`${e2eUrls.api}/api/portal/jobs`)
  expect(jobs.ok()).toBeTruthy()
  expect(Array.isArray(await jobs.json())).toBeTruthy()

  const inbox = await request.get(`${e2eUrls.smtp4dev}/api/messages`)
  expect(inbox.ok(), "smtp4dev harus tersedia di localhost:5000").toBeTruthy()

  await page.goto(`${e2eUrls.internal}/login`)
  await expect(page.getByLabel("Username")).toBeVisible()

  await page.goto(`${e2eUrls.candidate}/jobs`)
  await expect(page.getByRole("heading", { name: "Open positions" })).toBeVisible()

  await page.goto(e2eUrls.exam)
  await expect(page.getByText("Link tes tidak valid")).toBeVisible()
})
