import { expect, test as base, type BrowserContext, type Page } from "@playwright/test"
import { e2eUrls } from "../../scripts/e2e/environment.mjs"

export interface Actor {
  context: BrowserContext
  page: Page
}

type ActorFixtures = {
  hr: Actor
  interviewer: Actor
  candidate: Actor
}

function internalPassword() {
  const value = process.env.RMS_E2E_INTERNAL_PASSWORD
  if (!value) throw new Error("Set RMS_E2E_INTERNAL_PASSWORD for the seeded E2E accounts")
  return value
}

async function createActor(browser: Parameters<Parameters<typeof base.extend>[0]>[0]) {
  const context = await browser.newContext()
  const page = await context.newPage()
  return { context, page }
}

async function loginInternal(actor: Actor, username: string) {
  await actor.page.goto(`${e2eUrls.internal}/login`)
  await actor.page.getByLabel("Username").fill(username)
  const passwordInput = actor.page.getByLabel("Password", { exact: true })
  await passwordInput.fill(internalPassword())
  try {
    await actor.page.getByRole("button", { name: "Sign In to Portal" }).click({ timeout: 10_000 })
    await expect(actor.page).toHaveURL(`${e2eUrls.internal}/dashboard`, { timeout: 10_000 })
  } finally {
    if (!actor.page.isClosed()) {
      await actor.page.evaluate(() => {
        const input = document.querySelector<HTMLInputElement>('input[type="password"]')
        if (input) input.value = ""
      })
    }
  }
}

export const test = base.extend<ActorFixtures>({
  hr: async ({ browser }, use) => {
    const actor = await createActor(browser)
    try {
      await loginInternal(actor, process.env.RMS_E2E_HR_USERNAME ?? "hr_manager")
      await use(actor)
    } finally {
      await actor.context.close()
    }
  },
  interviewer: async ({ browser }, use) => {
    const actor = await createActor(browser)
    try {
      await loginInternal(
        actor,
        process.env.RMS_E2E_INTERVIEWER_USERNAME ?? "budi_santoso"
      )
      await use(actor)
    } finally {
      await actor.context.close()
    }
  },
  candidate: async ({ browser }, use) => {
    const actor = await createActor(browser)
    try {
      await use(actor)
    } finally {
      await actor.context.close()
    }
  },
})

export { expect } from "@playwright/test"
