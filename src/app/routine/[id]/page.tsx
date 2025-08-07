"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useGetRoutine } from "@/app/hooks/routine/useGetRoutine";
import { useGetRoutineItems } from "@/app/hooks/routine/useGetRoutineItems";
import { useGetWorkout } from "@/app/hooks/workout/useGetWorkout";

const RoutineDetail = () => {
  const { id } = useParams();
  const routineid = typeof id === "string" ? id : null;

  const {
    routine,
    isLoading: routineIsLoading,
    isError: routineIsError,
  } = useGetRoutine(routineid);
  const {
    routineItems,
    isLoading: routineItemsIsLoading,
    isError: routineItemsIsError,
  } = useGetRoutineItems(routineid);
  

  const isLoading = routineIsLoading || routineItemsIsLoading;
  const isError = routineIsError || routineItemsIsError;

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-500">에러 : {String(isError)}</p>;

  return (
    <div>
      {routine.name}
      {routineItems[0].workout?.description}
    </div>
  );
};

export default RoutineDetail;
