'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Reorder } from 'framer-motion';
import { mutate } from 'swr';

// Hooks
import { useGetRoutine } from '@/app/hooks/routine/useGetRoutine';
import { useGetRoutineItems, RoutineItemJoined } from '@/app/hooks/routine/useGetRoutineItems';
import { useDeleteRoutine } from '@/app/hooks/routine/useDeleteRoutine';
import { useUpdateRoutine } from '@/app/hooks/routine/useUpdateRoutine';

// Components
import RoutineHeader from '@/app/components/RoutineHeader';
import RoutineActions from '@/app/components/RoutineActions';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import ItemEditorModal from '@/app/components/ItemEditorModal';

// Utils
import { putter } from '@/lib/fetcher';

// --- Main Component ---

/**
 * @description 루틴 상세 페이지 컴포넌트.
 *              특정 루틴의 상세 정보를 표시하고, 루틴 이름/설명 편집, 루틴 아이템 순서 변경 및 수정,
 *              그리고 루틴 삭제 기능을 제공합니다.
 *              Next.js의 Dynamic Route ([id])를 통해 루틴 ID를 받아옵니다.
 */
const RoutineDetail = () => {
  // --- Hooks ---
  const { id } = useParams();
  const router = useRouter();
  /** @description 현재 페이지의 루틴 ID. `useParams`에서 가져온 ID를 문자열로 변환합니다. */
  const routineId = typeof id === 'string' ? id : null;

  // --- Data Fetching ---
  /** @description 루틴 상세 정보를 가져오는 SWR 훅. */
  const { routine, isLoading: isLoadingRoutine, isError: isErrorRoutine, mutate: mutateRoutine } = useGetRoutine(routineId);
  /** @description 루틴에 포함된 아이템 목록을 가져오는 SWR 훅. */
  const { routineItems, isLoading: isLoadingItems, isError: isErrorItems } = useGetRoutineItems(routineId);
  /** @description 루틴 삭제를 위한 SWR Mutation 훅. */
  const { deleteRoutine, isDeleting } = useDeleteRoutine(routineId);
  /** @description 루틴 업데이트를 위한 SWR Mutation 훅. */
  const { updateRoutine, isUpdating: isUpdatingRoutine } = useUpdateRoutine(routineId);

  // --- State ---
  /** @description 수정 모드 여부 */
  const [isEditMode, setIsEditMode] = useState(false);
  /** @description 저장 진행 상태 (UI 피드백용) */
  const [isSaving, setIsSaving] = useState(false);
  /** @description 루틴 이름 편집용 상태 */
  const [editedName, setEditedName] = useState("");
  /** @description 루틴 설명 편집용 상태 */
  const [editedDescription, setEditedDescription] = useState("");
  /** @description 화면에 표시되고 순서가 변경되는 아이템 목록 상태 */
  const [localItems, setLocalItems] = useState<RoutineItemJoined[]>([]);
  /** @description 아이템 개별 수정 시, 대상 아이템을 저장하는 상태 */
  const [editingItem, setEditingItem] = useState<RoutineItemJoined | null>(null);
  /** @description 삭제 확인 모달 표시 상태 */
  const [showConfirm, setShowConfirm] = useState(false);
  
  // --- Effects ---
  /** @description 서버에서 가져온 루틴 데이터가 변경되면, 편집용 상태에 반영합니다. */
  useEffect(() => {
    if (routine) {
      setEditedName(routine.name);
      setEditedDescription(routine.description || "");
    }
  }, [routine]);

  /** @description 서버에서 가져온 아이템 목록이 변경되면, 화면 표시용 로컬 상태에 반영합니다. */
  useEffect(() => {
    if (routineItems) {
      setLocalItems(routineItems);
    }
  }, [routineItems]);

  // --- Handlers ---
  /** @description 수정 모드로 진입합니다. */
  const handleEnterEditMode = () => setIsEditMode(true);

  /** @description 수정 모드를 취소하고, 모든 변경사항을 원래대로 되돌립니다. */
  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (routine) {
      setEditedName(routine.name);
      setEditedDescription(routine.description || "");
    }
    if (routineItems) {
      setLocalItems(routineItems);
    }
  };

  /**
   * @description 이름, 설명, 아이템 순서 및 내용 등 모든 변경사항을 서버에 저장합니다.
   *              루틴 자체의 변경사항과 루틴 아이템의 변경사항을 병렬로 처리합니다.
   */
  const handleSave = async () => {
    if (!routine || !routineItems) return;
    setIsSaving(true);

    const updatePromises: Promise<any>[] = [];

    // 1. 루틴 이름/설명 변경사항 저장
    if (editedName !== routine.name || editedDescription !== (routine.description || '')) {
      updatePromises.push(updateRoutine({ name: editedName, description: editedDescription }));
    }

    // 2. 루틴 아이템 변경사항 저장
    const originalItemsMap = new Map(routineItems.map(item => [item.id, item]));
    localItems.forEach((localItem, index) => {
      const originalItem = originalItemsMap.get(localItem.id);
      const newOrder = index + 1;
      const orderChanged = originalItem?.order !== newOrder;
      const fieldsToCompare: (keyof RoutineItemJoined)[] = ['sets', 'reps', 'weight', 'timeSec', 'restSec'];
      const fieldsChanged = fieldsToCompare.some(field => localItem[field] !== originalItem?.[field]);

      if (orderChanged || fieldsChanged) {
        const payload = { ...localItem, order: newOrder };
        delete (payload as Partial<RoutineItemJoined>).workout;
        updatePromises.push(putter(`/routineItems/${localItem.id}`, { arg: payload }));
      }
    });

    try {
      await Promise.all(updatePromises);
      // 데이터 재검증 (서버와 동기화)
      await mutateRoutine();
      if (routineId) {
        await mutate(`/routineItems?routineId=${routineId}`);
      }
      await mutate('/workouts');
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  /** @description 루틴을 삭제합니다. */
  const handleDelete = async () => {
    if (!routineId) return;
    try {
      await deleteRoutine(undefined, { revalidate: false });
      router.push('/'); // 삭제 성공 시 메인 페이지로 이동
    } catch (error) {
      console.error("Failed to delete routine:", error);
      alert("루틴 삭제에 실패했습니다.");
    } finally {
      setShowConfirm(false);
    }
  };

  /**
   * @description 아이템 수정 모달에서 저장 시, 로컬 상태를 업데이트합니다.
   * @param {string} itemId - 업데이트할 아이템의 ID.
   * @param {any} newConfig - 업데이트할 새로운 설정 객체.
   */
  const handleUpdateItem = (itemId: string, newConfig: any) => {
    setLocalItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, ...newConfig } : item
      )
    );
    setEditingItem(null); // 수정 모달 닫기
  };

  // --- Render Logic ---
  /** @description 현재 컴포넌트에서 진행 중인 모든 처리 상태 (삭제, 루틴 업데이트, 저장)를 통합합니다. */
  const isProcessing = isDeleting || isUpdatingRoutine || isSaving;

  if (isLoadingRoutine || isLoadingItems) {
    return <div className="p-4">Loading...</div>;
  }

  if (isErrorRoutine || isErrorItems || !routine) {
    return <div className="p-4">루틴 정보를 불러오는 데 실패했습니다.</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {editingItem && (
        <ItemEditorModal 
          item={editingItem} 
          onSave={handleUpdateItem} 
          onClose={() => setEditingItem(null)} 
        />
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

      {!isEditMode && (
        <div className="text-center pt-4 pb-2">
          <Link href={`/routine/${id}/start`} passHref>
            <button className="w-full max-w-md px-6 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
              운동 시작
            </button>
          </Link>
        </div>
      )}

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
                className={`p-4 border rounded-lg bg-white shadow-sm transition-shadow ${isEditMode ? 'hover:shadow-md cursor-grab' : ''}`}
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
                      {item.workout?.name || '알 수 없는 운동'}
                    </p>
                  </div>
                  {isEditMode && (
                     <span className="material-icons text-gray-400 cursor-pointer">edit</span>
                  )}
                </div>
                <div className={`mt-3 ${isEditMode ? 'pl-12' : 'pl-6'} grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-600`}>
                  {item.sets != null && <span><span className="font-semibold">세트</span>: {item.sets}</span>}
                  {item.reps != null && <span><span className="font-semibold">횟수</span>: {item.reps}</span>}
                  {item.weight != null && <span><span className="font-semibold">무게</span>: {item.weight}kg</span>}
                  {item.timeSec != null && <span><span className="font-semibold">시간</span>: {item.timeSec}초</span>}
                  {item.restSec != null && <span><span className="font-semibold">휴식</span>: {item.restSec}초</span>}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <p className="text-center text-gray-500 py-8">이 루틴에 포함된 운동이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default RoutineDetail;
