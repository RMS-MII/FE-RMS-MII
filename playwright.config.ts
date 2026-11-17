import { defineConfig, devices } from "@playwright/test"
import { resolve } from "node:path"
import {
  apiEnvironment,
  e2eUrls,
  getE2EConnectionString,
} from "./scripts/e2e/environment.mjs"

const connectionString = getE2EConnectionString()
const backendDirectory = resolve(__dirname, "../BE-RMS-MII/WEBAPI")

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: e2eUrls.internal,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      name: "RMS API",
      command: "dotnet bin/E2E/net10.0/WEBAPI.dll",
      cwd: backendDirectory,
      env: apiEnvironment(connectionString),
      url: `${e2eUrls.api}/api/portal/jobs`,
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      name: "Internal",
      command: "pnpm --dir apps/internal dev --host localhost --port 5183 --strictPort",
      env: { VITE_API_BASE_URL: `${e2eUrls.api}/api` },
      url: `${e2eUrls.internal}/login`,
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      name: "Candidate",
      command: "pnpm --dir apps/candidate dev --host localhost --port 5185 --strictPort",
      env: {
        VITE_API_BASE_URL: `${e2eUrls.api}/api`,
        VITE_EXAM_URL_TEMPLATE: `${e2eUrls.exam}/portal/{candidateId}/stages/{stageId}/test`,
      },
      url: `${e2eUrls.candidate}/jobs`,
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      name: "Exam",
      command: "pnpm --dir apps/exam dev --host localhost --port 5184 --strictPort",
      env: {
        VITE_API_BASE_URL: `${e2eUrls.api}/api`,
        VITE_CANDIDATE_PORTAL_URL: e2eUrls.candidate,
      },
      url: e2eUrls.exam,
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
})
