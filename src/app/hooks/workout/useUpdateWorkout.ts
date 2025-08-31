// app/hooks/workout/useUpdateWorkout.ts
"use client";

import useSWRMutation from "swr/mutation";
import { putter } from "@/lib/fetcher";

export function useUpdateWorkout(id: string | null) {
  const { trigger, isMutating, error } = useSWRMutation(
    id ? `/workouts/${id}` : null,
    putter
  );

  return {
    updateWorkout: trigger,
    isUpdating: isMutating,
    updateError: error,
  };
}
