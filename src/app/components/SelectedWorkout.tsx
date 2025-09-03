'use client'
import React from "react";
import { useGetWorkout } from "../hooks/workout/useGetWorkout";

/**
 * @description 특정 `workoutId`에 해당하는 운동의 상세 정보를 표시하는 컴포넌트입니다.
 *              `useGetWorkout` 훅을 사용하여 운동 데이터를 가져오고, 로딩 및 에러 상태를 처리합니다.
 * @param {string} workoutId - 표시할 운동의 ID입니다.
 */
const SelectedWorkout = ({ workoutId }: { workoutId: string }) => {
  // --- Hooks ---
  /** @description 특정 `workoutId`에 해당하는 운동 데이터를 가져옵니다. */
  const { workout, isError, isLoading, mutate } = useGetWorkout(workoutId);

  // --- Render Logic ---
  // 데이터 로딩 중일 때 표시할 UI
  if (isLoading) return <p>loading...</p>;
  // 데이터 로딩 중 에러 발생 시 표시할 UI
  if (isError) return <p className="text-red-500">{workoutId}에러d : {String(isError)}</p>;
  // 운동 데이터를 찾지 못했을 때 표시할 UI
  if (!workout) return <div className="p-4">해당 운동을 찾지 못했습니다.</div>;

  // 디버깅을 위한 콘솔 로그 (필요에 따라 제거 가능)
  console.log(workout.workoutCategory);
  
  // 운동 이름을 표시합니다.
  return <div>{workout.name}</div>;
};

export default SelectedWorkout;