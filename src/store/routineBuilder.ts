// src/store/routineBuilder.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  name: string;
  setName: (v: string) => void;
  // (선택) 선택된 운동들, 세트 설정 등도 여기로
};

export const useRoutineBuilder = create<State>()(
  persist(
    (set) => ({
      name: "",
      setName: (v) => set({ name: v }),
    }),
    { name: "erona:routine-builder", version: 1 }
  )
);
