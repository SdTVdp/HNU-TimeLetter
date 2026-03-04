import { create } from 'zustand';

interface AppState {
  // 信封是否已打开
  isEnvelopeOpened: boolean;
  setEnvelopeOpened: (opened: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isEnvelopeOpened: false,
  setEnvelopeOpened: (opened) => set({ isEnvelopeOpened: opened }),
}));
