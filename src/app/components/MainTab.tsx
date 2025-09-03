"use client";
import React from "react";
import { useState } from "react";

/**
 * @description 탭의 종류를 정의하는 타입입니다. 'routines' 또는 'workouts'가 될 수 있습니다.
 */
type Tab = "routines" | "workouts";

/**
 * @description 메인 페이지에서 '내 루틴'과 '내 운동' 탭을 전환하는 UI 컴포넌트입니다.
 *              현재 활성화된 탭을 시각적으로 표시합니다.
 * @deprecated `ClientTabs.tsx` 컴포넌트로 대체되었습니다. 이 컴포넌트는 더 이상 사용되지 않습니다.
 */
const MainTab = () => {
  // --- State ---
  /** @description 현재 활성화된 탭을 관리하는 상태입니다. 기본값은 'routines'입니다. */
  const [activeTab, setActiveTab] = useState<Tab>("routines");
  
  // --- Render ---
  return (
    <ul className="flex gap-4 items-center">
      <li>
        <button
          onClick={() => setActiveTab("routines")} // '내 루틴' 탭 클릭 시 활성화
          className={`${
            activeTab === "routines"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "border-b-2 border-transparent"
          }`} // 활성화된 탭에 밑줄과 파란색 텍스트 스타일 적용
        >
          내 루틴
        </button>
      </li>
      <li>
        <button 
          onClick={() => setActiveTab("workouts")} // '내 운동' 탭 클릭 시 활성화
          className={`${
            activeTab === "workouts"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "border-b-2 border-transparent"
          }`} // 활성화된 탭에 밑줄과 파란색 텍스트 스타일 적용
        >
          내 운동
        </button>
      </li>
    </ul>
  );
};

export default MainTab;