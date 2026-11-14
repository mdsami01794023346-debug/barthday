import { DEFAULT_CAT_SURPRISE, DEFAULT_SCENE_CONFIG, SceneConfig } from '../types/scene';

const ACTIVE_DRAFT_KEY = 'starlight_wishes_active_draft';
const LEGACY_KEYS = ['starlight_wishes_draft_v5', 'starlight_wishes_draft_v4'];
const SAVED_LIST_KEY = 'starlight_wishes_saved_cards_v1';
const IDB_NAME = 'starlight_wishes_db';
const IDB_STORE = 'kv';

export interface SavedSceneItem {
  id: string;
  title: string;
  updatedAt: number;
  config: SceneConfig;
}

export function normalizeSceneConfig(raw: Partial<SceneConfig> | null | undefined): SceneConfig {
  if (!raw || !Array.isArray(raw.messages) || raw.messages.length === 0) {
    return DEFAULT_SCENE_CONFIG;
  }
  return {
    ...DEFAULT_SCENE_CONFIG,
    ...raw,
    messages: raw.messages.map((m) => String(m)).filter((m) => m.length > 0),
    catSurprise: {
      ...DEFAULT_CAT_SURPRISE,
      ...(raw.catSurprise ?? {}),
    },
  };
}

function openIdb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openIdb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore IDB failures
  }
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openIdb();
  if (!db) return null;
  try {
    return await new Promise<T | null>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export function loadActiveDraftSync(): SceneConfig | null {
  if (typeof window === 'undefined') return null;

  const keysToTry = [ACTIVE_DRAFT_KEY, ...LEGACY_KEYS];
  for (const key of keysToTry) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SceneConfig>;
        if (parsed && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          return normalizeSceneConfig(parsed);
        }
      }
    } catch {
      // Ignore parse/storage error
    }
  }
  return null;
}

export async function loadActiveDraftAsync(): Promise<SceneConfig | null> {
  const syncFound = loadActiveDraftSync();
  if (syncFound) return syncFound;
  const fromIdb = await idbGet<Partial<SceneConfig>>(ACTIVE_DRAFT_KEY);
  if (fromIdb && Array.isArray(fromIdb.messages) && fromIdb.messages.length > 0) {
    const normalized = normalizeSceneConfig(fromIdb);
    try {
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(normalized));
    } catch {
      // Ignore quota errors
    }
    return normalized;
  }
  return null;
}

export function saveActiveDraft(config: SceneConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(config));
  } catch {
    // Ignore quota errors
  }
  void idbSet(ACTIVE_DRAFT_KEY, config);
}

export function loadSavedCardsSync(): SavedSceneItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedSceneItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && item.id && item.config)
      .map((item) => ({
        ...item,
        config: normalizeSceneConfig(item.config),
      }));
  } catch {
    return [];
  }
}

export async function loadSavedCardsAsync(): Promise<SavedSceneItem[]> {
  const syncList = loadSavedCardsSync();
  if (syncList.length > 0) return syncList;
  const fromIdb = await idbGet<SavedSceneItem[]>(SAVED_LIST_KEY);
  if (Array.isArray(fromIdb) && fromIdb.length > 0) {
    const normalized = fromIdb.map((item) => ({
      ...item,
      config: normalizeSceneConfig(item.config),
    }));
    try {
      localStorage.setItem(SAVED_LIST_KEY, JSON.stringify(normalized));
    } catch {
      // Ignore
    }
    return normalized;
  }
  return [];
}

export function saveCardToLibrary(config: SceneConfig): SavedSceneItem[] {
  const existing = loadSavedCardsSync();
  const title =
    config.messages.find((m) => m.trim().length > 0)?.trim().slice(0, 34) ||
    'Untitled Wish';

  const now = Date.now();
  // Update matching title entry or create a fresh saved slot (keep up to 20 saved cards)
  const existingIdx = existing.findIndex(
    (item) => item.title.toLowerCase() === title.toLowerCase()
  );

  let nextList: SavedSceneItem[];
  if (existingIdx >= 0) {
    nextList = [...existing];
    nextList[existingIdx] = {
      ...nextList[existingIdx],
      updatedAt: now,
      config,
    };
  } else {
    const entry: SavedSceneItem = {
      id: `card_${now}_${Math.random().toString(36).slice(2, 6)}`,
      title,
      updatedAt: now,
      config,
    };
    nextList = [entry, ...existing].slice(0, 20);
  }

  try {
    localStorage.setItem(SAVED_LIST_KEY, JSON.stringify(nextList));
  } catch {
    // Ignore quota errors
  }
  void idbSet(SAVED_LIST_KEY, nextList);
  saveActiveDraft(config);
  return nextList;
}

export function deleteSavedCard(id: string): SavedSceneItem[] {
  const nextList = loadSavedCardsSync().filter((item) => item.id !== id);
  try {
    localStorage.setItem(SAVED_LIST_KEY, JSON.stringify(nextList));
  } catch {
    // Ignore
  }
  void idbSet(SAVED_LIST_KEY, nextList);
  return nextList;
}
