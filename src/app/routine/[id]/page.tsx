'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetRoutine } from '@/app/hooks/routine/useGetRoutine';
import { useGetRoutineItems, RoutineItemJoined } from '@/app/hooks/routine/useGetRoutineItems';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import GobackBtn from '@/app/components/GobackBtn';
import { useDeleteRoutine } from '@/app/hooks/routine/useDeleteRoutine';
import { useUpdateRoutine } from '@/app/hooks/routine/useUpdateRoutine';
import { putter } from '@/lib/fetcher';
import { Reorder } from 'framer-motion';

// 3단계: 아이템 수정을 위한 에디터 컴포넌트
const ItemEditorModal = ({ 
  item, 
  onSave, 
  onClose 
}: { 
  item: RoutineItemJoined; 
  onSave: (itemId: string, newConfig: any) => void; 
  onClose: () => void; 
}) => {
  const [config, setConfig] = useState({ 
    sets: item.sets, 
    reps: item.reps, 
    weight: item.weight, 
    timeSec: item.timeSec, 
    restSec: item.restSec 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value === "" ? undefined : Number(value);
    setConfig(prev => ({ ...prev, [name]: numericValue }));
  };

  const handleSave = () => {
    // 빈 값을 제외하고 실제 값만 저장
    const finalConfig = Object.fromEntries(Object.entries(config).filter(([_, v]) => v != null));
    onSave(item.id, finalConfig);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full space-y-4">
        <h2 className="text-lg font-bold">{item.workout?.name} 설정 수정</h2>
        
        <div className="space-y-2">
          <div>
            <label className="text-sm">세트</label>
            <input type="number" name="sets" value={config.sets ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-sm">횟수</label>
            <input type="number" name="reps" value={config.reps ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-sm">무게 (kg)</label>
            <input type="number" name="weight" value={config.weight ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-sm">시간 (초)</label>
            <input type="number" name="timeSec" value={config.timeSec ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
           <div>
            <label className="text-sm">휴식 (초)</label>
            <input type="number" name="restSec" value={config.restSec ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded text-gray-700 hover:bg-gray-100">취소</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">저장</button>
        </div>
      </div>
    </div>
  );
};

const RoutineDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const routineId = typeof id === 'string' ? id : null;

  const { routine, isLoading: isLoadingRoutine, isError: isErrorRoutine, mutate: mutateRoutine } = useGetRoutine(routineId);
  const { routineItems, isLoading: isLoadingItems, isError: isErrorItems, mutate: mutateItems } = useGetRoutineItems(routineId);
  const { deleteRoutine, isDeleting } = useDeleteRoutine(routineId);
  const { updateRoutine, isUpdating: isUpdatingRoutine } = useUpdateRoutine(routineId);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [localItems, setLocalItems] = useState<RoutineItemJoined[]>([]);
  const [editingItem, setEditingItem] = useState<RoutineItemJoined | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (routine) {
      setEditedName(routine.name);
      setEditedDescription(routine.description || "");
    }
  }, [routine]);

  useEffect(() => {
    if (routineItems) {
      setLocalItems(routineItems);
    }
  }, [routineItems]);

  const handleEnterEditMode = () => setIsEditMode(true);

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (routine) {
      setEditedName(routine.name);
      setEditedDescription(routine.description || "");
    }
    setLocalItems(routineItems);
  };

  const handleSave = async () => {
    if (!routine) return;
    setIsSaving(true);

    const updatePromises: Promise<any>[] = [];

    // 1. 루틴 이름/설명 변경 감지 및 업데이트
    if (editedName !== routine.name || editedDescription !== (routine.description || '')) {
      updatePromises.push(updateRoutine({ name: editedName, description: editedDescription }));
    }

    // 2. 루틴 아이템 순서/내용 변경 감지 및 업데이트
    const originalItemsMap = new Map(routineItems.map(item => [item.id, item]));
    localItems.forEach((localItem, index) => {
      const originalItem = originalItemsMap.get(localItem.id);
      const newOrder = index + 1;
      let itemChanged = false;

      const payload: any = {};

      if (originalItem?.order !== newOrder) {
        itemChanged = true;
        payload.order = newOrder;
      }
      
      const fieldsToCompare: (keyof RoutineItemJoined)[] = ['sets', 'reps', 'weight', 'timeSec', 'restSec'];
      for (const field of fieldsToCompare) {
        if (localItem[field] !== originalItem?.[field]) {
          itemChanged = true;
          payload[field] = localItem[field];
        }
      }

      if (itemChanged) {
        const finalPayload = { ...originalItem, ...payload };
        updatePromises.push(putter(`/routineItems/${localItem.id}`, { arg: finalPayload }));
      }
    });

    try {
      await Promise.all(updatePromises);
      await mutateRoutine(); // 루틴 데이터 갱신
      await mutateItems();   // 아이템 데이터 갱신
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!routineId) return;
    try {
      await deleteRoutine(undefined, { revalidate: false });
      router.push('/');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete routine:", error);
      }
      alert("루틴 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setShowConfirm(false);
    }
  };

  const handleUpdateItem = (itemId: string, newConfig: any) => {
    setLocalItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, ...newConfig } : item
      )
    );
    setEditingItem(null);
  };

  const isLoading = isLoadingRoutine || isLoadingItems;
  const isError = isErrorRoutine || isErrorItems;
  const isProcessing = isDeleting || isUpdatingRoutine || isSaving;

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (isError || !routine) {
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

      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="mb-2">
            <GobackBtn />
          </div>
          {isEditMode ? (
            <div className="space-y-2">
              <input 
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-3xl font-bold text-gray-800 w-full border-b-2 p-1 bg-gray-50"
                disabled={isProcessing}
              />
              <textarea 
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="text-gray-500 mt-2 w-full border rounded-md p-2 h-24 bg-gray-50"
                placeholder='이 루틴에 대한 설명이 없습니다.'
                disabled={isProcessing}
              />
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{routine.name}</h1>
              <p className="text-gray-500 mt-2 h-auto min-h-[2rem]">
                {routine.description || '이 루틴에 대한 설명이 없습니다.'}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-4">
          {isEditMode ? (
            <>
              <button onClick={handleCancelEdit} className="px-4 py-2 rounded-md bg-gray-200 text-sm font-medium hover:bg-gray-300 transition-colors" disabled={isProcessing}>
                취소
              </button>
              <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors" disabled={isProcessing}>
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleEnterEditMode} className="px-4 py-2 rounded-md bg-gray-200 text-sm font-medium hover:bg-gray-300 transition-colors">
                수정
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </>
          )}
        </div>
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
                className={`p-4 border rounded-lg bg-white shadow-sm transition-shadow ${isEditMode ? 'hover:shadow-md' : ''}`}
                onClick={() => isEditMode && setEditingItem(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isEditMode && (
                      <div className="cursor-grab pr-4 text-gray-400">
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
                <div className={`mt-3 pl-12 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-600`}>
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
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDetail;