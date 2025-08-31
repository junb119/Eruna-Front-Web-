import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useMemo } from "react";

// routineItem과 workout이 조인된 타입 정의
export type RoutineItemJoined = {
  id: string;
  routineId: string;
  workoutId: string;
  order: number;
  sets?: number;
  reps?: number;
  weight?: number;
  timeSec?: number;
  restSec?: number;
  workout?: {
    id: string;
    name: string;
  };
};

export const useGetRoutineItems = (routineId: string | null | undefined) => {
  const shouldFetch = routineId && typeof routineId === "string";

  // 1. 기본 routineItems를 가져옵니다.
  const { 
    data: routineItemsData, 
    error: routineItemsError, 
    isLoading: isLoadingRoutineItems 
  } = useSWR<Omit<RoutineItemJoined, 'workout'>[]>( 
    shouldFetch ? `/routineItems?routineId=${routineId}` : null,
    fetcher
  );

  // 2. 모든 workouts를 가져옵니다 (룩업 테이블용).
  const { 
    data: workoutsData, 
    error: workoutsError, 
    isLoading: isLoadingWorkouts 
  } = useSWR<{id: string, name: string}[]>(
    shouldFetch ? `/workouts` : null, 
    fetcher
  );

  const isLoading = isLoadingRoutineItems || isLoadingWorkouts;
  const isError = routineItemsError || workoutsError;

  // 3. 두 데이터를 클라이언트에서 조인합니다.
  const routineItems: RoutineItemJoined[] = useMemo(() => {
    return (routineItemsData && workoutsData) 
    ? routineItemsData.map(item => {
        const workout = workoutsData.find(w => w.id === item.workoutId);
        return { ...item, workout };
      })
    : [];
  }, [routineItemsData, workoutsData]);

  return {
    routineItems,
    isLoading,
    isError: !!isError,
  };
};
