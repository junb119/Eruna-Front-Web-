"use client";
import { useSidebarStore } from "@/store/useSidebarStore";
import React from "react";

/**
 * @description 애플리케이션의 사이드바 메뉴 컴포넌트입니다.
 *              `useSidebarStore`를 사용하여 사이드바의 열림/닫힘 상태를 관리하고, 
 *              닫기 버튼을 통해 사이드바를 제어할 수 있습니다.
 */
const SideBar = () => {
  // --- Hooks ---
  /** @description Zustand 스토어에서 사이드바의 열림 상태(`isOpen`)와 닫기 함수(`close`)를 가져옵니다. */
  const { isOpen, close } = useSidebarStore((state) => state);

  // --- Render ---
  return (
    <div
      // `isOpen` 상태에 따라 CSS `translate-x` 속성을 변경하여 사이드바를 슬라이드 인/아웃 시킵니다.
      className={`absolute top-0 right-0 w-[45%] h-screen bg-emerald-400 transition duration-300
    ${isOpen ? "translate-x-0" : "translate-x-[100%]"}`}
    >
      <nav className="flex gap-4">
        {/* 사용자 프로필 정보 (현재는 플레이스홀더) */}
        <div className="flex">
          {/* <img src="" alt="사진" /> */}
          <span>이름</span>
        </div>
        {/* 사이드바 닫기 버튼 */}
        <button onClick={close} aria-label="사이드바 닫기">X</button>
      </nav>
      {/* 메뉴 목록 */}
      <div>
        <ul>
          <li>
            <span>아이콘</span>
            <span>모든 운동</span>
          </li>
          <li>
            <span>아이콘</span>
            <span>모든 루틴</span>
          </li>
          <li>
            <span>아이콘</span>
            <span>운동 기록</span>
          </li>
          <li>
            <span>아이콘</span>
            <span>설정</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;