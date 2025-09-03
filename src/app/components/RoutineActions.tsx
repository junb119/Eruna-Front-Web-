'use client';

import React from 'react';

/**
 * @description 루틴 상세 페이지의 주요 액션 버튼(수정, 저장, 취소, 삭제)을 담당하는 컴포넌트입니다.
 *              수정 모드(isEditMode) 여부에 따라 다른 종류의 버튼을 표시합니다.
 * @param {boolean} isEditMode - 수정 모드 여부.
 * @param {boolean} isSaving - 저장 작업 진행 여부 (버튼 비활성화용).
 * @param {boolean} isDeleting - 삭제 작업 진행 여부 (버튼 비활성화용).
 * @param {function} onEnterEditMode - '수정' 버튼 클릭 시 호출되는 핸들러.
 * @param {function} onCancelEdit - '취소' 버튼 클릭 시 호출되는 핸들러.
 * @param {function} onSave - '저장' 버튼 클릭 시 호출되는 핸들러.
 * @param {function} onDelete - '삭제' 버튼 클릭 시 호출되는 핸들러.
 */
const RoutineActions = ({ isEditMode, isSaving, isDeleting, onEnterEditMode, onCancelEdit, onSave, onDelete }: { isEditMode: boolean, isSaving: boolean, isDeleting: boolean, onEnterEditMode: () => void, onCancelEdit: () => void, onSave: () => void, onDelete: () => void }) => {
  return (
    <div className="flex gap-2 flex-shrink-0 ml-4">
      {/* 수정 모드일 경우: '취소'와 '저장' 버튼을 표시합니다. */}
      {isEditMode ? (
        <>
          <button 
            onClick={onCancelEdit} 
            className="px-4 py-2 rounded-md bg-gray-200 text-sm font-medium hover:bg-gray-300 transition-colors" 
            disabled={isSaving || isDeleting} // 저장 또는 삭제 중에는 비활성화
          >
            취소
          </button>
          <button 
            onClick={onSave} 
            className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors" 
            disabled={isSaving || isDeleting} // 저장 또는 삭제 중에는 비활성화
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </>
      ) : (
        /* 기본 모드일 경우: '수정'과 '삭제' 버튼을 표시합니다. */
        <>
          <button 
            onClick={onEnterEditMode} 
            className="px-4 py-2 rounded-md bg-gray-200 text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            수정
          </button>
          <button 
            onClick={onDelete} 
            className="px-4 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors" 
            disabled={isDeleting} // 삭제 중에는 비활성화
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </>
      )}
    </div>
  );
};

export default RoutineActions;