"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// 운동 설정 모드 (기존과 동일)
export type WorkoutMode =
  | "strength" // 세트x횟수x무게
  | "repOnly" // 세트x횟수
  | "duration" // 세트x시간
  | "unset"; // 미설정

/** 루틴에 들어가는 개별 항목 (기존과 동일) */
export type RoutineItem = {
  tempId: string;
  workoutId: string;
  name: string;
  mode: WorkoutMode;
  config: {
    sets?: number;
    reps?: number;
    weight?: number;
    restSec?: number;
    timeSec?: number;
  };
  notes?: string;
};

// ✅ State 타입을 확장합니다.
type State = {
  name: string;
  items: RoutineItem[]; // 선택된 운동 목록을 저장할 배열
  setName: (v: string) => void;
  // ✅ 운동을 추가/제거하는 토글 액션
  toggleWorkout: (workout: { workoutId: string; name: string }) => void;
  // ✅ 특정 아이템의 설정을 변경하는 액션 (추후 사용)
  updateItemConfig: (tempId: string, newConfig: RoutineItem['config']) => void;
  // ✅ 전체 루틴을 초기화하는 액션
  clearRoutine: () => void;
};

const initialState = {
  name: "",
  items: [],
};

export const useRoutineBuilder = create<State>()(
  persist(
    (set) => ({
      ...initialState,
      setName: (v) => set({ name: v }),

      // ✅ toggleWorkout 액션 구현
      toggleWorkout: (workout) =>
        set((state) => {
          const isAlreadyIn = state.items.some(
            (item) => item.workoutId === workout.workoutId
          );

          if (isAlreadyIn) {
            // 이미 목록에 있으면 -> 제거
            return {
              items: state.items.filter(
                (item) => item.workoutId !== workout.workoutId
              ),
            };
          } else {
            // 목록에 없으면 -> 기본값을 가진 RoutineItem 형태로 추가
            const newItem: RoutineItem = {
              tempId: `temp_${Date.now()}`, // 고유한 임시 ID 생성
              workoutId: workout.workoutId,
              name: workout.name,
              mode: "unset", // 기본 모드
              config: { // 기본 설정
                sets: 3,
                reps: 10,
                restSec: 60,
              },
            };
            return { items: [...state.items, newItem] };
          }
        }),
      
      // ✅ updateItemConfig 액션 구현
      updateItemConfig: (tempId, newConfig) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.tempId === tempId ? { ...item, config: newConfig } : item
          ),
        })),
        
      // ✅ clearRoutine 액션 구현
      clearRoutine: () => set(initialState),
    }),
    { name: "erona:routine-builder", version: 1 }
  )
);