// app/add-routine/@overlay/select/page.tsx (또는 SelectWorkoutOverlay.tsx)
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRoutineBuilder } from "@/store/routineBuilder";
import { useGetWorkoutListJoined } from "@/app/hooks/workout/useGetWorkoutListJoined";

export default function SelectWorkoutOverlay() {
  const router = useRouter();
  const { workouts = [], isLoading, isError } = useGetWorkoutListJoined();
console.log(workouts)
  // 스토어
  const { items, addWorkout, removeWorkout, toggleWorkout } = useRoutineBuilder() as any;

  // 스토어에 이미 선택된 id들
  const selectedIdsFromStore = useMemo(
    () => items.map((it: any) => String(it.workoutId)),
    [items]
  );

  // 로컬 체크박스 상태(저장 전까지 스토어 변화 X)
  const [checked, setChecked] = useState<string[]>([]);
  useEffect(() => { setChecked(selectedIdsFromStore); }, [selectedIdsFromStore]);

  const toggleLocal = (id: string) =>
    setChecked(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  // id -> 조인된 workout 빠르게 찾게 맵 구성
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

      // 조인된 객체에서 필요한 메타 추출
      const categoryId   = w.workoutCategoryId;
      const categoryName = w.category?.name;
      const typeId       = w.workoutTypeId;
      const typeName     = w.type?.name;
      const unitPrimary  = w.type?.unit_primary; // "repOnly" | "strength" | "duration" | undefined
      const targetId     = w.workoutTargetId;
      const targetName   = w.target?.name;

      // 스토어로 전달 (현재 스토어 시그니처에 맞게)
      if (typeof addWorkout === "function") {
        addWorkout({
          workoutId: String(w.id),
          name: w.name,
          categoryId, categoryName,
          typeId, typeName,
          typeUnitPrimary: unitPrimary,

          // 👉 필요하면 타겟도 저장
          // targetId, targetName,

          // (선택) 타입 기반 초기 mode/config 힌트
          // unit_primary를 store 내부에서 mode로 매핑해도 되고,
          // 여기서 직접 mode로 바꿔 넘겨도 됨.
          // mode: unitPrimary, // ← store에서 매핑한다면 그대로 넘기고,
          // config: { ... }    // 초깃값도 원하는 대로 지정 가능
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
        <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl">로딩…</aside>
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
                        {(w.category?.name ?? "카테고리")} · {(w.type?.name ?? "타입")} · {(w.target?.name ?? "타겟")}
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
