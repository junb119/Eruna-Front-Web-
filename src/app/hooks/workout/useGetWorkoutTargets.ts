// app/hooks/workout/useGetWorkoutTargets.ts
// app/hooks/workout/useGetWorkoutTargets.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * 모든 운동 목표 부위 목록을 가져오는 SWR 훅.
 *
 * @returns {{
 *   targets: any[] | undefined; // 가져온 운동 목표 부위 목록 데이터
 *   isLoading: boolean; // 데이터 로딩 중인지 여부
 *   isError: Error | undefined; // 데이터 로딩 중 에러 발생 여부
 * }}
 */
export function useGetWorkoutTargets() {
  const { data, error, isLoading } = useSWR(`/workoutTargets`, fetcher);

  return {
    targets: data,
    isLoading,
    isError: error,
  };
}
