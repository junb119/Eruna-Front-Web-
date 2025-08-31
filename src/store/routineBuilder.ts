// "use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** 운동 설정 모드 — mock의 workoutTypes.unit_primary와 1:1 매핑 */
export type WorkoutMode = "strength" | "repOnly" | "duration" | "unset";

/** 루틴 아이템(저장 형태) */
export type RoutineItem = {
  tempId: string;
  // 기본 운동 정보
  workoutId: string;
  name: string;

  // 🔽 운동과 직접적으로 연결된 메타(필수만)
  categoryId?: string;
  categoryName?: string;
  typeId?: string;
  typeName?: string;

  // 타입에서 온 단위에 따라 모드 자동 결정
  mode: WorkoutMode;

  // 기본 설정(모드는 타입에서 유도)
  config: {
    sets?: number;
    reps?: number;
    weight?: number;
    restSec?: number;
    timeSec?: number;
  };
  notes?: string;
};

/** add 시에 받는 페이로드 */
type AddWorkoutPayload = {
  workoutId: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  typeId?: string;
  typeName?: string;
  /** mock의 workoutTypes.unit_primary 값 그대로 전달 (strength/repOnly/duration) */
  typeUnitPrimary?: WorkoutMode; // ← 중요: mode 유도에 사용

  /** 필요시 즉시 오버라이드도 허용 */
  mode?: WorkoutMode;
  config?: RoutineItem["config"];
};

type State = {
  name: string;
  items: RoutineItem[];
  setName: (v: string) => void;

  addWorkout: (payload: AddWorkoutPayload) => void;
  removeWorkout: (workoutId: string) => void;

  /** 하위 호환(있으면 유지) */
  toggleWorkout: (workout: { workoutId: string; name: string }) => void;

  updateItemConfig: (tempId: string, newConfig: RoutineItem["config"]) => void;
  clearRoutine: () => void;
};

/** unit_primary → WorkoutMode 매핑 (안 들어오면 unset) */
function modeFromUnitPrimary(u?: WorkoutMode): WorkoutMode {
  if (u === "strength" || u === "repOnly" || u === "duration") return u;
  return "unset";
}

function defaultConfigFor(mode: WorkoutMode): RoutineItem["config"] {
  switch (mode) {
    case "strength":
      return { sets: 3, reps: 10, weight: 10, restSec: 60 };
    case "repOnly":
      return { sets: 3, reps: 10, restSec: 60 };
    case "duration":
      return { sets: 1, timeSec: 60, restSec: 60 }; // 10분
    default:
      return { sets: 3, reps: 10, restSec: 60 };
  }
}

export const useRoutineBuilder = create<State>()(
  persist(
    (set, get) => ({
      name: "",
      items: [],
      setName: (v) => set({ name: v }),

      addWorkout: (p) => {
        const { items } = get();
        if (items.some((i) => i.workoutId === p.workoutId)) return;

        // 1) 우선순위: 명시된 mode → 없으면 typeUnitPrimary에서 유도
        const mode = p.mode ?? modeFromUnitPrimary(p.typeUnitPrimary);
        // 2) config 기본값
        const config = p.config ?? defaultConfigFor(mode);

        const newItem: RoutineItem = {
          tempId: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          workoutId: p.workoutId,
          name: p.name,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          typeId: p.typeId,
          typeName: p.typeName,
          mode,
          config,
        };

        set({ items: [...items, newItem] });
      },

      removeWorkout: (workoutId) =>
        set((s) => ({ items: s.items.filter((i) => i.workoutId !== workoutId) })),

      // 하위 호환 — 최소 정보만으로 add/remove
      toggleWorkout: ({ workoutId, name }) => {
        const { items, addWorkout, removeWorkout } = get();
        if (items.some((i) => i.workoutId === workoutId)) removeWorkout(workoutId);
        else addWorkout({ workoutId, name });
      },

      updateItemConfig: (tempId, newConfig) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.tempId === tempId ? { ...i, config: { ...i.config, ...newConfig } } : i
          ),
        })),

      clearRoutine: () => set({ name: "", items: [] }),
    }),
    { name: "erona:routine-builder", version: 3 }
  )
);
