import { create } from 'zustand';

type State = {
  selectedIds: number[];
  toggleId: (id: number) => void;
  setSelectedIds: (selectedIds: number[]) => void;
  reset: () => void;
}

export const useSelectedIds = create<State>()((set, get) => ({
  selectedIds: get()?.selectedIds || [],
  toggleId: (id: number) => {
    const selectedIds = get()?.selectedIds;

    if (selectedIds.some(i => i === id)) {
      const newSelectedIds = selectedIds.filter(i => i !== id);
      set({ selectedIds: newSelectedIds });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },
  setSelectedIds: (selectedIds: number[]) => set({ selectedIds }),
  reset: () => {set({ selectedIds: [] })},
}))
