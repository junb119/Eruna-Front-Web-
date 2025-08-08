import React, { useState } from "react";
import { useGetWorkoutList } from "../hooks/workout/useGetWorkoutList";

const SelectWorkoutList = ({ show }) => {
  const { workouts, isError, isLoading, mutate } = useGetWorkoutList();
  console.log(workouts);

  const [first, setfirst] = useState(second)

  return (
    <div
      className={`${
        show ? "translate-x-0" : "translate-x-[100%]"
      } w-full h-screen transition`}
    >
      <h1 className="text-xl font-bold mb-4">운동 선택</h1>

      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>{workout.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SelectWorkoutList;
