import AddRoutineForm from "../components/AddRoutineForm";
import AnimatedWrapper from "../components/AnimatedWrapper";

// add-routine/layout.tsx
export default function Layout({
  children,
  overlay,
}: {
  children: React.ReactNode;
  overlay: React.ReactNode;
}) {
  return (
    <>
      {children}
      {overlay}
    </>
  );
}
