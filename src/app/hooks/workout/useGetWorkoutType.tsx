import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
// useWorkoutType.ts
export function useGetWorkoutType(typeId: string | undefined) {
  const shouldFetch = !!typeId;

  const { data, error, isLoading } = useSWR(
    shouldFetch ? `/workout_types/${typeId}` : null, // ✅ typeId 없으면 요청 X
    fetcher
  );

  return {
    type: data ?? null,
    isLoading,
    isError: !!error,
  };
}

