// app/hooks/workout/useGetWorkoutTargets.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useGetWorkoutTargets() {
  const { data, error, isLoading } = useSWR(`/workoutTargets`, fetcher);

  return {
    targets: data,
    isLoading,
    isError: error,
  };
}
