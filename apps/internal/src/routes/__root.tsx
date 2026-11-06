import { createRootRoute, Outlet } from "@tanstack/react-router"
import { NotFoundPage, GeneralErrorPage } from "@/shared/components/errors"

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: (props) => <GeneralErrorPage {...props} />,
})
