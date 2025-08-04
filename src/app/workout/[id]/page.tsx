"use client";
import GobackBtn from "@/app/components/GobackBtn";
import { useWorkout } from "@/app/hooks/useWorkout";
import { useWorkoutType } from "@/app/hooks/useWorkoutType";
import { useParams } from "next/navigation";

const WorkoutDetail = () => {
  const { id } = useParams();
  console.log("🧪 useParams id:", id, typeof id);

  const workoutId = typeof id === "string" ? id : null;

  const {
    workout,
    isLoading: workoutIsLoading,
    isError: workoutIsError,
  } = useWorkout(workoutId);
  console.log(workout);

  const {
    type,
    isLoading: typeIsLoading,
    isError: typeIsError,
  } = useWorkoutType(workout?.type_id);

  if (!workoutId || workoutIsLoading || typeIsLoading) return <p>loading</p>;
  if (workoutIsError || typeIsError || !workout || !type)
    return <p>오류 발생</p>;

  return (
    <div className="p-4">
      <GobackBtn />
      <h1 className="text-xl font-bold">{workout.name}</h1>
      <p className="text-gray-600">{workout.description}</p>
      <p className="text-sm mt-2">기록 타입: {type.name}</p>
    </div>
  );
};

export default WorkoutDetail;
