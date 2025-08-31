// app/hooks/workout/useDeleteWorkout.ts
"use client";

import useSWRMutation from "swr/mutation";
import { deleter } from "@/lib/fetcher";
export function useDeleteWorkout(id: string | null) {
  const { trigger, isMutating, error } = useSWRMutation(
    id ? `/workouts/${id}` : null,
    deleter
  );

  return {
    deleteWorkout: trigger,
    isDeleting: isMutating,
    deleteError: error,
  };
}
