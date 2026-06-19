'use client';

import { useState } from 'react';
import GameInterface from '@/components/GameInterface';
import Intro from '@/components/Intro';
import TitleScreen from '@/components/TitleScreen';

type Screen = 'title' | 'intro' | 'game';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('title');

  return (
    <main className="min-h-screen bg-black">
      {screen === 'title' && <TitleScreen onStart={() => setScreen('intro')} />}
      {screen === 'intro' && <Intro onStartGame={() => setScreen('game')} />}
      {screen === 'game' && <GameInterface />}
    </main>
  );
}
