// src/components/AddWorkoutForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetWorkoutCategories } from "@/app/hooks/workout/useGetWorkoutCategories";
import { useGetWorkoutTypes } from "@/app/hooks/workout/useGetWorkoutTypes";
import { useGetWorkoutTargets } from "@/app/hooks/workout/useGetWorkoutTargets";
import useSWRMutation from "swr/mutation";
import { poster } from "@/lib/fetcher";
import { useSWRConfig } from "swr";

type WorkoutMeta = {
  id: string;
  name: string;
};

export default function AddWorkoutForm() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workoutCategoryId, setWorkoutCategoryId] = useState("");
  const [workoutTypeId, setWorkoutTypeId] = useState("");
  const [workoutTargetId, setWorkoutTargetId] = useState("");

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Data fetching with SWR
  const { categories, isLoading: categoriesLoading } =
    useGetWorkoutCategories();
  const { types, isLoading: typesLoading } = useGetWorkoutTypes();
  const { targets, isLoading: targetsLoading } = useGetWorkoutTargets();

  // Mutation with SWR
  const {
    trigger: createWorkout,
    isMutating: isCreating,
    error: createError,
  } = useSWRMutation("/workouts", poster);

  // 새 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const createdCategory = await poster("/workoutCategories", {
        arg: { name: newCategory },
      });
      // Revalidate the categories list and select the new one
      mutate("/workoutCategories");
      setWorkoutCategoryId(createdCategory.id);
      setNewCategory("");
      setShowNewCategoryInput(false);
    } catch (error) {
      console.error("카테고리 추가 실패", error);
      alert("카테고리 추가에 실패했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!workoutCategoryId) {
      alert("카테고리를 선택해주세요");
      return;
    }
    if (!workoutTypeId) {
      alert("운동 타입을 선택해주세요");
      return;
    }
    if (!workoutTargetId) {
      alert("주요 타겟을 선택해주세요");
      return;
    }

    const payload = {
      name,
      description,
      workoutCategoryId,
      workoutTypeId,
      workoutTargetId,
    };

    await createWorkout(payload, {
      onSuccess: () => {
        router.push("/");
        router.refresh(); // To show the new item in the list
      },
    });
  };

  const isLoading = categoriesLoading || typesLoading || targetsLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {createError && (
        <p className="text-red-500">{(createError as Error).message}</p>
      )}

      <div>
        <label className="block mb-1 font-medium">운동 이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="예: 푸시업"
          disabled={isCreating}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">설명 (선택)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="간단한 설명을 입력하세요"
          disabled={isCreating}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">카테고리</label>
        <select
          value={workoutCategoryId}
          onChange={(e) => setWorkoutCategoryId(e.target.value)}
          className="w-full border p-2 rounded"
          disabled={isLoading || isCreating}
        >
          <option value="">카테고리를 선택하세요</option>
          {categories?.map((cat: WorkoutMeta) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {!showNewCategoryInput ? (
          <button
            type="button"
            onClick={() => setShowNewCategoryInput(true)}
            className="text-blue-500 mt-2 text-sm"
          >
            + 새 카테고리 추가
          </button>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border p-2 rounded flex-1"
              placeholder="새 카테고리 명"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-blue-500 text-white px-3 rounded"
            >
              추가
            </button>{" "}
            <button
              type="button"
              onClick={() => setShowNewCategoryInput(false)}
              className="text-sm text-gray-500"
            >
              취소
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">운동 타입</label>
        <select
          value={workoutTypeId}
          onChange={(e) => setWorkoutTypeId(e.target.value)}
          className="w-full border p-2 rounded"
          disabled={isLoading || isCreating}
        >
          <option value="">운동 타입을 선택하세요</option>
          {types?.map((type: WorkoutMeta) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">주요 타겟</label>
        <select
          value={workoutTargetId}
          onChange={(e) => setWorkoutTargetId(e.target.value)}
          className="w-full border p-2 rounded"
          disabled={isLoading || isCreating}
        >
          <option value="">주요 타겟을 선택하세요</option>
          {targets?.map((target: WorkoutMeta) => (
            <option key={target.id} value={target.id}>
              {target.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isCreating || isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        {isCreating ? "추가 중…" : "운동 추가"}
      </button>
    </form>
  );
}
