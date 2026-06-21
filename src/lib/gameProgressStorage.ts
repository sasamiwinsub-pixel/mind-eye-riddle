export const GAME_VERSION = '1.3.2';

const STORAGE_KEY = 'mind-eye-riddle:progress';

export type SavedScreen = 'title' | 'intro' | 'game';

interface StoredSession {
  version: string;
  screen: SavedScreen;
  game?: unknown;
}

const isSavedScreen = (value: unknown): value is SavedScreen => (
  value === 'title' || value === 'intro' || value === 'game'
);

const readSession = (): StoredSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object'
      || parsed === null
      || !('version' in parsed)
      || parsed.version !== GAME_VERSION
      || !('screen' in parsed)
      || !isSavedScreen(parsed.screen)
    ) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed as StoredSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const writeSession = (session: StoredSession) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage may be unavailable or full. The game remains usable without persistence.
  }
};

export const loadSavedSession = () => readSession();

export const saveScreenProgress = (screen: SavedScreen) => {
  const current = readSession();
  writeSession({
    version: GAME_VERSION,
    screen,
    ...(current?.game === undefined ? {} : { game: current.game }),
  });
};

export const saveGameProgress = (game: unknown) => {
  writeSession({
    version: GAME_VERSION,
    screen: 'game',
    game,
  });
};
