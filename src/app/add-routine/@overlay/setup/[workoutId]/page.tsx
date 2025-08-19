"use client";

import SelectedWorkout from "@/app/components/SelectedWorkout";
import { useParams, useRouter } from "next/navigation";

export default function SetupWorkoutOverlay() {
  const router = useRouter();
  const {workoutId} = useParams()
  
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => router.back()}
      />

      <aside
        className="
          absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl
          transform transition-transform duration-300 translate-x-0
        "
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h1 className="text-lg font-semibold">운동 설정</h1>
          <button type="button" onClick={() => router.back()}>
            닫기
          </button>
        </div>

        <div className="p-4">
          {/* 기존 SelectedWorkout 로직 재사용 */}
          <SelectedWorkout workoutId={workoutId} />
        </div>
      </aside>
    </div>
  );
}
