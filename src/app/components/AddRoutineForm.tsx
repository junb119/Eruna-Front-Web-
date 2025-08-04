"use client";
import { useRouter } from "next/router";
import React, { useState } from "react";

const AddRoutineForm = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  return <div>AddRoutineForm</div>;
};

export default AddRoutineForm;
