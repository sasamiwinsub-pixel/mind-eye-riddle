'use client';

import React, { useState, useEffect } from 'react';

interface IntroProps {
  onStartGame: () => void;
}

export default function Intro({ onStartGame }: IntroProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const lines = [
    { speaker: 'main', text: '「相棒をどこへやった？」' },
    { speaker: 'system', text: '俺の問いかけを無視して目の前のモニターから音声が流れる。' },
    { speaker: 'ai', text: '「立山君、待っていたよ。君たちには私と知恵比べをしてもらう。勝利した場合は相棒を解放してやろう」' },
    { speaker: 'system', text: '相棒を助けるためにはこの提案に従うしか無さそうだ。首を縦に振るとゲームの説明が始まった。' },
    { speaker: 'title', text: 'ゲームの流れ' },
    { speaker: 'rule', text: '1. 謎を解く' },
    { speaker: 'rule', text: '2. 正解するとお題が出る' },
    { speaker: 'rule', text: '3. お題に沿ったアイテムの場所を特定して提出する' },
    { speaker: 'rule', text: '4. 提出場所「あ」～「け」8つ全て完了でクリア' },
    { speaker: 'rule', text: '相棒はゲームフィールドの中にいて通信が可能です。ただし、相棒は物に干渉できません。' },
    { speaker: 'title', text: '重要なルール' },
    { speaker: 'rule', text: '・謎の画像内に登場したアイテムしか視認することができない' },
  ];

  useEffect(() => {
    if (!isAutoScroll || currentLineIndex >= lines.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentLineIndex(prev => prev + 1);
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentLineIndex, isAutoScroll, lines.length]);

  const handleLineClick = () => {
    if (currentLineIndex < lines.length - 1) {
      // ルール説明開始位置を取得
      const ruleStartIndex = lines.findIndex(line => line.speaker === 'title' && line.text === 'ゲームの流れ');

      // ルール説明前なら1行ずつ進める、以降は全て表示
      if (currentLineIndex < ruleStartIndex) {
        setCurrentLineIndex(prev => prev + 1);
      } else {
        setCurrentLineIndex(lines.length - 1);
      }
      setIsAutoScroll(false);
    }
  };

  const getSpeakerStyle = (speaker: string) => {
    switch (speaker) {
      case 'main':
        return 'text-amber-300 font-bold';
      case 'ai':
        return 'text-green-400 font-bold';
      case 'system':
        return 'text-slate-300 italic';
      case 'title':
        return 'text-cyan-400 font-bold text-lg mt-6 mb-2';
      case 'rule':
        return 'text-slate-200 ml-4 my-1';
      default:
        return 'text-slate-300';
    }
  };

  const isAllShown = currentLineIndex >= lines.length - 1;

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-slate-900 relative overflow-hidden">
      {/* Header */}
      <header className="glass-panel py-3 px-4 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          知恵比べの始まり
        </h1>
      </header>

      {/* Main Content Area */}
      <main
        className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col cursor-pointer"
        onClick={handleLineClick}
      >
        <div className="space-y-3">
          {lines.slice(0, currentLineIndex + 1).map((line, index) => (
            <div key={index} className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${getSpeakerStyle(line.speaker)}`}>
              {line.text}
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="text-xs text-slate-500 mb-2">
            {currentLineIndex + 1} / {lines.length}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentLineIndex + 1) / lines.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Hint */}
        {!isAllShown && (
          <div className="text-center text-xs text-slate-500 mt-4 animate-pulse">
            クリックして進める
          </div>
        )}
      </main>

      {/* Start Button */}
      {isAllShown && (
        <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={onStartGame}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-lg shadow-lg hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all text-lg"
          >
            チュートリアルへ進む →
          </button>
        </div>
      )}
    </div>
  );
}
