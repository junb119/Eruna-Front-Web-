'use client';

import React from 'react';
import GobackBtn from '@/app/components/GobackBtn';

/**
 * @description 루틴 상세 페이지의 헤더 영역을 담당하는 컴포넌트입니다. 
 *              수정 모드(isEditMode) 여부에 따라 루틴의 제목과 설명을 
 *              단순 텍스트로 보여주거나, 편집 가능한 입력 필드로 렌더링합니다.
 * @param {boolean} isEditMode - 수정 모드 여부. true일 경우 입력 필드를, false일 경우 텍스트를 표시합니다.
 * @param {string} name - 루틴의 이름. (표시용/입력 필드 값)
 * @param {string} description - 루틴의 설명. (표시용/입력 필드 값)
 * @param {function} onNameChange - 이름 입력 필드 변경 시 호출되는 핸들러입니다.
 * @param {function} onDescriptionChange - 설명 입력 필드 변경 시 호출되는 핸들러입니다.
 * @param {boolean} isProcessing - 저장, 삭제 등 비동기 작업 진행 여부. true일 경우 입력 필드를 비활성화합니다.
 */
const RoutineHeader = ({ isEditMode, name, description, onNameChange, onDescriptionChange, isProcessing }: { isEditMode: boolean, name: string, description: string, onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, isProcessing: boolean }) => {
  return (
    <div className="flex-1">
      {/* 뒤로가기 버튼 */}
      <div className="mb-2">
        <GobackBtn />
      </div>

      {/* 수정 모드일 경우: 이름과 설명을 편집할 수 있는 입력 필드를 표시합니다. */}
      {isEditMode ? (
        <div className="space-y-2">
          <input 
            type="text"
            value={name}
            onChange={onNameChange}
            className="text-3xl font-bold text-gray-800 w-full border-b-2 p-1 bg-gray-50"
            disabled={isProcessing}
            placeholder="루틴 이름"
          />
          <textarea 
            value={description}
            onChange={onDescriptionChange}
            className="text-gray-500 mt-2 w-full border rounded-md p-2 h-24 bg-gray-50"
            placeholder="이 루틴에 대한 설명이 없습니다."
            disabled={isProcessing}
          />
        </div>
      ) : (
        /* 기본 모드일 경우: 이름과 설명을 텍스트로 표시합니다. */
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{name}</h1>
          <p className="text-gray-500 mt-2 h-auto min-h-[2rem]">
            {description || '이 루틴에 대한 설명이 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoutineHeader;