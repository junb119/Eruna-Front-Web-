import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export const useGetRoutineItems = (routineId: string | null | undefined) => {
  const shouldFetch = routineId && typeof routineId === "string";

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/routineItems?routine_id=${routineId}&_expand=workout` : null,
    fetcher
  );
  console.log("test", data);
  return {
    routineItems: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
};
