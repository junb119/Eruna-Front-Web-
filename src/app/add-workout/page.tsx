// src/app/add-workout/page.tsx

import AddWorkoutForm from "../components/AddWorkoutForm";

export const metadata = {
  title: "운동 추가",
};

export default function AddWorkoutPage() {
  return (
    <main className="w-full h-full p-2">
      <h1 className="text-xl font-bold mb-4">새 운동 추가</h1>
      {/* 클라이언트 컴포넌트로 분리된 폼 */}
      <AddWorkoutForm />
    </main>
  );
}
