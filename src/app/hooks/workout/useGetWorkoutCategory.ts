import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export const useGetWorkoutCategory = (categoryId: string | null | undefined) => {
  const shouldFetch = categoryId && typeof categoryId === "string";

  const { data, isLoading, error, mutate } = useSWR(
    shouldFetch ? `/workout_categories/${categoryId}` : null,
    fetcher
  );

  return {
    category: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
};
