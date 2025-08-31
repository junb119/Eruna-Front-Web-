// app/hooks/routine/useUpdateRoutine.ts
"use client";

import useSWRMutation from "swr/mutation";
import { putter } from "@/lib/fetcher";

export function useUpdateRoutine(id: string | null) {
  const { trigger, isMutating, error } = useSWRMutation(
    id ? `/routines/${id}` : null,
    putter
  );

  return {
    updateRoutine: trigger,
    isUpdating: isMutating,
    updateError: error,
  };
}
