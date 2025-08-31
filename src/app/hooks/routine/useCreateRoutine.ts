// app/hooks/routine/useCreateRoutine.ts
"use client";

import useSWRMutation from "swr/mutation";
import { poster } from "@/lib/fetcher";

export function useCreateRoutine() {
  const { trigger, isMutating, error } = useSWRMutation("/routines", poster);

  return {
    createRoutine: trigger,
    isCreating: isMutating,
    createError: error,
  };
}
