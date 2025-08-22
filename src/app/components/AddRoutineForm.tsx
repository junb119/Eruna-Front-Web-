// components/AddRoutineForm.tsx
"use client";

import { useRoutineBuilder } from "@/store/routineBuilder";
import { useRouter } from "next/navigation";
import GobackBtn from "./GobackBtn";

const AddRoutineForm = () => {
  const router = useRouter();
  const { name, setName, items, clearRoutine } = useRoutineBuilder();
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">새 루틴 추가</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="">루틴이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="예: 등 운동 루틴"
            // disabled={loading}
          />
        </div>
        <div>
          <h2>운동</h2>
          <ul>
            {items.map((item) => (
              <li key={item.workoutId}>{item.workoutId}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => router.push("/add-routine/select")}
          >
            + 운동추가
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              clearRoutine();
              router.back();
            }}
          >
            취소
          </button>
          <button>저장</button>
        </div>
      </form>
    </div>
  );
};

export default AddRoutineForm;
