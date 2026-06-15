'use client';

import { useState } from 'react';
import GameInterface from '@/components/GameInterface';
import Intro from '@/components/Intro';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <main className="min-h-screen bg-black">
      {gameStarted ? (
        <GameInterface />
      ) : (
        <Intro onStartGame={() => setGameStarted(true)} />
      )}
    </main>
  );
}
