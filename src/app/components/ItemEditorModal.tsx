'use client';

import React, { useState, useMemo } from 'react';
import type { RoutineItemJoined } from '@/app/hooks/routine/useGetRoutineItems';

/**
 * @description 루틴에 포함된 개별 운동 아이템의 상세 설정(세트, 횟수, 무게 등)을 수정하는 모달 컴포넌트입니다.
 * @param {RoutineItemJoined} item - 수정할 대상 아이템의 정보입니다. 운동 종류(workoutType)를 포함하고 있어야 합니다.
 * @param {function} onSave - 저장 버튼 클릭 시 호출되는 콜백 함수입니다. 수정된 설정 값을 부모 컴포넌트로 전달합니다.
 * @param {function} onClose - 닫기 버튼 클릭 시 호출되는 콜백 함수입니다.
 */
const ItemEditorModal = ({ 
  item, 
  onSave, 
  onClose 
}: { 
  item: RoutineItemJoined; 
  onSave: (itemId: string, newConfig: any) => void; 
  onClose: () => void; 
}) => {
  // --- State ---
  /** @description 사용자가 입력하는 값을 관리하는 로컬 상태입니다. 초기값은 부모로부터 받은 item의 설정 값입니다. */
  const [config, setConfig] = useState({ 
    sets: item.sets, 
    reps: item.reps, 
    weight: item.weight, 
    timeSec: item.timeSec, 
    restSec: item.restSec 
  });

  // --- Memoized Values ---
  /**
   * @description 운동 유형(`unit_primary`)에 따라 모달에 표시할 입력 필드를 동적으로 결정합니다.
   * `useMemo`를 사용하여 `item` prop이 변경될 때만 이 계산을 다시 수행합니다.
   * - repOnly: 횟수 기반 운동 (세트, 횟수)
   * - strength: 근력 운동 (세트, 횟수, 무게)
   * - duration: 시간 기반 운동 (세트, 시간)
   */
  const unitPrimary = item.workout?.workoutType?.unit_primary;
  const fieldsToShow = useMemo(() => {
    const fields = {
      sets: true,      // 세트는 대부분의 경우에 포함됩니다.
      reps: false,
      weight: false,
      timeSec: false,
      restSec: true,   // 휴식 시간은 항상 표시합니다.
    };

    switch (unitPrimary) {
      case 'repOnly':
        fields.reps = true;
        break;
      case 'strength':
        fields.reps = true;
        fields.weight = true;
        break;
      case 'duration':
        fields.timeSec = true;
        break;
      default: // 타입 정보가 없거나 새로운 타입일 경우 안전을 위해 모두 표시합니다.
        fields.reps = true;
        fields.weight = true;
        fields.timeSec = true;
        break;
    }
    return fields;
  }, [unitPrimary]);

  // --- Handlers ---
  /** @description 각 입력 필드의 값이 변경될 때마다 로컬 `config` 상태를 업데이트합니다. */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // 입력 값이 비어있으면 undefined로, 아니면 숫자로 변환하여 상태를 업데이트합니다.
    const numericValue = value === "" ? undefined : Number(value);
    setConfig(prev => ({ ...prev, [name]: numericValue }));
  };

  /** 
   * @description 저장 버튼 클릭 시 호출됩니다. 
   * 현재 운동 유형에 맞는 유효한 설정 값만 추출하여 `onSave` 콜백을 통해 부모 컴포넌트로 전달합니다.
   */
  const handleSave = () => {
    // 1. 현재 운동 유형에 따라 표시된 필드만으로 새 설정 객체를 만듭니다.
    const newConfig: Partial<typeof config> = {};
    if (fieldsToShow.sets) newConfig.sets = config.sets;
    if (fieldsToShow.reps) newConfig.reps = config.reps;
    if (fieldsToShow.weight) newConfig.weight = config.weight;
    if (fieldsToShow.timeSec) newConfig.timeSec = config.timeSec;
    if (fieldsToShow.restSec) newConfig.restSec = config.restSec;
    
    // 2. 사용자가 값을 입력하지 않은(null 또는 undefined) 필드는 제외하고 최종 데이터를 구성합니다.
    const finalConfig = Object.fromEntries(Object.entries(newConfig).filter(([_, v]) => v != null));
    
    // 3. 부모 컴포넌트의 핸들러를 호출합니다.
    onSave(item.id, finalConfig);
  };

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full space-y-4">
        <h2 className="text-lg font-bold">{item.workout?.name} 설정 수정</h2>
        <div className="space-y-2">
          {/* `fieldsToShow` 객체를 기반으로 필요한 입력 필드만 조건부 렌더링합니다. */}
          {fieldsToShow.sets && (
            <div>
              <label className="text-sm">세트</label>
              <input type="number" name="sets" value={config.sets ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          )}
          {fieldsToShow.reps && (
            <div>
              <label className="text-sm">횟수</label>
              <input type="number" name="reps" value={config.reps ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          )}
          {fieldsToShow.weight && (
            <div>
              <label className="text-sm">무게 (kg)</label>
              <input type="number" name="weight" value={config.weight ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          )}
          {fieldsToShow.timeSec && (
            <div>
              <label className="text-sm">시간 (초)</label>
              <input type="number" name="timeSec" value={config.timeSec ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          )}
          {fieldsToShow.restSec && (
            <div>
              <label className="text-sm">휴식 (초)</label>
              <input type="number" name="restSec" value={config.restSec ?? ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded text-gray-700 hover:bg-gray-100">취소</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">저장</button>
        </div>
      </div>
    </div>
  );
};

export default ItemEditorModal;