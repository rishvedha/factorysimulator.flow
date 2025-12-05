import { create } from "zustand";

export const useFactoryStore = create((set) => ({
  machines: [],
  addMachine: (machine) => set((state) => ({
    machines: [...state.machines, machine]
  })),

  // production metrics
  production: 0,
  defects: 0,

  updateMetrics: (res) => set(() => res),
}));
