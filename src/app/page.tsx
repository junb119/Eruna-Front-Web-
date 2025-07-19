// src/app/page.tsx

import ClientTabs from "./components/ClientTabs";

export default async function Home() {
  // 서버에서 두 리소스 병렬 패칭
  const [routinesRes, workoutsRes] = await Promise.all([
    fetch("http://localhost:4000/routine"),
    fetch("http://localhost:4000/workout"),
  ]);
  const [routines, workouts] = await Promise.all([
    routinesRes.json(),
    workoutsRes.json(),
  ]);

  return (
    <main className="w-full h-full p-2">
      {/* 
        SSR에서 이미 두 리스트의 마크업을 다 만들고 
        ClientTabs로 전달합니다. 
      */}
      <ClientTabs routines={routines} workouts={workouts} />
    </main>
  );
}
