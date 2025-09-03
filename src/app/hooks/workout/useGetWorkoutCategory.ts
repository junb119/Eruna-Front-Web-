import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

/**
 * 특정 운동 카테고리의 상세 정보를 가져오는 SWR 훅.
 * categoryId가 유효할 때만 데이터를 fetch합니다.
 *
 * @param {string | null | undefined} categoryId - 가져올 운동 카테고리의 ID.
 * @returns {{
 *   category: any | null; // 가져온 운동 카테고리 데이터 또는 null
 *   isLoading: boolean; // 데이터 로딩 중인지 여부
 *   isError: boolean; // 데이터 로딩 중 에러 발생 여부
 *   mutate: (data?: any, opts?: any) => Promise<any>; // SWR mutate 함수
 * }}
 */
export const useGetWorkoutCategory = (categoryId: string | null | undefined) => {
  // categoryId가 유효한 문자열일 때만 fetch를 수행하도록 조건 설정
  const shouldFetch = categoryId && typeof categoryId === "string";

  const { data, isLoading, error, mutate } = useSWR(
    shouldFetch ? `/workout_categories/${categoryId}` : null, // categoryId가 없으면 fetch하지 않음
    fetcher
  );

  return {
    category: data ?? null, // 데이터가 없으면 null 반환
    isLoading,
    isError: !!error, // 에러 객체가 존재하면 true
    mutate, // SWR 캐시를 수동으로 업데이트하는 함수
  };
};
