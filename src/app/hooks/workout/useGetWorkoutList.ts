import { API_BASE, fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export function useGetWorkoutList() {
  const { data, error, isLoading, mutate } = useSWR(
    `/workouts/?_expand=workoutCategory&_expand=workoutType&_expand=workoutTarget`,
    fetcher
  );

  return {
    workouts: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
