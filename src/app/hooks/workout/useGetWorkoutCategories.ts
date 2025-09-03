// app/hooks/workout/useGetWorkoutCategories.ts
// app/hooks/workout/useGetWorkoutCategories.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * 모든 운동 카테고리 목록을 가져오는 SWR 훅.
 *
 * @returns {{
 *   categories: any[] | undefined; // 가져온 운동 카테고리 목록 데이터
 *   isLoading: boolean; // 데이터 로딩 중인지 여부
 *   isError: Error | undefined; // 데이터 로딩 중 에러 발생 여부
 * }}
 */
export function useGetWorkoutCategories() {
  const { data, error, isLoading } = useSWR(`/workoutCategories`, fetcher);

  return {
    categories: data,
    isLoading,
    isError: error,
  };
}
