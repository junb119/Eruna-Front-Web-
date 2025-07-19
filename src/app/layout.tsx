import React from "react";
import "./globals.css";
import AnimatedWrapper from "./components/AnimatedWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <title>🛠 Erona Debug</title>
        <meta name="debug" content="head-loaded" />
        {/* 프리커넥트 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* 기본 아이콘 (Filled) */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        {/* Outlined 스타일 */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
        {/* Symbols: Outlined */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
        {/* 필요 시 더 추가 가능 */}
        {/* <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" rel="stylesheet"/> */}
      </head>
      <body>
        <div className="max-w-[375px] h-screen ">
          <AnimatedWrapper>{children}</AnimatedWrapper>
        </div>
      </body>
    </html>
  );
}
