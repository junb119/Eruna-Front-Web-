// src/components/AddWorkoutForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetcher, API_BASE } from "@/lib/fetcher";
type WorkoutCategory = {
  id: string;
  name: string;
};
type WorkoutType = {
  id: string;
  name: string;
};

export default function AddWorkoutForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [typeId, setTypeId] = useState("");
  const [types, setTypes] = useState<WorkoutType[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 목록 가져오기
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/workoutCategories`);
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("카테고리 로딩 실패", error);
      }
    };
    const loadTypes = async () => {
      try {
        const res = await fetch(`${API_BASE}/workoutTypes`);
        const data = await res.json();
        setTypes(data);
      } catch (error) {
        console.error("운동 타입 로딩 실패", error);
      }
    };
    loadCategories();
    loadTypes();
  }, []);

  // 새 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return; // 새카테고리 비어있을 시
    try {
      const res = await fetch(`${API_BASE}/workoutCategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories((prev) => [...prev, data]);
        setNewCategory("");
        setShowNewCategoryInput(false);
      }
    } catch (error) {
      console.error("카테고리 추가 실패", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return setError("이름을 입력해주세요.");
    }
    if (!categoryId) return setError("카테고리를 선택해주세요");
    if (!typeId) return setError("운동 타입을 선택해주세요");

    setLoading(true);
    setError(null);
    try {
      await fetch(`${API_BASE}/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, categoryId, typeId }),
      });
      // 추가 후 메인으로 돌아가기
      router.push("/");
    } catch (err: any) {
      setError(err.message || "추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}

      <div>
        <label className="block mb-1 font-medium">운동 이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="예: 푸시업"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">설명 (선택)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="간단한 설명을 입력하세요"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">카테고리</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border p-2 rounded"
          disabled={loading}
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (
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
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className="w-full border p-2 rounded"
          disabled={loading}
        >
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? "추가 중…" : "운동 추가"}
      </button>
    </form>
  );
}
