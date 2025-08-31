// app/hooks/workout/useGetWorkoutCategories.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useGetWorkoutCategories() {
  const { data, error, isLoading } = useSWR(`/workoutCategories`, fetcher);

  return {
    categories: data,
    isLoading,
    isError: error,
  };
}
