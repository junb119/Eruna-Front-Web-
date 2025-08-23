// src/app/hooks/workout/useWorkoutLookups.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export type WorkoutCategory = { id: string; name: string; description?: string };
export type WorkoutType = { id: string; name: string; unit_primary?: string; unit_secondary?: string };
export type WorkoutTarget = { id: string; name: string };

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
