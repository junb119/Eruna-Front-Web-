// src/app/hooks/workout/useGetWorkout.ts
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

type WorkoutBase = {
  id: string;
  name: string;
  workoutCategoryId?: string;
  workoutTypeId?: string;
  workoutTargetId?: string;
};

type Meta = { id: string; name: string };

export function useGetWorkout(id: string | null | undefined) {
  const shouldFetch = typeof id === "string" && id.length > 0;

  // 1) 기본 엔티티 (단건)
  const { data: base, error: baseErr, isLoading: baseLoading } = useSWR<WorkoutBase>(
    shouldFetch ? `/workouts/${encodeURIComponent(id!)}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // 2) 관계(의존형) — base가 로드된 후에만 각각 호출
  const { data: cat }   = useSWR<Meta>(
    base?.workoutCategoryId ? `/workoutCategories/${encodeURIComponent(base.workoutCategoryId)}` : null,
    fetcher
  );
  const { data: type }  = useSWR<Meta>(
    base?.workoutTypeId ? `/workoutTypes/${encodeURIComponent(base.workoutTypeId)}` : null,
    fetcher
  );
  const { data: target }= useSWR<Meta>(
    base?.workoutTargetId ? `/workoutTargets/${encodeURIComponent(base.workoutTargetId)}` : null,
    fetcher
  );

  // 3) 합치기
  const workout = base
    ? {
        ...base,
        workoutCategory: cat ?? null,
        workoutType: type ?? null,
        workoutTarget: target ?? null,
      }
    : null;

  return {
    workout,
    isLoading: baseLoading,
    isError: !!baseErr, // 네트워크/서버 에러만 에러로 처리
  };
}
