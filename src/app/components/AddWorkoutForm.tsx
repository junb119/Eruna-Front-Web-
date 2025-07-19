// src/components/AddWorkoutForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetcher, API_BASE } from "@/lib/fetcher";

export default function AddWorkoutForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fetch(`${API_BASE}/workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
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
