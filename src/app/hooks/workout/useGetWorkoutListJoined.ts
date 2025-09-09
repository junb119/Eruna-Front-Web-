"use client";
// hooks/workout/useGetWorkoutListJoined.ts

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/** 리소스 타입들(느슨하게) */
type Workout = {
  id: string;
  name: string;
  description?: string;
  workoutCategoryId?: string;
  workoutTypeId?: string;
  workoutTargetId?: string;
};

type WorkoutCategory = {
  id: string;
  name: string;
  description?: string;
  order?: number;
};

type WorkoutType = {
  id: string;
  name: string;
  unit_primary?: "repOnly" | "strength" | "duration";
  unit_secondary?: string;
  description?: string;
};

type WorkoutTarget = { id: string; name: string };

/** 조인된 형태: category/type/target를 중첩 객체로 포함 */
export type WorkoutJoined = Workout & {
  category?: WorkoutCategory;
  type?: WorkoutType;
  target?: WorkoutTarget;
};

/**
 * 모든 운동 목록을 가져오고 각 운동에
 * 카테고리, 종류, 목표 부가정보를 조인합니다.
 * SWR로 병렬 요청 후 클라이언트에서 조인합니다.
 */
export function useGetWorkoutListJoined() {
  const {
    data: workouts,
    error: e1,
    isLoading: l1,
  } = useSWR<Workout[]>("/workouts", fetcher);
  const {
    data: cats,
    error: e2,
    isLoading: l2,
  } = useSWR<WorkoutCategory[]>("/workoutCategories", fetcher);
  const {
    data: types,
    error: e3,
    isLoading: l3,
  } = useSWR<WorkoutType[]>("/workoutTypes", fetcher);
  const {
    data: targets,
    error: e4,
    isLoading: l4,
  } = useSWR<WorkoutTarget[]>("/workoutTargets", fetcher);

  const isLoading = l1 || l2 || l3 || l4;
  const isError = !!(e1 || e2 || e3 || e4);

  let joined: WorkoutJoined[] = [];
  if (workouts && cats && types && targets) {
    const catMap = new Map(cats.map((c) => [String(c.id), c]));
    const typeMap = new Map(types.map((t) => [String(t.id), t]));
    const targMap = new Map(targets.map((t) => [String(t.id), t]));

    joined = workouts.map((w) => ({
      ...w,
      category: w.workoutCategoryId
        ? catMap.get(String(w.workoutCategoryId))
        : undefined,
      type: w.workoutTypeId
        ? typeMap.get(String(w.workoutTypeId))
        : undefined,
      target: w.workoutTargetId
        ? targMap.get(String(w.workoutTargetId))
        : undefined,
    }));
  }

  return { workouts: joined, isLoading, isError };
}

