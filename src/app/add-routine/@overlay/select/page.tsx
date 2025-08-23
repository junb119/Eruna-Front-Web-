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
// app/add-routine/@overlay/select/page.tsx (혹은 컴포넌트 파일)
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useGetWorkoutListExpanded } from "@/app/hooks/workout/useGetWorkoutListExpanded";
import { useRoutineBuilder } from "@/store/routineBuilder";

export default function SelectWorkoutOverlay() {
  const router = useRouter();
  const { workouts = [], isLoading, isError } = useGetWorkoutListExpanded();

  const { items, addWorkout, removeWorkout, toggleWorkout } = useRoutineBuilder() as any;

  // 스토어에 있는 선택 목록을 로컬 체크상태(저장 전까지는 스토어 미변경)
  const selectedIdsFromStore = useMemo(
    () => items.map((it: any) => String(it.workoutId)),
    [items]
  );
  const [checked, setChecked] = useState<string[]>([]);
  useEffect(() => setChecked(selectedIdsFromStore), [selectedIdsFromStore]);

  const workoutMap = useMemo(() => {
    const m = new Map<string, (typeof workouts)[number]>();
    workouts.forEach((w) => m.set(String(w.id), w));
    return m;
  }, [workouts]);

  const toggleLocal = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  function saveSelections() {
    const setFromStore = new Set(selectedIdsFromStore);
    const setFromUI = new Set(checked);

    const toAdd = [...setFromUI].filter((id) => !setFromStore.has(id));
    const toRemove = [...setFromStore].filter((id) => !setFromUI.has(id));

    // 추가: 확장 데이터에서 메타 추출해서 addWorkout에 전달
    toAdd.forEach((id) => {
      const w = workoutMap.get(id);
      if (!w) return;

      const categoryId   = String(w.workoutCategoryId ?? w.category_id ?? w.category?.id ?? "");
      const typeId       = String(w.workoutTypeId ?? w.type_id ?? w.type?.id ?? "");
      const targetId     = String(w.workoutTargetId ?? w.target_id ?? w.target?.id ?? "");

      const categoryName = w.category?.name;
      const typeName     = w.type?.name;
      const targetName   = w.target?.name;

      if (typeof addWorkout === "function") {
        addWorkout({
          workoutId: String(w.id),
          name: w.name,
          categoryId, categoryName,
          typeId,     typeName,
          // target 저장도 원하면 스토어 타입에 추가하고 주입
          // targetId,  targetName,

          // ⬇️ 타입명에서 모드 추론 → 기본 config 자동 설정(스토어가 제공)
          // mode/config는 스토어에서 infer + default 처리하므로 여기선 생략해도 OK
        });
      } else if (typeof toggleWorkout === "function") {
        toggleWorkout({ workoutId: String(w.id), name: w.name });
      }
    });

    // 제거 반영
    toRemove.forEach((id) => {
      if (typeof removeWorkout === "function") removeWorkout(id);
      else if (typeof toggleWorkout === "function") toggleWorkout({ workoutId: id });
    });

    router.back();
  }

  if (isLoading) return <OverlayFrame onClose={() => router.back()}>로딩…</OverlayFrame>;
  if (isError)   return <OverlayFrame onClose={() => router.back()}>데이터를 불러오지 못했어요.</OverlayFrame>;

  return (
    <OverlayFrame onClose={() => router.back()}>
      <div className="p-4 flex items-center justify-between border-b">
        <h1 className="text-lg font-semibold">운동 선택</h1>
        <button onClick={() => router.back()}>닫기</button>
      </div>

      <ul className="divide-y">
        {workouts.map((w) => {
          const id = String(w.id);
          const isChecked = checked.includes(id);
          const wasInStore = selectedIdsFromStore.includes(id);

          return (
            <li key={id} className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleLocal(id)}>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-3" checked={isChecked} readOnly />
                <div>
                  <div className="font-medium">{w.name}</div>
                  <div className="text-sm text-gray-500">
                    {(w.category?.name ?? "카테고리") + " · " + (w.type?.name ?? "타입")}
                  </div>
                </div>
              </label>
              {wasInStore && <span className="text-xs rounded bg-gray-100 px-2 py-1 text-gray-600">기존선택</span>}
            </li>
          );
        })}
      </ul>

      <div className="p-4 flex justify-end gap-2 border-t">
        <button onClick={() => router.back()}>취소</button>
        <button className="bg-black text-white rounded px-3 py-2" onClick={saveSelections}>확인</button>
      </div>
    </OverlayFrame>
  );
}

// 오버레이 공통 프레임(재사용용)
function OverlayFrame({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 translate-x-0">
        {children}
      </aside>
    </div>
  );
}
