import { AppData } from '../../domain/types';
import { DEFAULT_SETTINGS } from '../../domain/constants';

const STORAGE_KEY = 'mini-roulette-data';

export const rouletteRepository = {
  load: (): AppData => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        // Ensure default settings are merged if missing (simple migration)
        return {
          ...parsed,
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings }
        };
      }
    } catch (e) {
      console.error('Failed to load data from storage', e);
    }
    return {
      lists: [],
      settings: DEFAULT_SETTINGS
    };
  },

  save: (data: AppData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data to storage', e);
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  }
};
