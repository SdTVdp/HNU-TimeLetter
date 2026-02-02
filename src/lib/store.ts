import { create } from 'zustand';

interface AppState {
  // 信封是否已打开
  isEnvelopeOpened: boolean;
  setEnvelopeOpened: (opened: boolean) => void;
  
  // 当前选中的地点ID
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  
  // 当前查看的故事索引（用于同一地点多个故事的切换）
  currentStoryIndex: number;
  setCurrentStoryIndex: (index: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isEnvelopeOpened: false,
  setEnvelopeOpened: (opened) => set({ isEnvelopeOpened: opened }),
  
  selectedLocationId: null,
  setSelectedLocationId: (id) => set({ selectedLocationId: id, currentStoryIndex: 0 }),
  
  currentStoryIndex: 0,
  setCurrentStoryIndex: (index) => set({ currentStoryIndex: index }),
}));
