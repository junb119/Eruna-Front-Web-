// app/add-routine/@overlay/select/page.tsx (SelectWorkoutOverlay)
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRoutineBuilder } from "@/store/routineBuilder";
import { useGetWorkoutListJoined } from "@/app/hooks/workout/useGetWorkoutListJoined";

export default function SelectWorkoutOverlay() {
  const router = useRouter();
  const { workouts = [], isLoading, isError } = useGetWorkoutListJoined();
  const { items, addWorkout, removeWorkout, toggleWorkout } = useRoutineBuilder() as any;

  // store에 이미 선택되어 있는 id 목록을 파생
  const selectedIdsFromStore = useMemo(
    () => items.map((it: any) => String(it.workoutId)),
    [items]
  );

  // 로컬 체크박스 상태 (저장 전까지 store 변경 없음)
  const [checked, setChecked] = useState<string[]>([]);
  useEffect(() => { setChecked(selectedIdsFromStore); }, [selectedIdsFromStore]);

  const toggleLocal = (id: string) =>
    setChecked(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  // id -> workout 조인 데이터 빠르게 찾을 수 있게 구성
  const joinedMap = useMemo(() => {
    const m = new Map<string, any>();
    workouts.forEach((w) => m.set(String(w.id), w));
    return m;
  }, [workouts]);

  function saveSelections() {
    const setFromStore = new Set(selectedIdsFromStore);
    const setFromUI = new Set(checked);

    const toAdd = [...setFromUI].filter((id) => !setFromStore.has(id));
    const toRemove = [...setFromStore].filter((id) => !setFromUI.has(id));

    // 추가
    toAdd.forEach((id) => {
      const w = joinedMap.get(id);
      if (!w) return;

      const categoryId   = w.workoutCategoryId;
      const categoryName = w.category?.name;
      const typeId       = w.workoutTypeId;
      const typeName     = w.type?.name;
      const unitPrimary  = w.type?.unit_primary as ("repOnly" | "strength" | "duration" | undefined);
      // const targetId     = w.workoutTargetId;
      // const targetName   = w.target?.name;

      if (typeof addWorkout === "function") {
        addWorkout({
          workoutId: String(w.id),
          name: w.name,
          categoryId, categoryName,
          typeId, typeName,
          typeUnitPrimary: unitPrimary,
        });
      } else if (typeof toggleWorkout === "function") {
        toggleWorkout({ workoutId: String(w.id), name: w.name });
      }
    });

    // 제거
    toRemove.forEach((id) => {
      if (typeof removeWorkout === "function") removeWorkout(id);
      else if (typeof toggleWorkout === "function") toggleWorkout({ workoutId: id });
    });

    router.back();
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={() => router.back()} />
        <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl">로딩중</aside>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={() => router.back()} />
        <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl">
          데이터를 불러오지 못했어요.
          <button className="ml-2 underline" onClick={() => router.back()}>닫기</button>
        </aside>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => router.back()} />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 translate-x-0">
        <div className="p-4 flex items-center justify-between border-b">
          <h1 className="text-lg font-semibold">운동 선택</h1>
          <button type="button" onClick={() => router.back()}>닫기</button>
        </div>

        <ul className="divide-y">
          {workouts.map((w) => {
            const id = String(w.id);
            const isChecked = checked.includes(id);
            const wasInStore = selectedIdsFromStore.includes(id);
            return (
              <li key={id} className="p-4 flex items-center justify-between">
                <label htmlFor={id} className="flex w-full cursor-pointer items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id={id}
                      type="checkbox"
                      className="mr-3"
                      checked={isChecked}
                      onChange={() => toggleLocal(id)}
                    />
                    <div>
                      <div className="font-medium">{w.name}</div>
                      <div className="text-sm text-gray-500">
                        {(w.category?.name ?? "카테고리")} · {(w.type?.name ?? "종류")} · {(w.target?.name ?? "부위")}
                      </div>
                    </div>
                  </div>
                  {wasInStore && (
                    <span className="text-xs rounded bg-gray-100 px-2 py-1 text-gray-600">
                      기존선택
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>

        <div className="p-4 flex justify-end gap-2 border-t">
          <button type="button" onClick={() => router.back()}>취소</button>
          <button type="button" className="bg-black text-white rounded px-3 py-2" onClick={saveSelections}>확인</button>
        </div>
      </aside>
    </div>
  );
}