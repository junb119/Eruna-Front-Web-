"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import "./globals.css"; // ← 이 줄이 반드시 맨 위에 있어야 Tailwind가 로드됩니다

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();

  return (
    <html lang="ko">
      <head>
        <title>이러나</title>
      </head>
      <body>
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-scrren border h-screen bg-red-500"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </body>
    </html>
  );
}
