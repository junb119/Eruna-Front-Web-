// app/hooks/workout/useGetWorkoutTypes.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useGetWorkoutTypes() {
  const { data, error, isLoading } = useSWR(`/workoutTypes`, fetcher);

  return {
    types: data,
    isLoading,
    isError: error,
  };
}
