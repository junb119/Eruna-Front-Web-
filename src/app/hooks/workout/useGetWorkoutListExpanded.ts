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
