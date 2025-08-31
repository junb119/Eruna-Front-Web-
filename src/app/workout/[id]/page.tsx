"use client";
import GobackBtn from "@/app/components/GobackBtn";
import { useGetWorkout } from "@/app/hooks/workout/useGetWorkout";
import { useDeleteWorkout } from "@/app/hooks/workout/useDeleteWorkout";
import { useUpdateWorkout } from "@/app/hooks/workout/useUpdateWorkout";
import { useGetWorkoutCategories } from "@/app/hooks/workout/useGetWorkoutCategories";
import { useGetWorkoutTypes } from "@/app/hooks/workout/useGetWorkoutTypes";
import { useGetWorkoutTargets } from "@/app/hooks/workout/useGetWorkoutTargets";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSWRConfig } from "swr";

type FormData = {
  name: string;
  description: string;
  workoutCategoryId: string;
  workoutTypeId: string;
  workoutTargetId: string;
};

const WorkoutDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [showConfirm, setShowConfirm] = useState(false);
  // 어떤 필드를 편집 중인지 추적하는 상태 ('name', 'description', 'category' 등)
  const [editingField, setEditingField] = useState<string | null>(null);
  // 어떤 필드가 현재 서버와 통신 중인지 추적하는 상태
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  const workoutId = typeof id === "string" ? id : null;

  const { workout, isLoading, isError } = useGetWorkout(workoutId);
  const { deleteWorkout, isDeleting } = useDeleteWorkout(workoutId);
  const { updateWorkout, isUpdating } = useUpdateWorkout(workoutId);
  const { categories, isLoading: categoriesLoading } =
    useGetWorkoutCategories();
  const { types, isLoading: typesLoading } = useGetWorkoutTypes();
  const { targets, isLoading: targetsLoading } = useGetWorkoutTargets();

  const handleUpdate = useCallback(
    async (field: keyof FormData, value: string) => {
      if (!workoutId || !workout) return;

      const currentValue = (workout as any)[field] ?? "";
      if (currentValue === value) {
        setEditingField(null);
        return; // 변경 사항이 없으면 아무것도 하지 않음
      }

      setUpdatingField(field);
      setEditingField(null);

      const key = `/workouts/${workoutId}?_expand=workoutCategory&_expand=workoutType&_expand=workoutTarget`;

      // API 요청을 위한 페이로드 (확장된 객체 제거)
      const apiPayload = { ...workout, [field]: value };
      delete (apiPayload as any).workoutCategory;
      delete (apiPayload as any).workoutType;
      delete (apiPayload as any).workoutTarget;

      // UI 즉시 업데이트를 위한 낙관적 데이터
      let optimisticData = { ...workout, [field]: value };
      if (field === "workoutCategoryId" && categories) {
        optimisticData.workoutCategory = categories.find(
          (c: any) => c.id === value
        );
      }
      if (field === "workoutTypeId" && types) {
        optimisticData.workoutType = types.find((t: any) => t.id === value);
      }
      if (field === "workoutTargetId" && targets) {
        optimisticData.workoutTarget = targets.find((t: any) => t.id === value);
      }

      try {
        await updateWorkout(apiPayload, {
          optimisticData,
          revalidate: false,
          populateCache: true,
          rollbackOnError: true,
        });
      } catch (error) {
        console.error(`Failed to update ${field}:`, error);
        // 실패 시 에러 메시지 표시 (예: 토스트)
        alert(`${field} 업데이트에 실패했습니다.`);
        // SWR이 자동으로 롤백하지만, 수동으로 mutate를 호출하여 강제로 되돌릴 수도 있습니다.
        mutate(key);
      } finally {
        setUpdatingField(null);
      }
    },
    [workout, workoutId, categories, types, targets, updateWorkout, mutate]
  );

  const handleDelete = async () => {
    if (!workoutId) return;
    try {
      // revalidate: false 옵션으로 불필요한 데이터 갱신을 막습니다.
      await deleteWorkout(undefined, { revalidate: false });
      router.push("/");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to delete workout:", error);
      }
      alert("운동 삭제에 실패했습니다. 다시 시도해주세요.");
      setShowConfirm(false);
    }
  };

  // ESC 키를 누르면 수정 모드 종료
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingField(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isProcessing = isDeleting || !!updatingField;
  const isListLoading = categoriesLoading || typesLoading || targetsLoading;

  if (isLoading || isListLoading) return <p>loading</p>;
  if (isError || !workout) return <p>오류 발생</p>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <GobackBtn />
        <div className="flex gap-4">
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm text-red-500 underline"
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>

      <div className="p-4 border rounded-lg shadow-sm bg-white">
        {editingField === "name" ? (
          <input
            name="name"
            defaultValue={workout.name}
            onBlur={(e) => handleUpdate("name", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="text-2xl font-bold mb-2 w-full border-b-2 pb-1 outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => setEditingField("name")}
            className="text-2xl font-bold mb-2 cursor-pointer"
          >
            {workout.name}
          </h1>
        )}
        {editingField === "description" ? (
          <textarea
            name="description"
            defaultValue={workout.description || ""}
            onBlur={(e) => handleUpdate("description", e.target.value)}
            className="text-gray-600 mb-4 w-full border rounded p-2 h-24 outline-none focus:border-blue-500"
            placeholder="설명을 입력하세요."
            autoFocus
          />
        ) : (
          <p
            onClick={() => setEditingField("description")}
            className="text-gray-600 mb-4 min-h-[2rem] cursor-pointer"
          >
            {workout.description || "설명이 없습니다."}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-500">카테고리</span>
            {editingField === "category" ? (
              <select
                name="workoutCategoryId"
                defaultValue={workout.workoutCategoryId}
                onChange={(e) =>
                  handleUpdate("workoutCategoryId", e.target.value)
                }
                onBlur={() => setEditingField(null)}
                className="text-gray-800 border rounded p-1"
                autoFocus
              >
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <span
                onClick={() => setEditingField("category")}
                className="text-gray-800 cursor-pointer"
              >
                {workout.workoutCategory.name}
              </span>
            )}
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-500">타입</span>
            {editingField === "type" ? (
              <select
                name="workoutTypeId"
                defaultValue={workout.workoutTypeId}
                onChange={(e) => handleUpdate("workoutTypeId", e.target.value)}
                onBlur={() => setEditingField(null)}
                className="text-gray-800 border rounded p-1"
                autoFocus
              >
                {types.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <span
                onClick={() => setEditingField("type")}
                className="text-gray-800 cursor-pointer"
              >
                {workout.workoutType.name}
              </span>
            )}
          </div>
          <div className="flex justify-between py-2">
            <span className="font-semibold text-gray-500">주요 타겟</span>
            {editingField === "target" ? (
              <select
                name="workoutTargetId"
                defaultValue={workout.workoutTargetId}
                onChange={(e) =>
                  handleUpdate("workoutTargetId", e.target.value)
                }
                onBlur={() => setEditingField(null)}
                className="text-gray-800 border rounded p-1"
                autoFocus
              >
                {targets.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <span
                onClick={() => setEditingField("target")}
                className="text-gray-800 cursor-pointer"
              >
                {workout.workoutTarget.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">정말 삭제하시겠습니까?</h2>
            <p className="text-gray-600 mb-6">이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded text-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;
