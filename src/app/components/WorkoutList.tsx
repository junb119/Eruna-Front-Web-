"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * @description 운동 데이터의 타입을 정의합니다.
 */
interface Workout {
  id: string;
  name: string;
  description?: string;
}

/**
 * @description 운동 목록을 표시하는 컴포넌트입니다.
 *              `useSWR` 훅을 사용하여 서버로부터 운동 데이터를 가져오고, 로딩 및 에러 상태를 처리합니다.
 * @deprecated 이 컴포넌트는 `ClientTabs.tsx` 내에서 운동 목록을 직접 렌더링하는 방식으로 대체되었습니다. 더 이상 사용되지 않습니다.
 */
export default function WorkoutList() {
  // --- Hooks ---
  /** @description `/workout` 엔드포인트에서 운동 목록 데이터를 가져옵니다. */
  const {
    data: workouts,
    error,
    isLoading,
  } = useSWR<Workout[]>("/workout", fetcher);

  // --- Render Logic ---
  // 데이터 로딩 중일 때 표시할 UI
  if (isLoading) return <p>Loading...</p>;
  // 데이터 로딩 중 에러 발생 시 표시할 UI
  if (error) return <p className="text-red-500">에러: {String(error)}</p>;

  // 운동 목록을 렌더링합니다.
  return (
    <ul className="flex flex-col gap-2">
      {workouts?.map((workout) => (
        <li key={workout.id} className="p-2 bg-red-400 rounded-md">
          {workout.name}
        </li>
      ))}
    </ul>
  );
}