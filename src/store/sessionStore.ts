"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SessionStatus = "active" | "paused" | "completed" | "aborted";

export type LocalSetRecord = {
  setIndex: number;
  reps?: number;
  weight?: number;
  timeSec?: number;
  restSec?: number;
  startedAt?: string;
  endedAt?: string;
  skipped?: boolean;
};

export type LocalStep = {
  routineItemId: string; // server routineItems.id
  workoutId: string;
  name?: string;
  target: {
    sets?: number;
    reps?: number;
    weight?: number;
    timeSec?: number;
    restSec?: number;
  };
  // --- 운동 세션의 핵심 상태 --- 
  // 현재 운동(Step) 내에서 몇 번째 세트를 수행할 차례인지를 가리키는 0-based 인덱스.
  // '세트 완료' 또는 '건너뛰기' 시 1씩 증가하며, 마지막 세트에서는 더 이상 증가하지 않습니다.
  currentSet: number; // 0-based

  // 사용자가 '완료' 또는 '건너뛰기'한 세트들의 '실제 수행 기록'을 저장하는 배열입니다.
  // 이 배열에 쌓인 데이터가 최종적으로 서버에 저장될 운동 기록이 됩니다.
  performed: LocalSetRecord[]; // completed or skipped sets

  // 각 세트의 '계획' 또는 '초안(draft)' 값을 담는 배열입니다. UI에 표시되는 인풋(무게, 횟수)과 직접 연결됩니다.
  // 사용자가 인풋 값을 수정하면 이 배열의 내용이 변경되고, '세트 완료' 시 이 초안 값이 `performed` 배열에 기록됩니다.
  // 배열의 길이는 해당 운동의 총 세트 수(`target.sets`)와 같습니다.
  drafts: LocalSetRecord[]; // editable planned values per set (length = target.sets)
};

export type LocalSession = {
  id: string; // sessionId (uuid)
  routineId: string;
  startedAt: string;
  endedAt?: string;
  status: SessionStatus;
  stepIndex: number; // 0-based step (exercise)
  steps: LocalStep[];
};

type SessionState = {
  sessions: Record<string, LocalSession>;
  createSession: (s: LocalSession) => void;
  getSession: (id: string) => LocalSession | undefined;
  updateSession: (id: string, updater: (s: LocalSession) => LocalSession) => void;
  finishSession: (id: string) => void;
  removeSession: (id: string) => void;
  // helpers
  completeCurrentSet: (id: string) => void;
  skipCurrentSet: (id: string) => void;
  nextExerciseIfDone: (id: string) => void;
  updateDraft: (
    id: string,
    setIndex: number,
    patch: Partial<Omit<LocalSetRecord, "setIndex">>
  ) => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: {},
      createSession: (s) =>
        set((state) => ({ sessions: { ...state.sessions, [s.id]: s } })),
      getSession: (id) => get().sessions[id],
      updateSession: (id, updater) =>
        set((state) => {
          const cur = state.sessions[id];
          if (!cur) return state;
          const next = updater(cur);
          return { sessions: { ...state.sessions, [id]: next } };
        }),
      finishSession: (id) =>
        set((state) => {
          const cur = state.sessions[id];
          if (!cur) return state;
          const next: LocalSession = {
            ...cur,
            status: "completed",
            endedAt: new Date().toISOString(),
          };
          return { sessions: { ...state.sessions, [id]: next } };
        }),
      removeSession: (id) =>
        set((state) => {
          const { [id]: _omit, ...rest } = state.sessions;
          return { sessions: rest } as any;
        }),
      completeCurrentSet: (id) => {
        const cur = get().sessions[id];
        if (!cur) return;
        const step = cur.steps[cur.stepIndex];
        if (!step) return;
        const draft = step.drafts[step.currentSet] || {};
        const nextPerformed: LocalSetRecord[] = [
          ...step.performed,
          {
            setIndex: step.currentSet,
            reps: draft.reps ?? step.target.reps,
            weight: draft.weight ?? step.target.weight,
            timeSec: draft.timeSec ?? step.target.timeSec,
            restSec: draft.restSec ?? step.target.restSec,
            endedAt: new Date().toISOString(),
          },
        ];
        const setsTotal = step.target.sets ?? 1;
        const hasMoreSets = step.currentSet + 1 < setsTotal;
        const nextStep: LocalStep = {
          ...step,
          currentSet: hasMoreSets ? step.currentSet + 1 : step.currentSet,
          performed: nextPerformed,
        };
        const steps = [...cur.steps];
        steps[cur.stepIndex] = nextStep;
        let stepIndex = cur.stepIndex;
        if (!hasMoreSets) {
          // auto move to next exercise when sets are completed
          stepIndex = Math.min(cur.stepIndex + 1, steps.length - 1);
        }
        get().updateSession(id, () => ({ ...cur, steps, stepIndex }));
      },
      skipCurrentSet: (id) => {
        const cur = get().sessions[id];
        if (!cur) return;
        const step = cur.steps[cur.stepIndex];
        if (!step) return;
        const nextPerformed: LocalSetRecord[] = [
          ...step.performed,
          { setIndex: step.currentSet, skipped: true, endedAt: new Date().toISOString() },
        ];
        const setsTotal = step.target.sets ?? 1;
        const hasMoreSets = step.currentSet + 1 < setsTotal;
        const nextStep: LocalStep = {
          ...step,
          currentSet: hasMoreSets ? step.currentSet + 1 : step.currentSet,
          performed: nextPerformed,
        };
        const steps = [...cur.steps];
        steps[cur.stepIndex] = nextStep;
        let stepIndex = cur.stepIndex;
        if (!hasMoreSets) stepIndex = Math.min(cur.stepIndex + 1, steps.length - 1);
        get().updateSession(id, () => ({ ...cur, steps, stepIndex }));
      },
      nextExerciseIfDone: (id) => {
        const cur = get().sessions[id];
        if (!cur) return;
        const step = cur.steps[cur.stepIndex];
        const setsTotal = step?.target.sets ?? 1;
        if (!step) return;
        const done = step.performed.length >= setsTotal;
        if (done) {
          const stepIndex = Math.min(cur.stepIndex + 1, cur.steps.length - 1);
          get().updateSession(id, () => ({ ...cur, stepIndex }));
        }
      },
      updateDraft: (id, setIndex, patch) => {
        const cur = get().sessions[id];
        if (!cur) return;
        const step = cur.steps[cur.stepIndex];
        if (!step) return;
        const drafts = [...(step.drafts || [])];
        const prev = drafts[setIndex] || { setIndex };
        drafts[setIndex] = { ...prev, setIndex, ...patch } as LocalSetRecord;
        const steps = [...cur.steps];
        steps[cur.stepIndex] = { ...step, drafts };
        get().updateSession(id, () => ({ ...cur, steps }));
      },
    }),
    { name: "eruna:sessions", version: 1 }
  )
);
