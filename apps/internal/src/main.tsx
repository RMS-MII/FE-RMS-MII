import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { RouterProvider, createRouter } from "@tanstack/react-router"

import "@workspace/ui/globals.css"
import { store } from "./app/store"
import { finishInitialization, logout, setCredentials } from "@/features/auth/store/auth-slice"
import { mapCurrentUserToAuthUser } from "@/features/auth/types"
import { finishPendingLogout, listenForLogout, refreshSession } from "@/shared/api/auth-session"
import { routeTree } from "./routeTree.gen"
import { NotFoundPage, GeneralErrorPage } from "@/shared/components/errors"

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: () => <NotFoundPage />,
  defaultErrorComponent: (props) => <GeneralErrorPage {...props} />,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

async function start() {
  const root = createRoot(document.getElementById("root")!)
  for (const key of ["rms_access_token", "rms_user", "rms_access_token_expires_at"])
    localStorage.removeItem(key)

  if (!(await finishPendingLogout())) {
    let session
    try {
      session = await refreshSession()
    } catch {
      root.render(
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">Unable to connect to the server. Please check your connection.</p>
          <button className="rounded-md border px-4 py-2 text-sm" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )
      return
    }
    if (session) {
      store.dispatch(setCredentials({
        accessToken: session.accessToken,
        tokenType: session.tokenType,
        expiresAt: session.expiresAt,
        user: mapCurrentUserToAuthUser(session.user),
      }))
    }
  }
  store.dispatch(finishInitialization())
  listenForLogout(() => {
    store.dispatch(logout())
    if (window.location.pathname !== "/login") window.location.replace("/login")
  })
  root.render(
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>
  )
}

void start()
