// src/app/components/ClientTabs.tsx
"use client";

import { useState, ReactNode, Children } from "react";
import Link from "next/link";
import Menu from "./Menu";
import { useSidebarStore } from "@/store/useSidebarStore";

/**
 * @description 탭의 종류를 정의하는 타입입니다. 'routines' 또는 'workouts'가 될 수 있습니다.
 */
type Tab = "routines" | "workouts";

/**
 * @description 루틴 데이터의 타입을 정의합니다.
 */
interface Routine {
  id: string;
  name: string;
  description?: string;
}

/**
 * @description 운동 데이터의 타입을 정의합니다.
 */
interface Workout {
  id: string;
  name: string;
  description?: string;
}

/**
 * @description 메인 페이지에서 '내 루틴'과 '내 운동' 탭을 전환하며 목록을 보여주는 컴포넌트입니다.
 *              SSR로 미리 생성된 마크업을 클라이언트에서 탭 전환에 따라 숨기거나 보여주는 방식으로 동작합니다.
 * @param {Routine[]} routines - 표시할 루틴 목록 데이터입니다.
 * @param {Workout[]} workouts - 표시할 운동 목록 데이터입니다.
 */
export default function ClientTabs({
  routines,
  workouts,
}: {
  routines: Routine[];
  workouts: Workout[];
}) {
  // --- State ---
  /** @description 현재 활성화된 탭을 관리하는 상태입니다. 기본값은 'routines'입니다. */
  const [tab, setTab] = useState<Tab>("routines");

  // --- Hooks ---
  /** @description 사이드바 스토어에서 `toggle` 함수를 가져와 사이드바를 열고 닫는 데 사용합니다. */
  const toggle = useSidebarStore((state) => state.toggle);

  // --- Memoized Values ---
  /**
   * @description 루틴 및 운동 목록을 미리 SSR 마크업으로 생성해 둡니다.
   *              이렇게 하면 클라이언트에서 탭 전환 시 새로운 데이터를 렌더링하는 대신,
   *              이미 존재하는 DOM 요소를 숨기거나 보여주는 방식으로 빠르게 전환할 수 있습니다.
   */
  const listElements = useMemo(() => [
    <ul key="r" className="space-y-2">
      {routines.map((r) => (
        <li
          key={r.id}
          className="border rounded hover:bg-gray-50 transition-colors"
        >
          <Link href={`/routine/${r.id}`} className="block p-3">
            <h2 className="font-semibold">{r.name}</h2>
            {r.description && (
              <p className="text-sm text-gray-600">{r.description}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>,
    <ul key="w" className="space-y-2">
      {workouts.map((w) => (
        <li
          key={w.id}
          className="border rounded hover:bg-gray-50 transition-colors"
        >
          <Link href={`/workout/${w.id}`} className="block p-3">
            <h2 className="font-semibold">{w.name}</h2>
            {w.description && (
              <p className="text-sm text-gray-600">{w.description}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>,
  ], [routines, workouts]);

  // --- Render ---
  return (
    <>
      {/* 탭 버튼 내비게이션 */}
      <nav className="flex justify-between items-center mb-4">
        <ul className="flex gap-4">
          {(["routines", "workouts"] as Tab[]).map((t) => (
            <li key={t}>
              <button
                onClick={() => setTab(t)} // 탭 클릭 시 `tab` 상태를 업데이트합니다.
                className={`pb-1 ${
                  tab === t
                    ? "border-b-2 border-blue-500 text-blue-500" // 활성화된 탭 스타일
                    : "border-b-2 border-transparent" // 비활성화된 탭 스타일
                }`}
              >
                {t === "routines" ? "내 루틴" : "내 운동"}
              </button>
            </li>
          ))}
        </ul>
        {/* 메뉴 버튼: 클릭 시 사이드바를 토글합니다. */}
        <Menu onClick={toggle} />
      </nav>

      {/* 탭에 맞춰 미리 생성된 SSR 마크업을 조건부로 표시/숨김 */}
      <section className="pt-4">
        <div className={tab === "routines" ? "" : "hidden"}> {/* '내 루틴' 탭 내용 */}
          {listElements[0]}
        </div>
        <div className={tab === "workouts" ? "" : "hidden"}> {/* '내 운동' 탭 내용 */}
          {listElements[1]}
        </div>
      </section>

      {/* 새로운 루틴 또는 운동 추가 버튼 */}
      <div className="fixed bottom-10 right-5">
        <Link
          href={tab === "routines" ? "/add-routine" : "/add-workout"} // 현재 탭에 따라 이동할 경로를 결정합니다.
          className="flex justify-center items-center w-12 h-12 bg-amber-500 rounded-full"
        >
          <span className="material-icons text-white text-3xl">add</span>
        </Link>
      </div>
    </>
  );
}