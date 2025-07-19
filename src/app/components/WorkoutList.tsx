"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";


interface Workout {
  id: string;
  name: string;
  description?: string;
}

export default function WorkoutList() {
  const {
    data: workouts,
    error,
    isLoading,
  } = useSWR<Workout[]>("/workout", fetcher);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">에러: {String(error)}</p>;
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
