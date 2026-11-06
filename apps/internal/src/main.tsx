import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { RouterProvider, createRouter } from "@tanstack/react-router"

import "@workspace/ui/globals.css"
import { store } from "./app/store"
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)
