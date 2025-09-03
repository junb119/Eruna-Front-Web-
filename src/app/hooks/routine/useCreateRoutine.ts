// app/hooks/routine/useCreateRoutine.ts
// app/hooks/routine/useCreateRoutine.ts
"use client";

import useSWRMutation from "swr/mutation";
import { poster } from "@/lib/fetcher";
import { Routine } from "@/app/add-routine/page";

/**
 * 새로운 루틴을 생성하는 SWR Mutation 훅.
 *
 * @returns {{
 *   createRoutine: (data: Routine) => Promise<any>; // SWRMutation의 trigger 함수
 *   isCreating: boolean; // 루틴 생성 작업 진행 상태
 *   createError: Error | undefined; // 루틴 생성 중 발생한 에러
 * }}
 */
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

