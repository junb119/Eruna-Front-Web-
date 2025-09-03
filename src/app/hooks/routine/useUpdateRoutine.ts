// app/hooks/routine/useUpdateRoutine.ts
"use client";

import useSWRMutation from "swr/mutation";
import { putter } from "@/lib/fetcher";

/**
 * 기존 루틴을 업데이트하는 SWR Mutation 훅.
 *
 * @param {string | null} id - 업데이트할 루틴의 ID. null일 경우 요청을 보내지 않습니다.
 * @returns {{
 *   updateRoutine: (data: any) => Promise<any>; // SWRMutation의 trigger 함수 (업데이트할 데이터 전달)
 *   isUpdating: boolean; // 업데이트 작업 진행 상태
 *   updateError: Error | undefined; // 업데이트 작업 중 발생한 에러
 * }}
 */
export function useUpdateRoutine(id: string | null) {
  const { trigger, isMutating, error } = useSWRMutation(
    // id가 있을 때만 API 경로를 설정하여, id가 없으면 요청이 트리거되지 않도록 합니다.
    id ? `/routines/${id}` : null,
    putter // PUT 요청을 보내는 fetcher 함수
  );

  return {
    updateRoutine: trigger,
    isUpdating: isMutating,
    updateError: error,
  };
}
