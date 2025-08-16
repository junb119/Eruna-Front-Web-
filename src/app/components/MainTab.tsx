"use client";
import React from "react";
import { useState } from "react";

type Tab = "routines" | "workouts";

const MainTab = () => {
  const [activeTab, setActiveTab] = useState<Tab>("routines");
  
  return (
    <ul className="flex gap-4 items-center">
      <li>
        <button
          onClick={() => setActiveTab("routines")}
          className={`${
            activeTab === "routines"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "border-b-2 border-transparent"
          }`}
        >
          내 루틴
        </button>
      </li>
      <li>
        <button onClick={() => setActiveTab("workouts")}>내 운동</button>
      </li>
    </ul>
  );
};

export default MainTab;
