"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Reorder } from "framer-motion";
import { mutate } from "swr";

// Hooks
import { useGetRoutine } from "@/app/hooks/routine/useGetRoutine";
import {
  useGetRoutineItems,
  RoutineItemJoined,
} from "@/app/hooks/routine/useGetRoutineItems";
import { useDeleteRoutine } from "@/app/hooks/routine/useDeleteRoutine";
import { useUpdateRoutine } from "@/app/hooks/routine/useUpdateRoutine";

// Components
import RoutineHeader from "@/app/components/RoutineHeader";
import RoutineActions from "@/app/components/RoutineActions";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";
import ItemEditorModal from "@/app/components/ItemEditorModal";

// Utils
import { putter, fetcher, deleter } from "@/lib/fetcher";

// --- Main Component ---

/** 루틴 상세 페이지: 조회/편집/삭제, 세션 시작 제공 */
const RoutineDetail = () => {
  // --- Hooks ---
  const { id } = useParams();
  const router = useRouter();
  const routineId = typeof id === "string" ? id : null;

  // --- Data Fetching ---
  const {
    routine,
    isLoading: isLoadingRoutine,
    isError: isErrorRoutine,
    mutate: mutateRoutine,
  } = useGetRoutine(routineId);
  const {
    routineItems,
    isLoading: isLoadingItems,
    isError: isErrorItems,
  } = useGetRoutineItems(routineId);
  const { deleteRoutine, isDeleting } = useDeleteRoutine(routineId);
  const { updateRoutine, isUpdating: isUpdatingRoutine } = useUpdateRoutine(routineId);

  // --- State ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [localItems, setLocalItems] = useState<RoutineItemJoined[]>([]);
  const [editingItem, setEditingItem] = useState<RoutineItemJoined | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (routine) {
      setEditedName(routine.name);
      setEditedDescription(routine.description || "");
    }
  }, [routine]);

  useEffect(() => {
    if (routineItems) setLocalItems(routineItems);
  }, [routineItems]);

  // --- Handlers ---
  const handleEnterEditMode = () => setIsEditMode(true);
  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (routine) {
      setEditedName(routine.name);
      setEditedDescription(routine.description || "");
    }
    if (routineItems) setLocalItems(routineItems);
  };

  const handleSave = async () => {
    if (!routine || !routineItems) return;
    setIsSaving(true);
    const updatePromises: Promise<any>[] = [];

    // 1) 루틴 기본 정보
    if (editedName !== routine.name || editedDescription !== (routine.description || "")) {
      updatePromises.push(updateRoutine({ name: editedName, description: editedDescription }));
    }

    // 2) 아이템 순서/설정
    const origMap = new Map(routineItems.map((it) => [it.id, it]));
    localItems.forEach((li, index) => {
      const ori = origMap.get(li.id);
      const newOrder = index + 1;
      const orderChanged = ori?.order !== newOrder;
      const changed = ["sets", "reps", "weight", "timeSec", "restSec"].some(
        (k) => (li as any)[k] !== (ori as any)?.[k]
      );
      if (orderChanged || changed) {
        const payload: any = { ...li, order: newOrder };
        delete payload.workout;
        updatePromises.push(putter(`/routineItems/${li.id}`, { arg: payload }));
      }
    });

    try {
      await Promise.all(updatePromises);
      await mutateRoutine();
      if (routineId) await mutate(`/routineItems?routineId=${routineId}`);
      await mutate("/workouts");
      setIsEditMode(false);
    } catch (e) {
      console.error(e);
      alert("변경 사항 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!routineId) return;
    try {
      const items: any[] = await fetcher(`/routineItems?routineId=${routineId}`);
      for (const it of items) await deleter(`/routineItems/${it.id}`);
      await deleteRoutine(undefined, { revalidate: false });
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("루틴 삭제에 실패했습니다.");
    } finally {
      setShowConfirm(false);
    }
  };

  const handleUpdateItem = (itemId: string, newConfig: any) => {
    setLocalItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...newConfig } : it)));
    setEditingItem(null);
  };

  // --- Render ---
  const isProcessing = isDeleting || isUpdatingRoutine || isSaving;

  if (isLoadingRoutine || isLoadingItems) return <div className="p-4">Loading...</div>;
  if (isErrorRoutine || isErrorItems || !routine) return <div className="p-4">루틴 정보를 불러오지 못했습니다.</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {editingItem && (
        <ItemEditorModal item={editingItem} onSave={handleUpdateItem} onClose={() => setEditingItem(null)} />
      )}

      <DeleteConfirmationModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <div className="flex justify-between items-start">
        <RoutineHeader
          isEditMode={isEditMode}
          name={editedName}
          description={editedDescription}
          onNameChange={(e) => setEditedName(e.target.value)}
          onDescriptionChange={(e) => setEditedDescription(e.target.value)}
          isProcessing={isProcessing}
        />
        <RoutineActions
          isEditMode={isEditMode}
          isSaving={isSaving}
          isDeleting={isDeleting}
          onEnterEditMode={handleEnterEditMode}
          onCancelEdit={handleCancelEdit}
          onSave={handleSave}
          onDelete={() => setShowConfirm(true)}
        />
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold border-b pb-2">운동 목록</h2>
        {localItems.length > 0 ? (
          <Reorder.Group as="ul" axis="y" values={localItems} onReorder={setLocalItems} className="space-y-3">
            {localItems.map((item, index) => (
              <Reorder.Item
                key={item.id}
                value={item}
                as="li"
                dragListener={isEditMode}
                className={`p-4 border rounded-lg bg-white shadow-sm transition-shadow ${
                  isEditMode ? "hover:shadow-md cursor-grab" : ""
                }`}
                onClick={() => isEditMode && setEditingItem(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isEditMode && (
                      <div className="pr-4 text-gray-400">
                        <span className="material-icons">drag_indicator</span>
                      </div>
                    )}
                    <p className="font-bold text-lg text-gray-800">
                      <span className="text-blue-600 font-normal text-base mr-2">{index + 1}.</span>
                      {item.workout?.name || "이름 없는 운동"}
                    </p>
                  </div>
                </div>
                <div className={`mt-3 ${isEditMode ? "pl-12" : "pl-6"} grid grid-cols-2 md:grid-cols-4 gap-2 text-sm`}>
                  {item.sets != null && (
                    <span>
                      <span className="font-semibold">세트</span>: {item.sets}
                    </span>
                  )}
                  {item.reps != null && (
                    <span>
                      <span className="font-semibold">반복</span>: {item.reps}
                    </span>
                  )}
                  {item.weight != null && (
                    <span>
                      <span className="font-semibold">무게</span>: {item.weight}kg
                    </span>
                  )}
                  {item.timeSec != null && (
                    <span>
                      <span className="font-semibold">시간</span>: {item.timeSec}초
                    </span>
                  )}
                  {item.restSec != null && (
                    <span>
                      <span className="font-semibold">휴식</span>: {item.restSec}초
                    </span>
                  )}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <p className="text-center text-gray-500 py-8">이 루틴에는 아직 운동이 없습니다.</p>
        )}
      </div>

      {!isEditMode && (
        <div className="text-center pt-4 pb-2">
          <button
            type="button"
            className="w-full max-w-md px-6 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
            onClick={() => {
              const ok = confirm("이 루틴으로 운동을 시작할까요?");
              if (!ok) return;
              const sid = globalThis.crypto?.randomUUID?.()
                ? globalThis.crypto.randomUUID()
                : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
              router.push(`/routine/${id}/session/${sid}`);
            }}
          >
            운동 시작
          </button>
        </div>
      )}
    </div>
  );
};

export default RoutineDetail;

