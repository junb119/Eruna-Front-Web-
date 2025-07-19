import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

interface Routine {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
export default function RoutineList() {
  const {
    data: routines,
    error,
    isLoading,
  } = useSWR<Routine[]>("/routine", fetcher);

  if (isLoading) return <p>loading...</p>;
  if (error) return <p className="text-red-500">에러 : {String(error)}</p>;

  return (
    <ul className="flex flex-col gap-2">
      {routines?.map((routine) => (
        <li key={routine.id} className="p-2 bg-red-400 rounded-md">
          {routine.name}
        </li>
      ))}
    </ul>
  );
}
