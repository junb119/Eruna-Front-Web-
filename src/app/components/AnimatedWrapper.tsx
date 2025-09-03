"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * @description Next.js의 페이지 전환 시 부드러운 애니메이션을 제공하는 래퍼 컴포넌트입니다.
 *              `framer-motion` 라이브러리의 `AnimatePresence`와 `motion.div`를 활용합니다.
 *              특정 경로 그룹에 대해 동일한 전환 키를 사용하여 오버레이(Parallel Routes)와 같은 
 *              부분적인 UI 변경 시에도 자연스러운 애니메이션을 유지합니다.
 * @param {ReactNode} children - 애니메이션을 적용할 자식 컴포넌트들.
 */

/**
 * @description 현재 경로(pathname)에 따라 페이지 전환 애니메이션의 그룹 키를 결정하는 함수입니다.
 *              동일한 키를 반환하는 경로는 같은 애니메이션 그룹으로 처리되어 부드러운 전환을 만듭니다.
 * @param {string} path - 현재 페이지의 경로 (예: /add-routine/select).
 * @returns {string} 해당 경로에 대한 전환 그룹 키.
 */
function transitionKey(path: string) {
  // `add-routine` 섹션의 모든 하위 경로(예: /add-routine/select, /add-routine/setup/123)는
  // `/add-routine`이라는 동일한 키를 사용하여, 해당 섹션 내에서의 전환 시에는
  // 전체 페이지가 아닌 오버레이 부분만 애니메이션이 적용되도록 합니다.
  if (path === "/add-routine" || path.startsWith("/add-routine/")) {
    return "/add-routine";
  }
  // 필요에 따라 다른 섹션에 대한 전환 키 규칙을 추가할 수 있습니다.
  // if (path.startsWith("/profile")) return "/profile";

  // 기본적으로는 현재 경로 자체를 키로 사용하여, 각 페이지마다 독립적인 애니메이션을 적용합니다.
  return path;
}


export default function AnimatedWrapper({ children }: { children: ReactNode }) {
  // --- Hooks ---
  /** @description 현재 페이지의 경로를 가져옵니다. */
  const path = usePathname();
  /** @description `transitionKey` 함수를 사용하여 현재 경로에 대한 애니메이션 그룹 키를 결정합니다. */
  const key = transitionKey(path);

  // --- Render ---
  return (
    // `AnimatePresence`는 자식 컴포넌트가 마운트되거나 언마운트될 때 애니메이션을 적용할 수 있도록 합니다.
    // `mode="wait"`는 이전 컴포넌트의 exit 애니메이션이 끝난 후 새 컴포넌트의 enter 애니메이션을 시작하도록 합니다.
    <AnimatePresence mode="wait">
      <motion.div
        key={key} // `key`가 변경될 때마다 `motion.div`는 새로운 컴포넌트로 간주되어 애니메이션이 트리거됩니다.
        initial={{ opacity: 0, y: 20 }} // 컴포넌트가 처음 마운트될 때의 초기 스타일입니다.
        animate={{ opacity: 1, y: 0 }}  // 컴포넌트가 마운트된 후 적용될 최종 스타일입니다.
        // exit={{ opacity: 0, y: -20 }} // 컴포넌트가 언마운트될 때 적용될 스타일입니다. (현재는 주석 처리되어 비활성화)
        transition={{ duration: 0.2 }} // 애니메이션 전환에 걸리는 시간입니다.
        className="w-full h-full" // 래퍼 div가 전체 너비와 높이를 차지하도록 합니다.
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}