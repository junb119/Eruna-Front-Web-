"use client";
import { useSidebarStore } from "@/store/useSidebarStore";
import React from "react";

const SideBar = () => {
  const { isOpen, close } = useSidebarStore((state) => state);

  return (
    <div
      className={`absolute top-0 right-0 w-[45%] h-screen bg-emerald-400 transition duration-300
    ${isOpen ? "translate-x-0" : "translate-x-[100%]"}`}
    >
      <nav className="flex gap-4">
        <div className="flex">
          {/* <img src="" alt="사진" /> */}
          <span>이름</span>
        </div>
        <button onClick={close}>X</button>
      </nav>
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
