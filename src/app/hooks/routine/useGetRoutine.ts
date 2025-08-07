import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export const useGetRoutine = (routineId: string | null | undefined) => {
  const shouldFetch = routineId && typeof routineId === "string";

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/routines/${routineId}` : null,
    fetcher
  );

  return {
    routine: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
};
