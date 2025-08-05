"use client";
import GobackBtn from "@/app/components/GobackBtn";
import { useGetWorkout } from "@/app/hooks/useGetWorkout";
import { useGetWorkoutCategory } from "@/app/hooks/useGetWorkoutCategory";
import { useGetWorkoutType } from "@/app/hooks/useGetWorkoutType";
import { useParams } from "next/navigation";

const WorkoutDetail = () => {
  const { id } = useParams();
  console.log("🧪 useParams id:", id, typeof id);

  const workoutId = typeof id === "string" ? id : null;

  const {
    workout,
    isLoading: workoutIsLoading,
    isError: workoutIsError,
  } = useGetWorkout(workoutId);
  console.log(workout);

  const {
    type,
    isLoading: typeIsLoading,
    isError: typeIsError,
  } = useGetWorkoutType(workout?.type_id);

  const {
    category,
    isLoading: categoryIsLoading,
    isError: categoryIsError,
  } = useGetWorkoutCategory(workout?.category_id);

  const isLoading =
    !workoutId || workoutIsLoading || typeIsLoading || categoryIsLoading;
  const Error =
    workoutIsError ||
    typeIsError ||
    categoryIsError ||
    !workout ||
    !type ||
    !category;

  if (isLoading) return <p>loading</p>;
  if (Error) return <p>오류 발생</p>;

  return (
    <div className="p-4">
      <GobackBtn />
      <h1 className="text-xl font-bold">{workout.name}</h1>
      <p className="text-gray-600">{workout.description}</p>
      <p className="text-sm mt-2">기록 타입: {type.name}</p>
      <p>카테고리: {category.name}</p>
    </div>
  );
};

export default WorkoutDetail;
