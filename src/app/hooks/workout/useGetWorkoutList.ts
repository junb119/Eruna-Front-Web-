// hooks/workout/useGetWorkoutList.ts (예시)
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useGetWorkoutList(opts?: { expand?: boolean }) {
  const url = opts?.expand
    ? `/workouts?_expand=workoutCategory&_expand=workoutType`
    : `/workouts`;
  const { data, error, isLoading } = useSWR(url, fetcher);
  return { workouts: data ?? [], isLoading, isError: !!error };
}
