import { useGetBatchDashboardQuery } from "../api/recruitments-api"

export function useBatchDashboard() {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetBatchDashboardQuery()

  return { data, isLoading, isError, isFetching, refetch }
}
