"use client";

import { useParams, useRouter } from "next/navigation"; 
import { useEffect, useState } from "react"; 
import { useGetRoutine } from "@/app/hooks/routine/useGetRoutine"; 
import { useGetRoutineItems } from "@/app/hooks/routine/useGetRoutineItems"; 
import { useSessionStore, LocalSession, LocalStep } from "@/store/sessionStore"; // Zustand로 구현된 세션 상태 관리 스토어
import { useCommitSession } from "@/app/hooks/session/useCommitSession"; // 세션 기록을 서버에 저장(commit)하는 커스텀 훅
import { poster } from "@/lib/fetcher"; // 서버에 POST 요청을 보내는 유틸리티 함수

// 페이지 컴포넌트 정의
export default function RoutineSessionPage() {
  
  // URL 경로에서 동적 파라미터(id, sessionId)를 추출합니다. 예: /routine/abc/session/xyz -> id: "abc", sessionId: "xyz"
  const { id, sessionId } = useParams();
  const router = useRouter(); 

  const routineId = typeof id === "string" ? id : "";
  const sid = typeof sessionId === "string" ? sessionId : "";

  const { routine } = useGetRoutine(routineId); 
  const { routineItems, isLoading } = useGetRoutineItems(routineId); // 운동 목록, 세트/횟수 등

  // Zustand 스토어에서 세션 관련 상태와 함수들을 가져옵니다.
  const { sessions, createSession, getSession, completeCurrentSet, skipCurrentSet, finishSession, removeSession, updateDraft } =
    useSessionStore();
  // 현재 세션 ID(sid)에 해당하는 세션 정보를 스토어에서 가져옵니다.
  const session = getSession(sid);

  // 세션 초기화 로직
  useEffect(() => {
    // 만약 세션이 이미 존재하거나, 루틴 데이터가 아직 로드되지 않았다면 아무것도 하지 않습니다.
    if (session || !routine || !routineItems || !sid || !routineId) return;

    // 루틴 정보를 바탕으로 세션의 각 단계(steps)를 구성합니다.
    const steps: LocalStep[] = routineItems
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // 루틴에 설정된 순서대로 정렬
      .map((it) => ({
        routineItemId: it.id,
        workoutId: it.workoutId,
        name: it.workout?.name, // 운동 이름
        target: { // 목표치
          sets: it.sets ?? 1,
          reps: it.reps,
          weight: it.weight,
          timeSec: it.timeSec,
          restSec: it.restSec,
        },
        currentSet: 0, // 현재 진행 중인 세트 인덱스
        performed: [], // 실제 수행한 세트 기록을 저장할 배열
        // 각 세트의 수정 가능한 초안(draft) 데이터. 사용자가 UI에서 횟수/무게를 바꾸면 여기에 반영됩니다.
        drafts: Array.from({ length: Math.max(1, it.sets ?? 1) }, (_, idx) => ({
          setIndex: idx,
          reps: it.reps,
          weight: it.weight,
          timeSec: it.timeSec,
          restSec: it.restSec,
        })),
      }));

    // 새로운 세션 객체를 생성합니다.
    const newSession: LocalSession = {
      id: sid, // 세션 고유 ID
      routineId,
      startedAt: new Date().toISOString(), // 시작 시간
      status: "active", // 상태: 진행중
      stepIndex: 0, // 현재 몇 번째 운동인지 가리키는 인덱스
      steps, // 위에서 생성한 운동 단계 목록
    };
    // 생성된 세션 객체를 Zustand 스토어에 저장합니다.
    createSession(newSession);
  }, [session, routine, routineItems, sid, routineId, createSession]); // 의존성 배열: 이 값들이 변경될 때만 useEffect가 다시 실행됩니다.

  // 3. 현재 상태 계산 및 렌더링 준비
  // ----------------------------------------------------

  // 현재 진행 중인 운동(step)과 관련된 정보를 계산합니다.
  const current = session?.steps[session?.stepIndex ?? 0]; // 현재 운동
  const setsTotal = current?.target.sets ?? 0; // 현재 운동의 총 세트 수
  const setsDone = current?.performed.length ?? 0; // 현재 운동에서 완료한 세트 수

  // 서버에 최종 기록을 저장하기 위한 훅과 상태
  const { commit, isCommitting } = useCommitSession(); // `commit` 함수와 로딩 상태
  const [commitError, setCommitError] = useState<string | null>(null); // 저장 중 에러 상태

  // 4. 이벤트 핸들러 (사용자 액션 처리)
  // ----------------------------------------------------

  // '운동 완료 및 저장' 버튼을 눌렀을 때 실행되는 함수
  async function handleFinish() {
    if (!session) return;
    try {
      // 1) 'record' 생성: 운동 세션 전체에 대한 기록(언제 시작해서 언제 끝났는지 등)을 서버에 저장
      const record = await commit({
        routineId: session.routineId,
        startAt: session.startedAt,
        endAt: new Date().toISOString(),
        status: "completed",
      });

      // 2) 'recordItem' 생성: 각 세트별 실제 수행 기록을 서버에 하나씩 저장
      for (const step of session.steps) {
        for (const perf of step.performed) {
          const payload: any = {
            recordId: record.id, // 위에서 생성된 record의 ID
            routineItemId: step.routineItemId,
            setIndex: perf.setIndex,
            reps: perf.reps,
            weight: perf.weight,
            timeSec: perf.timeSec,
            restSec: perf.restSec,
            skipped: !!perf.skipped, // 건너뛰기 여부
          };
          await poster("/recordItems", { arg: payload }); // 서버에 POST 요청
        }
      }

      // 3) 로컬 상태 정리 및 페이지 이동
      finishSession(session.id); // Zustand 스토어에서 세션 상태를 '완료'로 변경
      removeSession(session.id); // 스토어에서 세션 정보 제거 (선택적)
      router.push(`/routine/${routineId}`); // 운동이 끝났으므로 루틴 상세 페이지로 이동
    } catch (e: any) {
      setCommitError(e?.message ?? String(e)); // 에러 발생 시 메시지 표시
    }
  }

  // 5. UI 렌더링
  // ----------------------------------------------------

  // 데이터 로딩 중이거나 세션이 아직 준비되지 않았으면 로딩 메시지를 표시합니다.
  if (isLoading || !session || !current) {
    return <div className="p-4">세션 준비 중...</div>;
  }

  // 현재 몇 번째 운동인지 표시하기 위한 값
  const allExercises = session.steps.length;
  const curIdx = session.stepIndex + 1;

  return (
    <div className="p-4 space-y-4">
      {/* 페이지 상단: 제목 및 진행 상황 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">운동 진행</h1>
        <div className="text-sm text-gray-500">
          {curIdx} / {allExercises} {/* 예: 1 / 5 */}
        </div>
      </div>

      {/* 현재 운동 카드 */}
      <div className="p-4 rounded border">
        <p className="text-lg font-semibold">{current.name ?? "운동"}</p>
        <p className="text-sm text-gray-600">세트: {setsDone} / {setsTotal}</p>

        {/* 세트 목록 */}
        <div className="mt-3 space-y-3">
          {/* 총 세트 수만큼 반복하여 각 세트의 UI를 렌더링 */}
          {Array.from({ length: setsTotal }).map((_, idx) => {
            const disabled = idx < setsDone; // 이미 완료된 세트인가?
            const isCurrent = idx === setsDone; // 지금 해야 할 세트인가?
            const d = (current as any).drafts?.[idx] ?? { setIndex: idx }; // 해당 세트의 초안 데이터 (횟수, 무게 등)

            return (
              <div key={idx} className={`p-3 rounded border ${isCurrent ? "border-blue-400 bg-blue-50" : disabled ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">세트 {idx + 1}</span>
                  {disabled && <span className="text-xs text-green-600">완료</span>}
                  {isCurrent && !disabled && <span className="text-xs text-blue-600">진행중</span>}
                </div>
                {/* 횟수, 무게, 시간 입력 필드 */}
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-xs text-gray-600">
                    횟수
                    <input type="number" className="mt-1 w-full border rounded p-2 text-sm" value={d.reps ?? ""} disabled={disabled}
                      // 입력값이 변경되면 Zustand 스토어의 draft 값을 업데이트
                      onChange={(e) => updateDraft(session.id, idx, { reps: e.target.value === "" ? undefined : Number(e.target.value) })}
                    />
                  </label>
                  <label className="text-xs text-gray-600">
                    무게(kg)
                    <input type="number" className="mt-1 w-full border rounded p-2 text-sm" value={d.weight ?? ""} disabled={disabled}
                      onChange={(e) => updateDraft(session.id, idx, { weight: e.target.value === "" ? undefined : Number(e.target.value) })}
                    />
                  </label>
                  <label className="text-xs text-gray-600">
                    시간(초)
                    <input type="number" className="mt-1 w-full border rounded p-2 text-sm" value={d.timeSec ?? ""} disabled={disabled}
                      onChange={(e) => updateDraft(session.id, idx, { timeSec: e.target.value === "" ? undefined : Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* 세트 완료/건너뛰기 버튼 */}
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => completeCurrentSet(session.id)}>
            현재 세트 완료
          </button>
          <button className="px-4 py-2 rounded bg-gray-200" onClick={() => skipCurrentSet(session.id)}>
            현재 세트 건너뛰기
          </button>
        </div>
      </div>

      {/* 하단 버튼: 뒤로가기, 운동 완료 */}
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 rounded" onClick={() => router.back()}>뒤로</button>
        <button
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60"
          disabled={isCommitting} // 서버에 저장 중일 때는 비활성화
          onClick={handleFinish}
        >
          {isCommitting ? "저장 중..." : "운동 완료 및 저장"}
        </button>
      </div>

      {/* 에러 메시지 표시 */}
      {commitError && <p className="text-red-500 text-sm">{commitError}</p>}
    </div>
  );
}