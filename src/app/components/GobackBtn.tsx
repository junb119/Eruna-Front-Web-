"use client";

import { useRouter } from "next/navigation";
import React from "react";

const GobackBtn = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-blue-500 underline"
    >
      &larr;
    </button>
  );
};

export default GobackBtn;
