import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
// useWorkoutType.ts
/**
 * 특정 운동 종류(WorkoutType)의 상세 정보를 가져오는 SWR 훅.
 * typeId가 유효할 때만 데이터를 fetch합니다.
 *
 * @param {string | undefined} typeId - 가져올 운동 종류의 ID.
 * @returns {{
 *   type: any | null; // 가져온 운동 종류 데이터 또는 null
 *   isLoading: boolean; // 데이터 로딩 중인지 여부
 *   isError: boolean; // 데이터 로딩 중 에러 발생 여부
 * }}
 */
export function useGetWorkoutType(typeId: string | undefined) {
  const shouldFetch = !!typeId;

  const { data, error, isLoading } = useSWR(
    shouldFetch ? `/workout_types/${typeId}` : null, // ✅ typeId 없으면 요청 X
    fetcher
  );

  return {
    type: data ?? null,
    isLoading,
    isError: !!error,
  };
}