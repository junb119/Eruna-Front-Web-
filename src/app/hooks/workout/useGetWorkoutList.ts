// hooks/workout/useGetWorkoutList.ts (예시)
// hooks/workout/useGetWorkoutList.ts (예시)
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * 운동 목록을 가져오는 SWR 훅.
 * 옵션에 따라 관련 카테고리 및 타입 정보를 확장하여 가져올 수 있습니다.
 *
 * @param {{ expand?: boolean }} [opts] - 옵션 객체.
 * @param {boolean} [opts.expand] - true로 설정하면 운동 카테고리 및 타입 정보를 함께 가져옵니다.
 * @returns {{
 *   workouts: any[]; // 가져온 운동 목록 데이터
 *   isLoading: boolean; // 데이터 로딩 중인지 여부
 *   isError: boolean; // 데이터 로딩 중 에러 발생 여부
 * }}
 */
export function useGetWorkoutList(opts?: { expand?: boolean }) {
  const url = opts?.expand
    ? `/workouts?_expand=workoutCategory&_expand=workoutType`
    : `/workouts`;
  const { data, error, isLoading } = useSWR(url, fetcher);
  return { workouts: data ?? [], isLoading, isError: !!error };
}
