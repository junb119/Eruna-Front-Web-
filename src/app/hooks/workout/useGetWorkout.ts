"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * @description 운동(Workout)의 데이터 구조를 정의합니다.
 * @property {string} id - 운동의 고유 ID.
 * @property {string} name - 운동의 이름 (예: "벤치프레스").
 * @property {string} [description] - 운동에 대한 설명.
 * @property {string} [workoutCategoryId] - 이 운동이 속하는 운동 카테고리의 ID.
 * @property {string} [workoutTypeId] - 이 운동이 속하는 운동 종류의 ID.
 * @property {string} [workoutTargetId] - 이 운동이 목표로 하는 부위의 ID.
 * @property {Meta} workoutCategory - 조인된 운동 카테고리 데이터.
 * @property {Meta} workoutType - 조인된 운동 종류 데이터.
 * @property {Meta} workoutTarget - 조인된 운동 목표 부위 데이터.
 */
type Workout = {
  id: string;
  name: string;
  description?: string;
  workoutCategoryId?: string;
  workoutTypeId?: string;
  workoutTargetId?: string;
  // These will be populated by the dependent SWR hooks
  workoutCategory: Meta;
  workoutType: Meta;
  workoutTarget: Meta;
};

/**
 * @description 메타 정보(ID와 이름)를 포함하는 일반적인 데이터 구조를 정의합니다.
 * @property {string} id - 고유 ID.
 * @property {string} name - 이름.
 */
type Meta = { id: string; name: string };

/**
 * 특정 운동의 상세 정보를 가져오는 SWR 훅.
 * 운동 ID를 기반으로 운동 자체와 연결된 카테고리, 종류, 목표 부위 정보를 함께 fetch하여 반환합니다.
 *
 * @param {string | null | undefined} id - 가져올 운동의 ID. 유효한 ID가 아니면 fetch하지 않습니다.
 * @returns {{
 *   workout: Workout | undefined; // 가져온 운동 데이터 (관련 메타 정보 포함) 또는 undefined
 *   isLoading: boolean; // 데이터 로딩 중인지 여부
 *   isError: boolean; // 데이터 로딩 중 에러 발생 여부
 * }}
 */
export function useGetWorkout(id: string | null | undefined) {
  // id가 유효한 문자열일 때만 fetch를 수행하도록 조건 설정
  const shouldFetch = typeof id === "string" && id.length > 0;

  // 1) 기본 운동 엔티티를 가져옵니다.
  const { data: baseWorkout, error: baseError, isLoading: baseIsLoading } = useSWR<Omit<Workout, 'workoutCategory' | 'workoutType' | 'workoutTarget'>>(
    shouldFetch ? `/workouts/${encodeURIComponent(id!)}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // 2) 기본 운동이 로드되면 관련 엔티티들을 가져옵니다. (의존적 SWR)
  const { data: category, error: categoryError, isLoading: categoryIsLoading } = useSWR<Meta>(
    baseWorkout?.workoutCategoryId ? `/workoutCategories/${encodeURIComponent(baseWorkout.workoutCategoryId)}` : null,
    fetcher
  );
  const { data: type, error: typeError, isLoading: typeIsLoading } = useSWR<Meta>(
    baseWorkout?.workoutTypeId ? `/workoutTypes/${encodeURIComponent(baseWorkout.workoutTypeId)}` : null,
    fetcher
  );
  const { data: target, error: targetError, isLoading: targetIsLoading } = useSWR<Meta>(
    baseWorkout?.workoutTargetId ? `/workoutTargets/${encodeURIComponent(baseWorkout.workoutTargetId)}` : null,
    fetcher
  );

  const isLoading = baseIsLoading || categoryIsLoading || typeIsLoading || targetIsLoading;
  const isError = baseError || categoryError || typeError || targetError;

  return {
    // 모든 데이터가 성공적으로 로드되면 조인된 운동 객체를 반환합니다.
    workout: baseWorkout && category && type && target ? { ...baseWorkout, workoutCategory: category, workoutType: type, workoutTarget: target } : undefined,
    isLoading,
    isError: !!isError,
  };
}

