import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"
import type { TypedUseSelectorHook } from "react-redux"
import { baseApi } from "@/shared/api/base-api"
import { authSlice } from "@/features/auth"
import type { AuthState } from "@/features/auth"

const sessionListener = createListenerMiddleware()
sessionListener.startListening({
  predicate: (action, currentState, previousState) => {
    const before = (previousState as { auth: AuthState }).auth
    const after = (currentState as { auth: AuthState }).auth
    return (
      authSlice.actions.logout.match(action) ||
      before.user?.id !== after.user?.id ||
      before.user?.employeeId !== after.user?.employeeId ||
      before.user?.role !== after.user?.role
    )
  },
  effect: (_action, api) => {
    api.dispatch(baseApi.util.resetApiState())
  },
})

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(sessionListener.middleware)
      .concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
