// app/hooks/routine/useDeleteRoutine.ts
"use client";

import useSWRMutation from "swr/mutation";
import { deleter } from "@/lib/fetcher";

/**
 * 루틴을 삭제하는 SWR Mutation 훅.
 *
 * @param {string | null} id - 삭제할 루틴의 ID. null일 경우 요청을 보내지 않습니다.
 * @returns {{
 *   deleteRoutine: () => Promise<any>; // SWRMutation의 trigger 함수
 *   isDeleting: boolean; // 삭제 작업 진행 상태
 *   deleteError: Error | undefined; // 삭제 작업 중 발생한 에러
 * }}
 */
export function useDeleteRoutine(id: string | null) {
  const { trigger, isMutating, error } = useSWRMutation(
    // id가 있을 때만 API 경로를 설정하여, id가 없으면 요청이 트리거되지 않도록 합니다.
    id ? `/routines/${id}` : null,
    deleter // DELETE 요청을 보내는 fetcher 함수
  );

  return {
    deleteRoutine: trigger,
    isDeleting: isMutating,
    deleteError: error,
  };
}
