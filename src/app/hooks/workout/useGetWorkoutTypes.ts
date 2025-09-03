// app/hooks/workout/useGetWorkoutTypes.ts
// app/hooks/workout/useGetWorkoutTypes.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * 모든 운동 종류(WorkoutType) 목록을 가져오는 SWR 훅.
 *
 * @returns {{
 *   types: any[] | undefined; // 가져온 운동 종류 목록 데이터
 *   isLoading: boolean; // 데이터 로딩 중인지 여부
 *   isError: Error | undefined; // 데이터 로딩 중 에러 발생 여부
 * }}
 */
export function useGetWorkoutTypes() {
  const { data, error, isLoading } = useSWR(`/workoutTypes`, fetcher);

  return {
    types: data,
    isLoading,
    isError: error,
  };
}
