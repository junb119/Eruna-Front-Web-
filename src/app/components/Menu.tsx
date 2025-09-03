import React from "react";

/**
 * @description 메뉴 아이콘 버튼 컴포넌트입니다. 클릭 시 `onClick` 핸들러를 호출합니다.
 *              주로 사이드바를 토글하는 등의 액션에 사용됩니다.
 * @param {function} onClick - 버튼 클릭 시 실행될 콜백 함수입니다.
 */
const Menu = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick} aria-label="메뉴 열기">
      <span className="material-icons !text-4xl">menu</span>
    </button>
  );
};

export default Menu;