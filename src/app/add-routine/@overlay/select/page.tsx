"use client";

import { useRouter } from "next/navigation";
import { useGetWorkoutList } from "@/app/hooks/workout/useGetWorkoutList";

export default function SelectWorkoutOverlay() {
  const router = useRouter();
  const { workouts = [], isLoading, isError } = useGetWorkoutList();

  // 오버레이는 항상 렌더되므로, 로딩/에러도 오버레이 프레임 안에서 처리
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => router.back()}
        />
        <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl">
          로딩…
        </aside>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => router.back()}
        />
        <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl">
          데이터를 불러오지 못했어요.
          <button className="ml-2 underline" onClick={() => router.back()}>
            닫기
          </button>
        </aside>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* 배경 클릭 → 닫기 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => router.back()}
      />

      {/* 오른쪽 슬라이드 패널 */}
      <aside
        className="
          absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl
          transform transition-transform duration-300 translate-x-0
        "
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h1 className="text-lg font-semibold">운동 선택</h1>
          <button type="button" onClick={() => router.back()}>
            닫기
          </button>
        </div>

        <ul className="divide-y">
          {workouts.map((w: any) => (
            <li key={w.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{w.name}</div>
                <div className="text-sm text-gray-500">
                  {w.workoutCategory?.name} · {w.workoutType?.name}
                </div>
              </div>

              {/* 선택 → 설정 오버레이로 라우팅 */}
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => router.push(`/add-routine/setup/${w.id}`)}
              >
                선택
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
