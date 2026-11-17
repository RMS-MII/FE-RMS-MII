import { expect } from "@playwright/test"
import { e2eUrls } from "../../scripts/e2e/environment.mjs"

interface MessageSummary {
  id: string
  to: string[]
  subject: string
  receivedDate: string
}

interface MessagePage {
  results: MessageSummary[]
}

async function findCandidateCode(email: string, requestedAt: number) {
  const response = await fetch(`${e2eUrls.smtp4dev}/api/messages?pageSize=100`)
  if (!response.ok) throw new Error(`smtp4dev returned ${response.status}`)

  const page = (await response.json()) as MessagePage
  const message = page.results.find(
    (item) =>
      item.subject === "Your RMS candidate sign-in code" &&
      item.to.some((recipient) => recipient.toLowerCase() === email.toLowerCase()) &&
      Date.parse(item.receivedDate) >= requestedAt - 5_000
  )
  if (!message) return null

  const bodyResponse = await fetch(
    `${e2eUrls.smtp4dev}/api/messages/${message.id}/plaintext`
  )
  if (!bodyResponse.ok) throw new Error(`smtp4dev message returned ${bodyResponse.status}`)
  const body = await bodyResponse.text()
  return /verification code is (\d{6})\b/.exec(body)?.[1] ?? null
}

export async function waitForCandidateCode(email: string, requestedAt: number) {
  let code: string | null = null
  await expect
    .poll(
      async () => {
        code = await findCandidateCode(email, requestedAt)
        return code !== null
      },
      { message: `OTP email for ${email} was not captured by smtp4dev`, timeout: 20_000 }
    )
    .toBe(true)
  return code!
}
