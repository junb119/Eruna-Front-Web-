// app/hooks/routine/useDeleteRoutine.ts
"use client";

import useSWRMutation from "swr/mutation";
import { deleter } from "@/lib/fetcher";

export function useDeleteRoutine(id: string | null) {
  const { trigger, isMutating, error } = useSWRMutation(
    id ? `/routines/${id}` : null,
    deleter
  );

  return {
    deleteRoutine: trigger,
    isDeleting: isMutating,
    deleteError: error,
  };
}
