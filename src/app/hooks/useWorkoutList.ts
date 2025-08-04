import { API_BASE, fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export function useWorkoutList() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/workout/`,
    fetcher
  );

  return {
    workouts: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
