import React from "react";
import GobackBtn from "../components/GobackBtn";
import AddRoutineForm from "../components/AddRoutineForm";

export const metadata = {
  title: "루틴 추가",
};
export default function AddRoutinePage() {
  return (
    <main>
      <GobackBtn />
      <h1 className="text-xl font-bold mb-4">새 루틴 추가</h1>
      
      <AddRoutineForm />
      
    </main>
  );
}
