// "use client";

// import { useRouter } from "next/navigation";
// import { useGetWorkoutList } from "@/app/hooks/workout/useGetWorkoutList";
// import { useState } from "react";
// import { useRoutineBuilder } from "@/store/routineBuilder";

// export default function SelectWorkoutOverlay() {
//   const router = useRouter();
//   const { workouts = [], isLoading, isError } = useGetWorkoutList();
//   // String 또는 Number 타입의 ID를 저장할 배열로 변경
//   const { items, toggleWorkout } = useRoutineBuilder();

//   const alreadySelectedWorkout = items.map((item) => item.workoutId);
//   const [checkedWorkout, setCheckedWorkout] = useState<string[]>(
//     alreadySelectedWorkout.length === 0 ? [] : alreadySelectedWorkout
//   );

//   function saveSelectWorkout() {
//     checkedWorkout.forEach((workoutId) => {
//       toggleWorkout({ workoutId, name: "" });
//     });
//     router.back();
//   }
//   function checkWorkout(e: React.MouseEvent, workoutId: string) {
//     // 현재 체크된 workoutId가 배열에 포함되어 있는지 확인
//     if (checkedWorkout.includes(workoutId)) {
//       // 포함되어 있다면, 해당 id를 제외한 새 배열을 생성 (체크 해제)
//       setCheckedWorkout(checkedWorkout.filter((id) => id !== workoutId));
//     } else {
//       // 포함되어 있지 않다면, 기존 배열에 id를 추가 (체크)
//       setCheckedWorkout([...checkedWorkout, workoutId]);
//     }
//   }

//   // 오버레이는 항상 렌더되므로, 로딩/에러도 오버레이 프레임 안에서 처리
//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 z-50">
//         <div
//           className="absolute inset-0 bg-black/40"
//           onClick={() => router.back()}
//         />
//         <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl">
//           로딩…
//         </aside>
//       </div>
//     );
//   }
//   if (isError) {
//     return (
//       <div className="fixed inset-0 z-50">
//         <div
//           className="absolute inset-0 bg-black/40"
//           onClick={() => router.back()}
//         />
//         <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl">
//           데이터를 불러오지 못했어요.
//           <button className="ml-2 underline" onClick={() => router.back()}>
//             닫기
//           </button>
//         </aside>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 z-50">
//       {/* 배경 클릭 → 닫기 */}
//       <div
//         className="absolute inset-0 bg-black/40"
//         onClick={() => router.back()}
//       />

//       {/* 오른쪽 슬라이드 패널 */}
//       <aside
//         className="
//           absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl
//           transform transition-transform duration-300 translate-x-0
//         "
//       >
//         <div className="p-4 flex items-center justify-between border-b">
//           <h1 className="text-lg font-semibold">운동 선택</h1>
//           <button type="button" onClick={() => router.back()}>
//             닫기
//           </button>
//         </div>

//         <ul className="divide-y">
//           {workouts.map((w: any) => (
//             <li
//               key={w.id}
//               className="p-4 flex items-center justify-between cursor-pointer" // cursor-pointer 추가
//               onClick={(e) => checkWorkout(e, w.id)}
//             >
//               {/* input이 li의 자식이므로, div로 감싸서 구조를 명확히 함 */}
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   className="mr-3"
//                   // checkedWorkout 배열에 현재 w.id가 포함되어 있는지 여부로 checked 상태 결정
//                   checked={checkedWorkout.includes(w.id)}
//                   // li의 onClick으로 제어하므로, checkbox 자체의 이벤트 전파를 막기 위해 readOnly 추가
//                   readOnly
//                 />
//                 <div>
//                   <div className="font-medium">{w.name}</div>
//                   <div className="text-sm text-gray-500">
//                     {w.workoutCategory?.name} · {w.workoutType?.name}
//                   </div>
//                 </div>
//               </div>
//             </li>
//           ))}
//         </ul>
//         <div>
//           <button type="button" onClick={() => router.back()}>
//             취소
//           </button>
//           <button
//             type="button"
//             onClick={() => {
//               saveSelectWorkout();
//             }}
//           >
//             확인
//           </button>
//         </div>
//       </aside>
//     </div>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import { useGetWorkoutList } from "@/app/hooks/workout/useGetWorkoutList";
import { useEffect, useMemo, useState } from "react";
import { useRoutineBuilder } from "@/store/routineBuilder";

export default function SelectWorkoutOverlay() {
  const router = useRouter();
  const { workouts = [], isLoading, isError } = useGetWorkoutList();

  // ✅ 스토어에서 현재 선택된 workoutId 목록
  const { items, toggleWorkout, removeWorkout } = useRoutineBuilder() as {
    items: { workoutId: string }[];
    toggleWorkout: (args: { workoutId: string; name?: string }) => void;
    removeWorkout?: (workoutId: string) => void; // 없을 수도 있음
  };
  const selectedIdsFromStore = useMemo(
    () => items.map((it) => String(it.workoutId)),
    [items]
  );

  // ✅ 이번 오버레이에서 표시/편집할 체크 상태
  const [checked, setChecked] = useState<string[]>([]);

  // ▶ 초기 진입 시: 스토어에 있는 것들로 체크 상태 채우기
  useEffect(() => {
    setChecked(selectedIdsFromStore);
  }, [selectedIdsFromStore]);

  // ▶ 개별 항목 토글(추가/해제 모두 허용)
  function toggleLocal(id: string) {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // ▶ 저장: 델타 계산 → 스토어 반영
  function saveSelections() {
    const setFromStore = new Set(selectedIdsFromStore);
    const setFromUI = new Set(checked);

    // 추가해야 할 것: UI엔 체크되어 있는데 스토어에는 없는 것
    const toAdd = [...setFromUI].filter((id) => !setFromStore.has(id));
    // 제거해야 할 것: 스토어엔 있었는데 UI에서 체크 해제된 것
    const toRemove = [...setFromStore].filter((id) => !setFromUI.has(id));

    // 추가 반영
    toAdd.forEach((workoutId) => {
      toggleWorkout({ workoutId, name: "" });
    });

    // 제거 반영
    if (removeWorkout) {
      toRemove.forEach((workoutId) => removeWorkout(workoutId));
    } else {
      // remove 액션이 없다면 토글을 한 번 더 호출해서 해제
      toRemove.forEach((workoutId) => toggleWorkout({ workoutId }));
    }

    router.back();
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={() => router.back()} />
        <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl">
          로딩…
        </aside>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={() => router.back()} />
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
      <div className="absolute inset-0 bg-black/40" onClick={() => router.back()} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 translate-x-0">
        <div className="p-4 flex items-center justify-between border-b">
          <h1 className="text-lg font-semibold">운동 선택</h1>
          <button type="button" onClick={() => router.back()}>닫기</button>
        </div>

        <ul className="divide-y">
          {workouts.map((w: any) => {
            const id = String(w.id);
            const isChecked = checked.includes(id);
            const wasInStore = selectedIdsFromStore.includes(id);

            return (
              <li
                key={id}
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleLocal(id)}
              >
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={isChecked}
                    readOnly
                    // ↑ li 클릭으로만 토글(이벤트 이중처리 방지)
                  />
                  <div>
                    <div className="font-medium">{w.name}</div>
                    <div className="text-sm text-gray-500">
                      {w.workoutCategory?.name} · {w.workoutType?.name}
                    </div>
                  </div>
                </label>

                {/* UI 힌트: 기존 선택이었는지 표시(선택 유지/해제 구분 도움) */}
                {wasInStore && (
                  <span className="text-xs rounded bg-gray-100 px-2 py-1 text-gray-600">
                    기존선택
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="p-4 flex justify-end gap-2 border-t">
          <button type="button" onClick={() => router.back()}>
            취소
          </button>
          <button
            type="button"
            className="bg-black text-white rounded px-3 py-2"
            onClick={saveSelections}
          >
            확인
          </button>
        </div>
      </aside>
    </div>
  );
}
