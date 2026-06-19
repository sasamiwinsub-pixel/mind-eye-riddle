'use client';

import { useEffect, useState } from 'react';
import GameInterface from '@/components/GameInterface';
import Intro from '@/components/Intro';
import TitleScreen from '@/components/TitleScreen';
import { loadSavedSession, saveScreenProgress, type SavedScreen } from '@/lib/gameProgressStorage';

type Screen = SavedScreen;

export default function Home() {
  const [screen, setScreen] = useState<Screen>('title');
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const savedSession = loadSavedSession();
      if (savedSession) setScreen(savedSession.screen);
      setIsStorageReady(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (isStorageReady) saveScreenProgress(screen);
  }, [isStorageReady, screen]);

  if (!isStorageReady) {
    return <main className="min-h-screen bg-black" />;
  }

  return (
    <main className="min-h-screen bg-black">
      {screen === 'title' && <TitleScreen onStart={() => setScreen('intro')} />}
      {screen === 'intro' && <Intro onStartGame={() => setScreen('game')} />}
      {screen === 'game' && <GameInterface />}
    </main>
  );
}
