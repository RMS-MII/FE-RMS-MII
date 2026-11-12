import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@workspace/ui/globals.css"
import "./portal.css"
import { App } from "./App"
import { JobsPage } from "./components/JobsPage"

const isJobsPage = ["/", "/jobs", "/jobs/"].includes(window.location.pathname)

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isJobsPage ? <JobsPage /> : <App />}</StrictMode>
)
