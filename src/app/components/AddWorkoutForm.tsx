// components/AddWorkoutForm.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { poster } from "@/lib/fetcher";

// Hooks
import { useGetWorkoutCategories } from "@/app/hooks/workout/useGetWorkoutCategories";
import { useGetWorkoutTypes } from "@/app/hooks/workout/useGetWorkoutTypes";
import { useGetWorkoutTargets } from "@/app/hooks/workout/useGetWorkoutTargets";

/**
 * @description 새로운 운동을 추가하는 폼 컴포넌트입니다.
 *              운동 이름, 카테고리, 종류, 타겟 부위 등을 입력받아 서버에 저장합니다.
 */
const AddWorkoutForm = () => {
  // --- Hooks ---
  const router = useRouter();
  /** @description 운동 카테고리 목록을 가져오는 훅입니다. */
  const { categories, isLoading: isLoadingCategories } = useGetWorkoutCategories();
  /** @description 운동 종류 목록을 가져오는 훅입니다. */
  const { types, isLoading: isLoadingTypes } = useGetWorkoutTypes();
  /** @description 운동 타겟 부위 목록을 가져오는 훅입니다. */
  const { targets, isLoading: isLoadingTargets } = useGetWorkoutTargets();

  // --- State ---
  /** @description 운동 이름을 관리하는 상태입니다. */
  const [name, setName] = useState("");
  /** @description 운동 설명을 관리하는 상태입니다. */
  const [description, setDescription] = useState("");
  /** @description 선택된 운동 카테고리 ID를 관리하는 상태입니다. */
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  /** @description 선택된 운동 종류 ID를 관리하는 상태입니다. */
  const [selectedType, setSelectedType] = useState<string | null>(null);
  /** @description 선택된 운동 타겟 부위 ID를 관리하는 상태입니다. */
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  /** @description 폼 제출(저장) 진행 상태를 나타냅니다. */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** @description 폼 제출 중 발생한 오류 메시지를 저장하는 상태입니다. */
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- Effects ---
  /** @description 운동 카테고리 데이터가 로드되면 첫 번째 카테고리를 기본값으로 설정합니다. */
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  /** @description 운동 종류 데이터가 로드되면 첫 번째 종류를 기본값으로 설정합니다. */
  useEffect(() => {
    if (types && types.length > 0 && !selectedType) {
      setSelectedType(types[0].id);
    }
  }, [types, selectedType]);

  /** @description 운동 타겟 데이터가 로드되면 첫 번째 타겟을 기본값으로 설정합니다. */
  useEffect(() => {
    if (targets && targets.length > 0 && !selectedTarget) {
      setSelectedTarget(targets[0].id);
    }
  }, [targets, selectedTarget]);

  // --- Handlers ---
  /** 
   * @description 폼 제출 시 호출됩니다. 
   * 입력된 운동 정보를 서버에 저장하는 비동기 로직을 처리합니다.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    // 유효성 검사
    if (!name.trim()) {
      alert("운동 이름을 입력해주세요.");
      return;
    }
    if (!selectedCategory) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    if (!selectedType) {
      alert("운동 종류를 선택해주세요.");
      return;
    }
    if (!selectedTarget) {
      alert("타겟 부위를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 새로운 운동을 생성하는 API를 호출합니다.
      await poster("/workouts", {
        arg: {
          name,
          description,
          workoutCategoryId: selectedCategory,
          workoutTypeId: selectedType,
          workoutTargetId: selectedTarget,
        },
      });
      router.push("/"); // 성공 시 운동 목록 페이지로 이동
    } catch (err: any) {
      // 오류 발생 시 오류 메시지 설정
      setSubmitError(err.message || "운동 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Memoized Values ---
  /** @description 데이터 로딩 중인지 여부를 나타냅니다. (폼 비활성화용) */
  const isLoading = isLoadingCategories || isLoadingTypes || isLoadingTargets;
  /** @description 폼 제출 또는 데이터 로딩 중인지 여부를 나타냅니다. (버튼 비활성화용) */
  const isProcessing = isSubmitting || isLoading;

  // --- Render ---
  if (isLoading) {
    return <div className="p-4">Loading categories, types, and targets...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">새 운동 추가</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 운동 이름 입력 필드 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">운동 이름</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isProcessing}
            placeholder="예: 벤치프레스"
          />
        </div>

        {/* 운동 설명 입력 필드 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">설명</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
            disabled={isProcessing}
            placeholder="운동에 대한 설명을 입력하세요."
          />
        </div>

        {/* 운동 카테고리 선택 필드 */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">카테고리</label>
          <select
            id="category"
            value={selectedCategory ?? ""}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isProcessing}
          >
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 운동 종류 선택 필드 */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">운동 종류</label>
          <select
            id="type"
            value={selectedType ?? ""}
            onChange={(e) => setSelectedType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isProcessing}
          >
            {types?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* 운동 타겟 부위 선택 필드 */}
        <div>
          <label htmlFor="target" className="block text-sm font-medium text-gray-700">타겟 부위</label>
          <select
            id="target"
            value={selectedTarget ?? ""}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isProcessing}
          >
            {targets?.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name}
              </option>
            ))}
          </select>
        </div>

        {/* 폼 액션 버튼 */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
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
        {submitError && (
          <p className="text-sm text-red-500 mt-2">{submitError}</p>
        )}
      </form>
    </div>
  );
};

export default AddWorkoutForm;