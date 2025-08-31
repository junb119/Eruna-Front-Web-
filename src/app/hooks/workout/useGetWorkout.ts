"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

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

type Meta = { id: string; name: string };

export function useGetWorkout(id: string | null | undefined) {
  const shouldFetch = typeof id === "string" && id.length > 0;

  // 1) Fetch the base workout entity
  const { data: baseWorkout, error: baseError, isLoading: baseIsLoading } = useSWR<Omit<Workout, 'workoutCategory' | 'workoutType' | 'workoutTarget'>>(
    shouldFetch ? `/workouts/${encodeURIComponent(id!)}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // 2) Fetch related entities once the base workout is loaded
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
    workout: baseWorkout && category && type && target ? { ...baseWorkout, workoutCategory: category, workoutType: type, workoutTarget: target } : undefined,
    isLoading,
    isError: !!isError,
  };
}

