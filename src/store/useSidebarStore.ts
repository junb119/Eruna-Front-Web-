import { create } from "zustand";

type SidbarState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useSidebarStore = create<SidbarState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),
}));
