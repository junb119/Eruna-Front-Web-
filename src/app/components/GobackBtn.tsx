"use client";

import { useRouter } from "next/navigation";
import React from "react";

/**
 * @description 이전 페이지로 돌아가는 기능을 제공하는 버튼 컴포넌트입니다.
 *              `next/navigation`의 `useRouter` 훅을 사용하여 `router.back()`을 호출합니다.
 */
const GobackBtn = () => {
  // --- Hooks ---
  /** @description Next.js 라우터 객체를 가져옵니다. */
  const router = useRouter();

  // --- Render ---
  return (
    <button
      onClick={() => router.back()} // 버튼 클릭 시 이전 페이지로 이동합니다.
      className="text-sm text-blue-500 underline" // Tailwind CSS를 사용한 스타일링
    >
      &larr; 뒤로가기
    </button>
  );
};

export default GobackBtn;