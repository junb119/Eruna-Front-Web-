import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

/**
 * @description 루틴 데이터의 타입을 정의합니다.
 */
interface Routine {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * @description 루틴 목록을 표시하는 컴포넌트입니다.
 *              `useSWR` 훅을 사용하여 서버로부터 루틴 데이터를 가져오고, 로딩 및 에러 상태를 처리합니다.
 * @deprecated 이 컴포넌트는 `ClientTabs.tsx` 내에서 루틴 목록을 직접 렌더링하는 방식으로 대체되었습니다. 더 이상 사용되지 않습니다.
 */
export default function RoutineList() {
  // --- Hooks ---
  /** @description `/routine` 엔드포인트에서 루틴 목록 데이터를 가져옵니다. */
  const {
    data: routines,
    error,
    isLoading,
  } = useSWR<Routine[]>("/routine", fetcher);

  // --- Render Logic ---
  // 데이터 로딩 중일 때 표시할 UI
  if (isLoading) return <p>loading...</p>;
  // 데이터 로딩 중 에러 발생 시 표시할 UI
  if (error) return <p className="text-red-500">에러 : {String(error)}</p>;

  // 루틴 목록을 렌더링합니다.
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