import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useMemo } from "react";

// --- Type Definitions ---
/**
 * @description 운동 종류(WorkoutType)의 데이터 구조를 정의합니다.
 * @property {string} id - 운동 종류의 고유 ID.
 * @property {string} name - 운동 종류의 이름 (예: "세트 + 횟수").
 * @property {string} unit_primary - 운동의 주요 측정 단위 (예: "repOnly", "strength", "duration").
 */
type WorkoutType = {
  id: string;
  name: string;
  unit_primary: string;
};

/**
 * @description 운동(Workout)의 데이터 구조를 정의합니다.
 * @property {string} id - 운동의 고유 ID.
 * @property {string} name - 운동의 이름 (예: "벤치프레스").
 * @property {string} workoutTypeId - 이 운동이 속하는 운동 종류의 ID.
 * @property {WorkoutType} [workoutType] - 조인된 운동 종류 데이터 (클라이언트에서 추가됨).
 */
type Workout = {
  id: string;
  name: string;
  workoutTypeId: string;
  workoutType?: WorkoutType; // Joined data
};

/**
 * @description 루틴 아이템(RoutineItem)과 관련 운동(Workout), 운동 종류(WorkoutType) 데이터가 
 *              클라이언트에서 조인된 최종 데이터 구조를 정의합니다.
 * @property {string} id - 루틴 아이템의 고유 ID.
 * @property {string} routineId - 이 아이템이 속하는 루틴의 ID.
 * @property {string} workoutId - 이 아이템이 참조하는 운동의 ID.
 * @property {number} order - 루틴 내에서의 아이템 순서.
 * @property {number} [sets] - 세트 수.
 * @property {number} [reps] - 반복 횟수.
 * @property {number} [weight] - 무게 (kg).
 * @property {number} [timeSec] - 시간 (초).
 * @property {number} [restSec] - 휴식 시간 (초).
 * @property {Workout} [workout] - 조인된 운동 데이터 (운동 종류 정보 포함).
 */
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
  workout?: Workout; // Use the more specific Workout type
};

// --- Hook Definition ---
/**
 * @description 특정 루틴 ID에 해당하는 모든 루틴 아이템과, 각 아이템에 연결된 운동 및 운동 종류 정보를 가져오는 SWR 훅입니다.
 *              여러 API 엔드포인트에서 데이터를 가져와 클라이언트에서 조인(join)하여 최종 데이터를 구성합니다.
 * @param {string | null | undefined} routineId - 데이터를 가져올 루틴의 ID입니다. ID가 없으면 데이터를 가져오지 않습니다.
 * @returns {{ routineItems: RoutineItemJoined[], isLoading: boolean, isError: boolean }}
 *          - `routineItems`: 조인된 루틴 아이템 목록.
 *          - `isLoading`: 데이터 로딩 중인지 여부.
 *          - `isError`: 데이터 로딩 중 오류가 발생했는지 여부.
 */
export const useGetRoutineItems = (routineId: string | null | undefined) => {
  // --- Data Fetching Logic ---
  /** @description `routineId`가 유효할 때만 데이터를 가져오도록 하는 조건입니다. */
  const shouldFetch = routineId && typeof routineId === "string";

  // 1. 기본 루틴 아이템 목록을 가져옵니다.
  const { 
    data: routineItemsData, 
    error: routineItemsError, 
    isLoading: isLoadingRoutineItems 
  } = useSWR<Omit<RoutineItemJoined, 'workout'>[]>( 
    shouldFetch ? `/routineItems?routineId=${routineId}` : null, // `routineId`가 있을 때만 요청
    fetcher
  );

  // 2. 모든 운동 목록을 가져옵니다. (루틴 아이템에 운동 정보를 조인하기 위한 룩업 테이블용)
  const { 
    data: workoutsData, 
    error: workoutsError, 
    isLoading: isLoadingWorkouts 
  } = useSWR<Omit<Workout, 'workoutType'>[]>( // `workoutType`은 나중에 조인하므로 Omit
    shouldFetch ? `/workouts` : null, // `routineId`가 있을 때만 요청
    fetcher
  );

  // 3. 모든 운동 종류 목록을 가져옵니다. (운동에 운동 종류 정보를 조인하기 위한 룩업 테이블용)
  const { 
    data: workoutTypesData, 
    error: workoutTypesError, 
    isLoading: isLoadingWorkoutTypes 
  } = useSWR<WorkoutType[]>( // `WorkoutType` 타입 사용
    shouldFetch ? `/workoutTypes` : null, // `routineId`가 있을 때만 요청
    fetcher
  );

  // --- Loading & Error States ---
  /** @description 모든 데이터 요청 중 하나라도 로딩 중이면 true입니다. */
  const isLoading = isLoadingRoutineItems || isLoadingWorkouts || isLoadingWorkoutTypes;
  /** @description 모든 데이터 요청 중 하나라도 에러가 발생했으면 true입니다. */
  const isError = routineItemsError || workoutsError || workoutTypesError;

  // --- Data Joining (Memoized) ---
  /**
   * @description 가져온 루틴 아이템, 운동, 운동 종류 데이터를 클라이언트에서 조인합니다.
   *              `useMemo`를 사용하여 의존성(`routineItemsData`, `workoutsData`, `workoutTypesData`)이 변경될 때만 
   *              이 조인 작업을 다시 수행하여 성능을 최적화합니다.
   */
  const routineItems: RoutineItemJoined[] = useMemo(() => {
    // 모든 필수 데이터가 로드되지 않았다면 빈 배열을 반환합니다.
    if (!routineItemsData || !workoutsData || !workoutTypesData) {
      return [];
    }
    const filteredItems = (routineItemsData as any[]).filter(
      (it) => it && String((it as any).routineId) === String(routineId)
    );

    // 운동 ID를 키로 하는 맵을 생성하여 빠른 조회를 가능하게 합니다.
    const workoutsMap = new Map(workoutsData.map(w => [w.id, w]));
    // 운동 종류 ID를 키로 하는 맵을 생성하여 빠른 조회를 가능하게 합니다.
    const workoutTypesMap = new Map(workoutTypesData.map(wt => [wt.id, wt]));

    // 각 루틴 아이템에 해당하는 운동 및 운동 종류 정보를 조인합니다.
    return filteredItems.map(item => {
      const workout = workoutsMap.get(item.workoutId);
      // 운동 정보를 찾지 못했다면 `workout`을 undefined로 설정하고 반환합니다.
      if (!workout) return { ...item, workout: undefined };

      // 운동에 해당하는 운동 종류 정보를 찾습니다.
      const workoutType = workoutTypesMap.get(workout.workoutTypeId);
      
      // 최종적으로 조인된 루틴 아이템 객체를 반환합니다.
      return { 
        ...item, 
        workout: {
          ...workout,
          workoutType: workoutType // 운동 객체 안에 운동 종류 정보를 포함시킵니다.
        } 
      };
    });
  }, [routineItemsData, workoutsData, workoutTypesData]); // 의존성 배열

  // --- Return Values ---
  return {
    routineItems,
    isLoading,
    isError: !!isError, // 에러 객체가 있으면 true, 없으면 false
  };
};
