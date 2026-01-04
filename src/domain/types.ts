export interface RouletteItem {
  id: string; // 항목 고유 ID (UUID)
  text: string;
}

export interface RouletteList {
  id: string;
  name: string;
  items: RouletteItem[];
}

export interface AppSettings {
  selectedListId: string | null;
  allowDuplicatesInSession: boolean; // 세션 내 중복 당첨 허용 여부
  soundEnabled: boolean;
}

export interface AppData {
  lists: RouletteList[];
  settings: AppSettings;
}
