import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useGetWorkout(id: string | null | undefined) {
  const shouldFetch = typeof id === "string" && id.length > 0;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? // 🔧 workout 상세 + 관계형 확장
        `/workouts/${id}?_expand=workoutCategory`
        + `&_expand=workoutType`
        + `&_expand=workoutTarget`
      : null,
    fetcher
  );

  return {
    workout: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
