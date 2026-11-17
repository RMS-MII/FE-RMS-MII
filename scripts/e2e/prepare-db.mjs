import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { apiEnvironment, getE2EConnectionString } from "./environment.mjs"

const connectionString = getE2EConnectionString()
const backendDirectory = fileURLToPath(
  new URL("../../../BE-RMS-MII/WEBAPI/", import.meta.url)
)

const child = spawn("dotnet", ["ef", "database", "update", "--configuration", "E2E", "--no-build"], {
  cwd: backendDirectory,
  env: { ...process.env, ...apiEnvironment(connectionString) },
  stdio: "inherit",
  shell: false,
})

child.on("error", (error) => {
  console.error(`Could not start dotnet ef: ${error.message}`)
  process.exitCode = 1
})
child.on("exit", (code) => {
  process.exitCode = code ?? 1
})
