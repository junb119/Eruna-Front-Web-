// src/app/components/ClientTabs.tsx
"use client";

import { useState, ReactNode, Children } from "react";
import Link from "next/link";

type Tab = "routines" | "workouts";
interface Routine {
  id: string;
  name: string;
  description?: string;
}
interface Workout {
  id: string;
  name: string;
  description?: string;
}

export default function ClientTabs({
  routines,
  workouts,
}: {
  routines: Routine[];
  workouts: Workout[];
}) {
  const [tab, setTab] = useState<Tab>("routines");

  // 두 리스트를 미리 SSR 마크업으로 생성해 두고
  const listElements = [
    <ul key="r" className="space-y-2">
      {routines.map((r) => (
        <li key={r.id} className="p-3 border rounded">
          <h2 className="font-semibold">{r.name}</h2>
          {r.description && (
            <p className="text-sm text-gray-600">{r.description}</p>
          )}
        </li>
      ))}
    </ul>,
    <ul key="w" className="space-y-2">
      {workouts.map((w) => (
        <li key={w.id} className="p-3 border rounded">
          <h2 className="font-semibold">{w.name}</h2>
          {w.description && (
            <p className="text-sm text-gray-600">{w.description}</p>
          )}
        </li>
      ))}
    </ul>,
  ];

  return (
    <>
      {/* 탭 버튼 */}
      <nav className="flex justify-between items-center mb-4">
        <ul className="flex gap-4">
          {(["routines", "workouts"] as Tab[]).map((t) => (
            <li key={t}>
              <button
                onClick={() => setTab(t)}
                className={`pb-1 ${
                  tab === t
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "border-b-2 border-transparent"
                }`}
              >
                {t === "routines" ? "내 루틴" : "내 운동"}
              </button>
            </li>
          ))}
        </ul>
        <span className="material-icons !text-4xl">menu</span>
      </nav>

      {/* 탭에 맞춰 미리 만든 SSR 마크업을 show/hide */}
      <section className="pt-4">
        <div className={tab === "routines" ? "" : "hidden"}>
          {listElements[0]}
        </div>
        <div className={tab === "workouts" ? "" : "hidden"}>
          {listElements[1]}
        </div>
      </section>

      {/* + 버튼 */}
      <div className="fixed bottom-10 right-5">
        <Link
          href={tab === "routines" ? "/add-routine" : "/add-workout"}
          className="flex justify-center items-center w-12 h-12 bg-amber-500 rounded-full"
        >
          <span className="material-icons text-white text-3xl">add</span>
        </Link>
      </div>
    </>
  );
}
