"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
// 경로 → 전환 그룹 키 매핑 규칙
function transitionKey(path: string) {
  // ✅ add-routine 섹션은 오버레이(/select, /setup/123)도 모두 같은 키
  if (path === "/add-routine" || path.startsWith("/add-routine/")) {
    return "/add-routine";
  }
  // 필요하면 다른 섹션도 추가하면 됨
  // if (path.startsWith("/profile")) return "/profile";

  return path; // 기본: 자기 자신을 키로
}


export default function AnimatedWrapper({ children }: { children: ReactNode }) {
  const path = usePathname();
  const key = transitionKey(path);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
