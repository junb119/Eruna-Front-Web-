"use client";
import React, { useState } from "react";
import { useGetWorkoutList } from "../hooks/workout/useGetWorkoutList";
import SelectedWorkout from "./SelectedWorkout";

/**
 * @description 운동 목록을 표시하고, 사용자가 운동을 선택할 수 있도록 하는 컴포넌트입니다.
 *              선택된 운동의 상세 정보를 보여주는 `SelectedWorkout` 컴포넌트와 연동됩니다.
 * @param {boolean} showWorkoutlist - 운동 목록의 표시 여부를 제어합니다. (현재는 `translate-x` CSS 클래스로 제어)
 */
const SelectWorkoutList = ({ show: showWorkoutlist }: { show: boolean }) => {
  // --- Hooks ---
  /** @description 모든 운동 목록 데이터를 가져옵니다. */
  const { workouts, isError, isLoading, mutate } = useGetWorkoutList();

  // --- State ---
  /** @description 특정 운동의 상세 정보를 보여줄지 여부를 관리하는 상태입니다. */
  const [showWorkout, setShowWorkout] = useState(false);
  /** @description 현재 선택된 운동의 ID를 저장하는 상태입니다. */
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");

  // --- Debugging ---
  // 운동 목록 데이터를 콘솔에 출력 (디버깅용, 필요에 따라 제거 가능)
  console.log(workouts);

  // --- Render Logic ---
  // 데이터 로딩 중일 때 표시할 UI
  if (isLoading) return <p>loading...</p>;
  // 데이터 로딩 중 에러 발생 시 표시할 UI
  if (isError) return <p className="text-red-500">에러 : {String(isError)}</p>;

  return (
    <div
      // `showWorkoutlist` 값에 따라 CSS `translate-x` 속성을 변경하여 슬라이드 애니메이션을 구현합니다.
      className={`${
        showWorkoutlist ? "translate-x-0" : "translate-x-[100%]"
      } w-full h-screen transition`}
    >
      {/* `showWorkout` 상태가 true일 경우, 선택된 운동의 상세 정보를 표시합니다. */}
      {showWorkout && <SelectedWorkout workoutId={selectedWorkoutId} />}
      <h1 className="text-xl font-bold mb-4">운동 선택</h1>

      {/* 운동 목록을 렌더링합니다. */}
      <ul>
        {workouts?.map((workout) => (
          <li
            key={workout.id}
            onClick={() => {
              setSelectedWorkoutId(workout.id); // 클릭된 운동의 ID를 상태에 저장
              setShowWorkout(true); // `SelectedWorkout` 컴포넌트를 표시하도록 상태 변경
            }}
            className="border p-2 mb-2 rounded-md cursor-pointer hover:bg-gray-50"
          >
            {workout.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectWorkoutList;