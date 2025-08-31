// components/AddRoutineForm.tsx
"use client";

import { poster } from "@/lib/fetcher";
import { useCreateRoutine } from "@/app/hooks/routine/useCreateRoutine";
import { useState, useMemo } from "react";
import { useRoutineBuilder } from "@/store/routineBuilder";
import { useRouter } from "next/navigation";

// 운동 아이템 수정을 위한 인라인 에디터 컴포넌트
const RoutineItemEditor = ({
  item,
  onSave,
  onCancel,
}: {
  item: any;
  onSave: (tempId: string, newConfig: any) => void;
  onCancel: () => void;
}) => {
  const [config, setConfig] = useState(item.config);
  const [isRestEnabled, setIsRestEnabled] = useState(
    item.config.restSec != null
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // 사용자가 값을 지울 수 있도록 빈 문자열도 허용
    const numericValue = value === "" ? "" : Number(value);
    setConfig((prev: any) => ({ ...prev, [name]: numericValue }));
  };

  const handleRestToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsRestEnabled(checked);
    if (!checked) {
      // 비활성화 시 config에서 restSec 제거
      const { restSec, ...newConfig } = config;
      setConfig(newConfig);
    } else if (config.restSec === undefined) {
      // 활성화 시 기본값 설정
      setConfig((prev) => ({ ...prev, restSec: 60 }));
    }
  };

  const handleSaveClick = () => {
    // 저장 시 빈 문자열 값은 제외하고 숫자만 저장
    const finalConfig = Object.entries(config).reduce((acc, [key, value]) => {
      if (value !== "" && !isNaN(Number(value))) {
        acc[key] = Number(value);
      }
      return acc;
    }, {} as any);
    onSave(item.tempId, finalConfig);
  };

  const commonFields = {
    sets: { label: "세트", unit: "" },
  };

  const modeFields: Record<string, any> = {
    strength: {
      reps: { label: "횟수", unit: "회" },
      weight: { label: "무게", unit: "kg" },
    },
    repOnly: { reps: { label: "횟수", unit: "회" } },
    duration: { timeSec: { label: "시간", unit: "초" } },
  };

  const fieldsToRender = { ...commonFields, ...(modeFields[item.mode] || {}) };

  return (
    <div className="p-2 bg-gray-50 rounded-md">
      <p className="font-semibold mb-3 text-blue-600">{item.name}</p>
      <div className="flex flex-col gap-y-3">
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
        {/* 휴식 시간 설정 */}
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

const AddRoutineForm = () => {
  const router = useRouter();
  const { name, setName, items, clearRoutine, updateItemConfig } =
    useRoutineBuilder();
  const { createRoutine, isCreating, createError } = useCreateRoutine();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // 1. 루틴 생성
      const newRoutine = await createRoutine({
        name,
        description: "",
        // userId는 백엔드 세션에서 처리한다고 가정
      });

      if (!newRoutine || !newRoutine.id) {
        throw new Error("루틴 생성에 실패했거나 ID를 받지 못했습니다.");
      }

      // 2. 생성된 루틴에 운동 아이템들 추가 (순차적 실행으로 변경)
      for (const [index, item] of items.entries()) {
        const routineItemPayload = {
          routineId: newRoutine.id,
          workoutId: item.workoutId,
          order: index + 1,
          sets: item.config.sets,
          reps: item.config.reps,
          weight: item.config.weight,
          timeSec: item.config.timeSec,
          restSec: item.config.restSec,
        };
        // json-server의 동시 쓰기 문제를 피하기 위해 하나씩 순차적으로 요청합니다.
        await poster("/routineItems", { arg: routineItemPayload });
      }

      isSuccess = true;
    } catch (err: any) {
      setSubmitError(err.message || "저장 중 예상치 못한 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      if (isSuccess) {
        clearRoutine();
        router.push("/");
      }
    }
  };

  const isProcessing = isCreating || isSubmitting;
  const finalError = useMemo(
    () => createError || (submitError ? new Error(submitError) : null),
    [createError, submitError]
  );

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">새 루틴 추가</h1>
      <form className="space-y-4" onSubmit={handleSave}>
        <div>
          <label htmlFor="routineName">루틴이름</label>
          <input
            id="routineName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="예: 등 운동 루틴"
            disabled={isProcessing}
          />
        </div>
        <div>
          <h2>운동</h2>
          <ul>
            {items.map((item) =>
              editingItemId === item.tempId ? (
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
          <button
            type="button"
            onClick={() => router.push("/add-routine/select")}
            disabled={isProcessing}
          >
            + 운동추가
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              clearRoutine();
              router.back();
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
        {finalError && (
          <p className="text-sm text-red-500 mt-2">{finalError.message}</p>
        )}
      </form>
    </div>
  );
};

export default AddRoutineForm;
