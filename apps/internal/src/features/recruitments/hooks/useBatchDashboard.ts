import { useGetBatchDashboardQuery } from "../api/recruitments-api"

export function useBatchDashboard() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetBatchDashboardQuery()

  return { data, isLoading, isError, refetch }
}
