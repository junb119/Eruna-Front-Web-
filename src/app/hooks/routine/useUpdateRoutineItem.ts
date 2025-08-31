// app/hooks/routine/useUpdateRoutineItem.ts
"use client";

import useSWRMutation from "swr/mutation";
import { putter } from "@/lib/fetcher";

export function useUpdateRoutineItem(id: string | null) {
  const { trigger, isMutating, error } = useSWRMutation(
    id ? `/routineItems/${id}` : null,
    putter
  );

  return {
    updateRoutineItem: trigger,
    isUpdating: isMutating,
    updateError: error,
  };
}
