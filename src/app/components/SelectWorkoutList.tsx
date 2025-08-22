"use client";
import React, { useState } from "react";
import { useGetWorkoutList } from "../hooks/workout/useGetWorkoutList";
import SelectedWorkout from "./SelectedWorkout";

const SelectWorkoutList = ({ show: showWorkoutlist }) => {
  const { workouts, isError, isLoading, mutate } = useGetWorkoutList();
  const [showWorkout, setShowWorkout] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  console.log(workouts);

  if (isLoading) return <p>loading...</p>;
  if (isError) return <p className="text-red-500">에러 : {String(isError)}</p>;

  return (
    <div
      className={`${
        showWorkoutlist ? "translate-x-0" : "translate-x-[100%]"
      } w-full h-screen transition`}
    >
      {showWorkout && <SelectedWorkout workoutId={selectedWorkoutId} />}
      <h1 className="text-xl font-bold mb-4">운동 선택</h1>

      <ul>
        {workouts?.map((workout) => (
          <li
            key={workout.id}
            onClick={() => {
              setSelectedWorkoutId(workout.id);
              setShowWorkout(true);
            }}
          >
            {workout.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectWorkoutList;
