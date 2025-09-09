// app/hooks/routine/useCreateRoutine.ts
"use client";

import useSWRMutation from "swr/mutation";
import { poster } from "@/lib/fetcher";

export function useCreateRoutine() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/routines", // 루틴 생성 API 엔드포인트
    poster // POST 요청을 보내는 fetcher 함수
  );

  return {
    createRoutine: trigger,
    isCreating: isMutating,
    createError: error,
  };
}

