import useSWR from "swr";
import { API_BASE, fetcher } from "@/lib/fetcher";

export function useWorkout(id: string | null | undefined) {
  const shouldFetch = id && typeof id === "string";

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/workout?id=${id}` : null,
    fetcher
  );

  return {
    workout: data?.[0] ?? null, // 배열이므로 첫 항목 꺼냄
    isLoading,
    isError: !!error,
    mutate,
  };
}
