import { create } from 'zustand';
import { AppData, RouletteList, AppSettings, RouletteItem } from '../../domain/types';
import { rouletteRepository } from '../../infrastructure/storage/rouletteRepository';

interface RouletteStore extends AppData {
  history: RouletteItem[];
  // Actions
  addList: (list: RouletteList) => void;
  updateList: (list: RouletteList) => void;
  deleteList: (listId: string) => void;
  selectList: (listId: string | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Specific Item Actions
  addItemToList: (listId: string, item: RouletteItem) => void;
  removeItemFromList: (listId: string, itemId: string) => void;
  
  // History Actions
  addToHistory: (item: RouletteItem) => void;
  clearHistory: () => void;
}

const saveState = (state: RouletteStore) => {
    rouletteRepository.save({
        lists: state.lists,
        settings: state.settings
    });
};

export const useRouletteStore = create<RouletteStore>((set) => ({
  // Initial State from Repository
  ...rouletteRepository.load(),
  history: [],

  addList: (list) => {
    set((state) => {
      const newState = { ...state, lists: [...state.lists, list] };
      saveState(newState as RouletteStore);
      return newState;
    });
  },

  updateList: (updatedList) => {
    set((state) => {
      const newState = {
        ...state,
        lists: state.lists.map((l) => (l.id === updatedList.id ? updatedList : l)),
      };
      saveState(newState as RouletteStore);
      return newState;
    });
  },

  deleteList: (listId) => {
    set((state) => {
      const newState = {
        ...state,
        lists: state.lists.filter((l) => l.id !== listId),
        // If selected list is deleted, deselect
        settings: {
          ...state.settings,
          selectedListId: state.settings.selectedListId === listId ? null : state.settings.selectedListId,
        },
      };
      saveState(newState as RouletteStore);
      return newState;
    });
  },

  selectList: (listId) => {
    set((state) => {
      const newState = {
        ...state,
        settings: { ...state.settings, selectedListId: listId },
      };
      saveState(newState as RouletteStore);
      return newState;
    });
  },

  updateSettings: (newSettings) => {
    set((state) => {
      const newState = {
        ...state,
        settings: { ...state.settings, ...newSettings },
      };
      saveState(newState as RouletteStore);
      return newState;
    });
  },
  
  addItemToList: (listId, item) => {
      set((state) => {
          const listIndex = state.lists.findIndex(l => l.id === listId);
          if (listIndex === -1) return state;
          
          const newLists = [...state.lists];
          newLists[listIndex] = {
              ...newLists[listIndex],
              items: [...newLists[listIndex].items, item]
          };
          
          const newState = { ...state, lists: newLists };
          saveState(newState as RouletteStore);
          return newState;
      })
  },
  
  removeItemFromList: (listId, itemId) => {
       set((state) => {
          const listIndex = state.lists.findIndex(l => l.id === listId);
          if (listIndex === -1) return state;
          
          const newLists = [...state.lists];
          newLists[listIndex] = {
              ...newLists[listIndex],
              items: newLists[listIndex].items.filter(i => i.id !== itemId)
          };
          
          const newState = { ...state, lists: newLists };
          saveState(newState as RouletteStore);
          return newState;
      })
  },
  
  addToHistory: (item) => {
      set((state) => ({ history: [item, ...state.history] }));
  },
  
  clearHistory: () => {
      set({ history: [] });
  }
}));
