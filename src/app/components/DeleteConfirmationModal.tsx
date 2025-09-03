'use client';

import React from 'react';

/**
 * @description 루틴 삭제를 최종적으로 확인하는 모달 컴포넌트입니다.
 *              사용자에게 삭제 여부를 다시 한번 묻고, 되돌릴 수 없는 작업임을 알립니다.
 * @param {boolean} show - 모달의 표시 여부. true일 경우 모달을 렌더링합니다.
 * @param {function} onClose - '취소' 버튼 클릭 또는 모달 외부 클릭 시 호출되는 핸들러입니다.
 * @param {function} onConfirm - '삭제' 버튼 클릭 시 호출되는 핸들러입니다. 실제 삭제 로직을 실행합니다.
 * @param {boolean} isDeleting - 삭제 작업 진행 여부. true일 경우 버튼을 비활성화하고 텍스트를 변경합니다.
 */
const DeleteConfirmationModal = ({ show, onClose, onConfirm, isDeleting }: { show: boolean, onClose: () => void, onConfirm: () => void, isDeleting: boolean }) => {
  // `show` prop이 false일 경우, 모달을 렌더링하지 않고 즉시 null을 반환합니다.
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">정말 삭제하시겠습니까?</h2>
        <p className="text-gray-600 mb-6">이 작업은 되돌릴 수 없습니다.</p>
        <div className="flex justify-end gap-4">
          {/* 취소 버튼: `onClose` 핸들러를 호출하여 모달을 닫습니다. */}
          <button onClick={onClose} className="px-4 py-2 rounded text-gray-700 hover:bg-gray-100" disabled={isDeleting}>취소</button>
          {/* 삭제 확인 버튼: `onConfirm` 핸들러를 호출하여 실제 삭제 작업을 시작합니다. */}
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600" disabled={isDeleting}>
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;