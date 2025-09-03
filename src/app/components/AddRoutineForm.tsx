// components/AddRoutineForm.tsx
"use client";

import { poster } from "@/lib/fetcher";
import { useCreateRoutine } from "@/app/hooks/routine/useCreateRoutine";
import { useState, useMemo } from "react";
import { useRoutineBuilder } from "@/store/routineBuilder";
import { useRouter } from "next/navigation";

/**
 * @description 루틴에 추가될 개별 운동 아이템의 설정을 편집하는 인라인 컴포넌트입니다.
 *              운동 유형(mode)에 따라 다른 입력 필드를 표시합니다.
 * @param {object} item - 편집할 운동 아이템의 정보 (tempId, name, mode, config 등).
 * @param {function} onSave - 저장 버튼 클릭 시 호출되는 콜백 함수. 수정된 설정 값을 부모 컴포넌트로 전달합니다.
 * @param {function} onCancel - 취소 버튼 클릭 시 호출되는 콜백 함수.
 */
const RoutineItemEditor = ({
  item,
  onSave,
  onCancel,
}: {
  item: any; // TODO: 정확한 타입 정의 필요
  onSave: (tempId: string, newConfig: any) => void;
  onCancel: () => void;
}) => {
  // --- State ---
  /** @description 운동 아이템의 현재 설정 값(세트, 횟수, 무게 등)을 관리하는 로컬 상태입니다. */
  const [config, setConfig] = useState(item.config);
  /** @description 휴식 시간 설정 활성화 여부를 관리하는 상태입니다. */
  const [isRestEnabled, setIsRestEnabled] = useState(
    item.config.restSec != null
  );

  // --- Handlers ---
  /** @description 입력 필드의 값이 변경될 때 호출되어 `config` 상태를 업데이트합니다. */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // 사용자가 값을 지울 수 있도록 빈 문자열도 허용하며, 숫자로 변환합니다.
    const numericValue = value === "" ? "" : Number(value);
    setConfig((prev: any) => ({ ...prev, [name]: numericValue }));
  };

  /** @description 휴식 시간 설정 체크박스 토글 시 호출됩니다. */
  const handleRestToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsRestEnabled(checked);
    if (!checked) {
      // 휴식 시간 설정 비활성화 시, `config`에서 `restSec` 필드를 제거합니다.
      const { restSec, ...newConfig } = config;
      setConfig(newConfig);
    } else if (config.restSec === undefined) {
      // 휴식 시간 설정 활성화 시, `restSec`에 기본값(60초)을 설정합니다.
      setConfig((prev) => ({ ...prev, restSec: 60 }));
    }
  };

  /** 
   * @description 저장 버튼 클릭 시 호출됩니다. 
   * 현재 `config` 상태에서 유효한(빈 문자열이나 숫자가 아닌 값이 아닌) 숫자 값만 추출하여 `onSave` 콜백을 통해 부모 컴포넌트로 전달합니다.
   */
  const handleSaveClick = () => {
    // 저장 시 빈 문자열 값은 제외하고 숫자만 저장합니다.
    const finalConfig = Object.entries(config).reduce((acc, [key, value]) => {
      if (value !== "" && !isNaN(Number(value))) {
        (acc as any)[key] = Number(value);
      }
      return acc;
    }, {} as any);
    onSave(item.tempId, finalConfig);
  };

  // --- Memoized Values ---
  /**
   * @description 운동 유형(`item.mode`)에 따라 렌더링할 입력 필드를 결정합니다.
   * `commonFields`는 모든 운동 유형에 공통으로 적용되는 필드(예: 세트)를 정의하고,
   * `modeFields`는 각 운동 유형에 특화된 필드(예: 횟수, 무게, 시간)를 정의합니다.
   */
  const commonFields = {
    sets: { label: "세트", unit: "" },
  };

  const modeFields: Record<string, any> = {
    strength: { // 근력 운동: 횟수, 무게
      reps: { label: "횟수", unit: "회" },
      weight: { label: "무게", unit: "kg" },
    },
    repOnly: { reps: { label: "횟수", unit: "회" } }, // 횟수만: 횟수
    duration: { timeSec: { label: "시간", unit: "초" } }, // 시간: 시간
  };

  // `item.mode`에 해당하는 필드와 공통 필드를 병합하여 최종 렌더링 필드를 결정합니다.
  const fieldsToRender = { ...commonFields, ...(modeFields[item.mode] || {}) };

  // --- Render ---
  return (
    <div className="p-2 bg-gray-50 rounded-md">
      <p className="font-semibold mb-3 text-blue-600">{item.name}</p>
      <div className="flex flex-col gap-y-3">
        {/* `fieldsToRender`에 정의된 필드들을 순회하며 입력 필드를 렌더링합니다. */}
        {Object.entries(fieldsToRender).map(
          ([key, { label, unit }]: [string, any]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500">
                {label} ({unit || " "})
              </label>
              <input
                type="number"
                name={key}
                value={config[key] ?? ""}
                onChange={handleChange}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
          )
        )}
        {/* 휴식 시간 설정 토글 및 입력 필드 */}
        <div className="pt-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isRestEnabled}
              onChange={handleRestToggle}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            휴식 시간 설정
          </label>
          {isRestEnabled && (
            <div className="mt-2 pl-6">
              <label className="block text-xs font-medium text-gray-500">
                휴식 (초)
              </label>
              <input
                type="number"
                name="restSec"
                value={config.restSec ?? ""}
                onChange={handleChange}
                className="w-full border p-2 rounded text-sm"
                placeholder="예: 60"
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-3 py-1 rounded hover:bg-gray-200"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSaveClick}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          저장
        </button>
      </div>
    </div>
  );
};

/**
 * @description 새로운 루틴을 추가하는 폼 컴포넌트입니다.
 *              루틴 이름 입력, 운동 아이템 추가/편집, 최종 저장 기능을 제공합니다.
 */
const AddRoutineForm = () => {
  // --- Hooks ---
  const router = useRouter();
  /** @description 루틴 빌더 스토어에서 루틴 이름, 아이템 목록, 초기화, 아이템 설정 업데이트 함수를 가져옵니다. */
  const { name, setName, items, clearRoutine, updateItemConfig } =
    useRoutineBuilder();
  /** @description 루틴 생성 API 호출을 위한 훅입니다. */
  const { createRoutine, isCreating, createError } = useCreateRoutine();

  // --- State ---
  /** @description 현재 편집 중인 운동 아이템의 임시 ID를 저장하는 상태입니다. */
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  /** @description 폼 제출(저장) 진행 상태를 나타냅니다. */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** @description 폼 제출 중 발생한 오류 메시지를 저장하는 상태입니다. */
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- Handlers ---
  /** 
   * @description 폼 제출 시 호출됩니다. 
   * 루틴 이름과 운동 아이템들을 서버에 저장하는 비동기 로직을 처리합니다.
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    // 유효성 검사
    if (!name.trim()) {
      alert("루틴 이름을 입력해주세요.");
      return;
    }
    if (items.length === 0) {
      alert("운동을 하나 이상 추가해주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    let isSuccess = false;

    try {
      // 1. 새로운 루틴을 생성하는 API를 호출합니다.
      const newRoutine = await createRoutine({
        name,
        description: "", // 현재 폼에서는 설명을 입력받지 않으므로 빈 문자열로 보냅니다.
        // userId는 백엔드 세션에서 처리한다고 가정합니다.
      });

      // 루틴 생성 실패 시 오류 처리
      if (!newRoutine || !newRoutine.id) {
        throw new Error("루틴 생성에 실패했거나 ID를 받지 못했습니다.");
      }

      // 2. 생성된 루틴 ID를 사용하여 각 운동 아이템을 서버에 추가합니다.
      // json-server의 동시 쓰기 문제를 피하기 위해 Promise.all 대신 순차적으로 요청합니다.
      for (const [index, item] of items.entries()) {
        const routineItemPayload = {
          routineId: newRoutine.id,
          workoutId: item.workoutId,
          order: index + 1, // 현재 순서를 `order` 필드에 저장
          sets: item.config.sets,
          reps: item.config.reps,
          weight: item.config.weight,
          timeSec: item.config.timeSec,
          restSec: item.config.restSec,
        };
        await poster("/routineItems", { arg: routineItemPayload });
      }

      isSuccess = true;
    } catch (err: any) {
      // 오류 발생 시 오류 메시지 설정
      setSubmitError(err.message || "저장 중 예상치 못한 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      // 성공적으로 저장되면 루틴 빌더 상태를 초기화하고 메인 페이지로 이동합니다.
      if (isSuccess) {
        clearRoutine();
        router.push("/");
      }
    }
  };

  // --- Memoized Values ---
  /** @description 현재 폼이 처리 중인지 여부를 나타내는 값입니다. (버튼 비활성화용) */
  const isProcessing = isCreating || isSubmitting;
  /** @description 루틴 생성 또는 폼 제출 중 발생한 최종 오류 메시지입니다. */
  const finalError = useMemo(
    () => createError || (submitError ? new Error(submitError) : null),
    [createError, submitError]
  );

  // --- Render ---
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">새 루틴 추가</h1>
      <form className="space-y-4" onSubmit={handleSave}>
        {/* 루틴 이름 입력 필드 */}
        <div>
          <label htmlFor="routineName" className="block text-sm font-medium text-gray-700">루틴이름</label>
          <input
            id="routineName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="예: 등 운동 루틴"
            disabled={isProcessing}
          />
        </div>

        {/* 운동 아이템 목록 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">운동</h2>
          <ul>
            {items.map((item) =>
              editingItemId === item.tempId ? (
                // 편집 중인 아이템일 경우 `RoutineItemEditor`를 렌더링합니다.
                <li
                  key={item.tempId}
                  className="p-2 mb-2 rounded-md bg-gray-100"
                >
                  <RoutineItemEditor
                    item={item}
                    onSave={(tempId, newConfig) => {
                      updateItemConfig(tempId, newConfig);
                      setEditingItemId(null);
                    }}
                    onCancel={() => setEditingItemId(null)}
                  />
                </li>
              ) : (
                // 편집 중이 아닌 아이템일 경우 요약 정보를 표시하고 클릭 시 편집 모드로 전환합니다.
                <li
                  key={item.tempId}
                  className="border p-2 mb-2 rounded-md cursor-pointer hover:bg-gray-50"
                  onClick={() => setEditingItemId(item.tempId)}
                >
                  <div className="flex gap-4 items-center">
                    <p className="font-semibold">{item.name}</p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {item.categoryName}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-700">
                    {/* 운동 유형(mode)에 따라 다른 설정 정보를 표시합니다. */}
                    {item.mode === "strength" && (
                      <>
                        <span>{item.config.sets}세트</span>
                        <span>{item.config.reps}회</span>
                        <span>{item.config.weight}kg</span>
                      </>
                    )}
                    {item.mode === "repOnly" && (
                      <>
                        <span>{item.config.sets}세트</span>
                        <span>{item.config.reps}회</span>
                      </>
                    )}
                    {item.mode === "duration" && (
                      <>
                        <span>{item.config.sets}세트</span>
                        <span>
                          {/* 시간을 분:초 형식으로 포맷팅하여 표시합니다. */}
                          {String(
                            Math.floor(item.config.timeSec / 60)
                          ).padStart(2, "0")}
                          :{String(item.config.timeSec % 60).padStart(2, "0")}
                        </span>
                      </>
                    )}
                  </div>
                </li>
              )
            )}
          </ul>
          {/* 운동 추가 버튼: `/add-routine/select` 페이지로 이동합니다. */}
          <button
            type="button"
            onClick={() => router.push("/add-routine/select")}
            disabled={isProcessing}
            className="mt-2 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            + 운동추가
          </button>
        </div>

        {/* 폼 액션 버튼 (취소, 저장) */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              clearRoutine(); // 루틴 빌더 상태 초기화
              router.back(); // 이전 페이지로 이동
            }}
            disabled={isProcessing}
            className="text-gray-600 px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isProcessing ? "저장 중..." : "저장"}
          </button>
        </div>
        {/* 폼 제출 오류 메시지 표시 */}
        {finalError && (
          <p className="text-sm text-red-500 mt-2">{finalError.message}</p>
        )}
      </form>
    </div>
  );
};

export default AddRoutineForm;