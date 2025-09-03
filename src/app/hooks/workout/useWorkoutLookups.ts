// src/app/hooks/workout/useWorkoutLookups.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export type WorkoutCategory = { id: string; name: string; description?: string };
export type WorkoutType = { id: string; name: string; unit_primary?: string; unit_secondary?: string };
export type WorkoutTarget = { id: string; name: string };

/**
 * 운동 관련 룩업(lookup) 데이터를 가져오는 SWR 훅.
 * 운동 카테고리, 운동 종류, 운동 목표 부위 데이터를 병렬로 가져오고,
 * 빠른 조회를 위한 Map 객체를 함께 반환합니다.
 *
 * @returns {{
 *   categories: WorkoutCategory[]; // 운동 카테고리 목록
 *   types: WorkoutType[]; // 운동 종류 목록
 *   targets: WorkoutTarget[]; // 운동 목표 부위 목록
 *   categoryMap: Map<string, WorkoutCategory>; // 카테고리 ID를 키로 하는 Map
 *   typeMap: Map<string, WorkoutType>; // 종류 ID를 키로 하는 Map
 *   targetMap: Map<string, WorkoutTarget>; // 목표 부위 ID를 키로 하는 Map
 *   isLoading: boolean; // 데이터 로딩 중인지 여부 (모든 룩업 데이터 포함)
 *   isError: boolean; // 데이터 로딩 중 에러 발생 여부 (모든 룩업 데이터 포함)
 * }}
 */
export function useWorkoutLookups() {
  // 세 테이블을 병렬로 가져옴
  const { data: categories, error: catErr, isLoading: catLoading } =
    useSWR<WorkoutCategory[]>("/workoutCategories", fetcher);
  const { data: types, error: typeErr, isLoading: typeLoading } =
    useSWR<WorkoutType[]>("/workoutTypes", fetcher);
  const { data: targets, error: tgtErr, isLoading: tgtLoading } =
    useSWR<WorkoutTarget[]>("/workoutTargets", fetcher);

  const isLoading = catLoading || typeLoading || tgtLoading;
  const isError = !!(catErr || typeErr || tgtErr);

  // id → 엔티티 빠른 접근을 위한 Map
  const categoryMap = new Map((categories ?? []).map((c) => [String(c.id), c]));
  const typeMap = new Map((types ?? []).map((t) => [String(t.id), t]));
  const targetMap = new Map((targets ?? []).map((t) => [String(t.id), t]));

  return {
    categories: categories ?? [],
    types: types ?? [],
    targets: targets ?? [],
    categoryMap,
    typeMap,
    targetMap,
    isLoading,
    isError,
  };
}
