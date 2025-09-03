// src/app/hooks/workout/useGetWorkoutListExpanded.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useWorkoutLookups } from "./useWorkoutLookups";

export type WorkoutRow = {
  id: string;
  name: string;
  description?: string;

  // FK 컬럼 (db.json 키에 맞춰 둘 다 커버)
  workoutCategoryId?: string; category_id?: string;
  workoutTypeId?: string;     type_id?: string;
  workoutTargetId?: string;   target_id?: string;
};

export type WorkoutExpanded = WorkoutRow & {
  category?: { id: string; name: string };
  type?: { id: string; name: string; unit_primary?: string; unit_secondary?: string };
  target?: { id: string; name: string };
};

// src/app/hooks/workout/useGetWorkoutListExpanded.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useWorkoutLookups } from "./useWorkoutLookups";

/**
 * @description 운동(Workout)의 기본 데이터 구조를 정의합니다.
 * @property {string} id - 운동의 고유 ID.
 * @property {string} name - 운동의 이름.
 * @property {string} [description] - 운동에 대한 설명.
 * @property {string} [workoutCategoryId] - 운동 카테고리 ID (FK).
 * @property {string} [category_id] - 운동 카테고리 ID (대체 FK).
 * @property {string} [workoutTypeId] - 운동 종류 ID (FK).
 * @property {string} [type_id] - 운동 종류 ID (대체 FK).
 * @property {string} [workoutTargetId] - 운동 목표 부위 ID (FK).
 * @property {string} [target_id] - 운동 목표 부위 ID (대체 FK).
 */
export type WorkoutRow = {
  id: string;
  name: string;
  description?: string;

  // FK 컬럼 (db.json 키에 맞춰 둘 다 커버)
  workoutCategoryId?: string; category_id?: string;
  workoutTypeId?: string;     type_id?: string;
  workoutTargetId?: string;   target_id?: string;
};

/**
 * @description 확장된 운동 데이터 구조를 정의합니다. WorkoutRow에 카테고리, 종류, 목표 부위 정보가 조인됩니다.
 * @property {string} id - 운동의 고유 ID.
 * @property {string} name - 운동의 이름.
 * @property {string} [description] - 운동에 대한 설명.
 * @property {string} [workoutCategoryId] - 운동 카테고리 ID (FK).
 * @property {string} [category_id] - 운동 카테고리 ID (대체 FK).
 * @property {string} [workoutTypeId] - 운동 종류 ID (FK).
 * @property {string} [type_id] - 운동 종류 ID (대체 FK).
 * @property {string} [workoutTargetId] - 운동 목표 부위 ID (FK).
 * @property {string} [target_id] - 운동 목표 부위 ID (대체 FK).
 * @property {{ id: string; name: string }} [category] - 조인된 운동 카테고리 정보.
 * @property {{ id: string; name: string; unit_primary?: string; unit_secondary?: string }} [type] - 조인된 운동 종류 정보.
 * @property {{ id: string; name: string }} [target] - 조인된 운동 목표 부위 정보.
 */
export type WorkoutExpanded = WorkoutRow & {
  category?: { id: string; name: string };
  type?: { id: string; name: string; unit_primary?: string; unit_secondary?: string };
  target?: { id: string; name: string };
};

/**
 * 모든 운동 목록을 가져오고, 각 운동에 대한 카테고리, 종류, 목표 부위 정보를 확장하여 반환하는 SWR 훅.
 * `useWorkoutLookups` 훅을 사용하여 관련 데이터를 가져온 후 클라이언트 측에서 조인합니다.
 *
 * @returns {{
 *   workouts: WorkoutExpanded[]; // 확장된 운동 목록 데이터
 *   isLoading: boolean; // 데이터 로딩 중인지 여부 (운동 목록 및 룩업 데이터 포함)
 *   isError: boolean; // 데이터 로딩 중 에러 발생 여부 (운동 목록 및 룩업 데이터 포함)
 * }}
 */
export function useGetWorkoutListExpanded() {
  const { data, error, isLoading } = useSWR<WorkoutRow[]>("/workouts", fetcher);
  const lookups = useWorkoutLookups();

  // 로딩/에러 통합 상태
  const loading = isLoading || lookups.isLoading;
  const isError = !!(error || lookups.isError);

  // 조인: 리스트 1회 + 룩업 3회 → 메모리상 조인
  const workouts: WorkoutExpanded[] = (data ?? []).map((w) => {
    const catId = String(w.workoutCategoryId ?? w.category_id ?? "");
    const typeId = String(w.workoutTypeId ?? w.type_id ?? "");
    const tgtId  = String(w.workoutTargetId ?? w.target_id ?? "");

    const category = catId ? lookups.categoryMap.get(catId) : undefined;
    const type     = typeId ? lookups.typeMap.get(typeId) : undefined;
    const target   = tgtId ? lookups.targetMap.get(tgtId) : undefined;

    return {
      ...w,
      category: category ? { id: String(category.id), name: category.name } : undefined,
      type:     type     ? { id: String(type.id), name: type.name, unit_primary: (type as any).unit_primary, unit_secondary: (type as any).unit_secondary } : undefined,
      target:   target   ? { id: String(target.id), name: target.name } : undefined,
    };
  });

  return { workouts, isLoading: loading, isError };
}

