// src/app/head.tsx
export default function Head() {
  return (
    <>
      {" "}
      <title>🛠 Erona Debug</title>
      <meta name="debug" content="head-loaded" />
      {/* 프리커넥트 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* 기본 아이콘 (Filled) */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
    </>
  );
}
