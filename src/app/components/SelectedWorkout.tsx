'use client'
import React from "react";
import { useGetWorkout } from "../hooks/workout/useGetWorkout";

const SelectedWorkout = ({ workoutId }) => {
  const { workout, isError, isLoading, mutate } = useGetWorkout(workoutId);

  if (isLoading) return <p>loading...</p>;
  if (isError) return <p className="text-red-500">{workoutId}에러d : {String(isError)}</p>;
  if (!workout) return <div className="p-4">해당 운동을 찾지 못했습니다.</div>;

  console.log(workout.workoutCategory);
  return <div>{workout.name}</div>;
};

export default SelectedWorkout;
