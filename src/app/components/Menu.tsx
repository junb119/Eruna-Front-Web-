import React from "react";

const Menu = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      <span className="material-icons !text-4xl">menu</span>;
    </button>
  );
};

export default Menu;
