import React from "react";

const SelectWorkoutList = ({ show }) => {

  
  return (
    <div
      className={`${
        show ? "translate-x-0" : "translate-x-[100%]"
      } w-full h-screen transition`}
    >
      SelectWorkoutList
    </div>
  );
};

export default SelectWorkoutList;
