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
      <AddRoutineForm />
      
    </main>
  );
}
