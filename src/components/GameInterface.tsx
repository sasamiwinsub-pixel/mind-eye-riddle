'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { GAME_STEPS, LOCATIONS, POSITIONS } from '@/constants/gameData';

type Tab = 'main' | 'map' | 'photos' | 'log';
type DialogMessage = 'tutorial_photos' | 'start_puzzle' | 'tutorial_search' | null;

export default function GameInterface() {
  const [currentStepId, setCurrentStepId] = useState(0);
  const [phase, setPhase] = useState<'puzzle' | 'search'>('puzzle');
  const [activeTab, setActiveTab] = useState<Tab>('main');

  // 入力状態
  const [puzzleInput, setPuzzleInput] = useState('');
  const [searchLocation, setSearchLocation] = useState(LOCATIONS[0]);
  const [searchPosition, setSearchPosition] = useState(POSITIONS[0]);
  const [searchItem, setSearchItem] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // 青ハイライト演出用：正解後にお題へ進むボタンを表示する状態
  const [isPuzzleSolvedPending, setIsPuzzleSolvedPending] = useState(false);

  // 拡大表示用の画像URL状態
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // 画像の折りたたみ状態
  const [isImageCollapsed, setIsImageCollapsed] = useState(false);

  // 相棒の会話状態
  const [activePartnerMessage, setActivePartnerMessage] = useState<string | null>(null);
  const [readPartnerMessages, setReadPartnerMessages] = useState<string[]>([]);

  // 解放された写真と新着状態
  const [unlockedPhotos, setUnlockedPhotos] = useState<string[]>(GAME_STEPS[0].unlockedPhotos);
  // 場所ごとの画像ファイル名を管理（デフォルトは場所名と同じ）
  const [photoFiles, setPhotoFiles] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    GAME_STEPS[0].unlockedPhotos.forEach(p => { initial[p] = p; });
    return initial;
  });

  const [newPhotos, setNewPhotos] = useState<string[]>(GAME_STEPS[0].unlockedPhotos);

  // ダイアログ状態
  const [tutorialDialog, setTutorialDialog] = useState<DialogMessage>(null);
  const [showedPhotosDialog, setShowedPhotosDialog] = useState(false);
  const [showedPuzzleDialog, setShowedPuzzleDialog] = useState(false);
  const [showedSearchTutorialDialog, setShowedSearchTutorialDialog] = useState(false);
  const [showPuzzleDialogAfterZoom, setShowPuzzleDialogAfterZoom] = useState(false);

  // 相棒クイズ解答状態
  const [solvedPartnerQuestions, setSolvedPartnerQuestions] = useState<string[]>([]);
  const [partnerAnswerInput, setPartnerAnswerInput] = useState('');
  const [partnerAnswerError, setPartnerAnswerError] = useState('');
  
  const currentStep = GAME_STEPS.find(s => s.id === currentStepId) || GAME_STEPS[0];

  // これまでに判明した情報(memos)を取得
  const discoveredMemos = GAME_STEPS.filter(s => s.id <= currentStepId).flatMap(s => s.memos || []);

  // 選択可能なアイテムを累積・解放状況から取得する関数
  const getAvailableItemsForLocation = (loc: string) => {
    const items = new Set<string>();
    
    // 1. 各ステップ（現在のステップ含む）で解放されたアイテム
    for (let i = 0; i <= currentStepId; i++) {
      const step = GAME_STEPS.find(s => s.id === i);
      if (step && step.unlockedLocationItems && step.unlockedLocationItems[loc]) {
        step.unlockedLocationItems[loc].forEach(item => items.add(item));
      }
    }
    
    // 2. 解答済みの相棒クイズによって解放されたアイテム
    for (let i = 0; i <= currentStepId; i++) {
      const step = GAME_STEPS.find(s => s.id === i);
      if (step && step.partnerEvents) {
        step.partnerEvents.forEach(event => {
          const qKey = `${step.id}_${event.targetPhoto}`;
          if (solvedPartnerQuestions.includes(qKey) && event.questionAnswer) {
            if (event.questionAnswer.unlockLocation === loc) {
              items.add(event.questionAnswer.unlockItem);
            }
          }
        });
      }
    }
    
    return Array.from(items);
  };

  // ゲーム開始時にチュートリアルダイアログを表示
  useEffect(() => {
    if (!showedPhotosDialog) {
      setTutorialDialog('tutorial_photos');
      setShowedPhotosDialog(true);
    }
  }, []);

  const handlePartnerClick = (message: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePartnerMessage(message);
    setPartnerAnswerInput('');
    setPartnerAnswerError('');
    if (!readPartnerMessages.includes(message)) {
      setReadPartnerMessages([...readPartnerMessages, message]);
    }
    // メインタブへの自動遷移を削除し、写真タブに留まるように変更
  };

  // 探索フェーズへの共通遷移処理
  const proceedToSearchPhase = () => {
    setIsPuzzleSolvedPending(false);
    setPuzzleInput('');
    setPhase('search');
    setIsImageCollapsed(true);

    // お題表示時に写真を更新・新規解放
    const newlyUnlocked = currentStep.unlockedPhotos;
    const newlyUnlockedAtTheme = currentStep.unlockedPhotosAtTheme || [];
    const newlyUpdated = currentStep.updatedPhotosAtTheme ? Object.keys(currentStep.updatedPhotosAtTheme) : [];

    setUnlockedPhotos(prev => Array.from(new Set([...prev, ...newlyUnlocked, ...newlyUnlockedAtTheme])));

    setPhotoFiles(prev => {
      const next = { ...prev };
      newlyUnlocked.forEach(p => { if (!next[p]) next[p] = p; });
      newlyUnlockedAtTheme.forEach(p => { if (!next[p]) next[p] = p; });
      if (currentStep.updatedPhotosAtTheme) {
        Object.entries(currentStep.updatedPhotosAtTheme).forEach(([loc, filename]) => {
          next[loc] = filename;
        });
      }
      return next;
    });

    setNewPhotos([...newlyUnlocked, ...newlyUnlockedAtTheme, ...newlyUpdated]);

    // チュートリアルの場合、検索のヒントダイアログを表示
    if (currentStepId === 0 && !showedSearchTutorialDialog) {
      setTutorialDialog('tutorial_search');
      setShowedSearchTutorialDialog(true);
    }
  };

  const handlePuzzleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (puzzleInput.trim() === currentStep.puzzleAnswer) {
      setErrorMsg('');
      if (currentStep.showBlueAnswerEffect) {
        // 青ハイライト演出モード：一時停止してボタン表示
        setIsPuzzleSolvedPending(true);
      } else {
        proceedToSearchPhase();
      }
    } else {
      setErrorMsg('答えが違います。もう一度考えてみよう！');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { location, position, item } = currentStep.searchTarget;
    
    if (searchLocation === location && searchPosition === position && searchItem.trim() === item) {
      setErrorMsg('');
      setSearchItem('');
      // 次のステップへ
      if (currentStepId < GAME_STEPS.length - 1) {
        const nextStep = GAME_STEPS.find(s => s.id === currentStepId + 1)!;
        setCurrentStepId(nextStep.id);
        setPhase('puzzle');
        setIsPuzzleSolvedPending(false); // ステップ遷移時にリセット
        setIsImageCollapsed(false); // 次のステップの開始時に画像を開く
        
        // 新しい写真の解放と既存写真の更新
        const newlyUnlocked = nextStep.unlockedPhotos;
        const newlyUpdated = nextStep.updatedPhotosAtPuzzle ? Object.keys(nextStep.updatedPhotosAtPuzzle) : [];

        setUnlockedPhotos(prev => Array.from(new Set([...prev, ...newlyUnlocked])));

        // 画像ファイルの差し替え情報を適用
        setPhotoFiles(prev => {
          const next = { ...prev };
          // 新規解放分
          newlyUnlocked.forEach(p => { if (!next[p]) next[p] = p; });
          // 更新分
          if (nextStep.updatedPhotosAtPuzzle) {
            Object.entries(nextStep.updatedPhotosAtPuzzle).forEach(([loc, filename]) => {
              next[loc] = filename;
            });
          }
          return next;
        });

        // 新規解放された写真 ＋ 更新された写真 を「NEW」として扱う
        setNewPhotos([...newlyUnlocked, ...newlyUpdated]);
        
        // メインタブに戻し、相棒のメッセージもリセットする
        setActivePartnerMessage(null);
        setActiveTab('main');
      } else {
        alert('ゲームクリア！おめでとうございます！');
      }
    } else {
      setErrorMsg('場所、位置、またはアイテム名が違います。');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-slate-900 relative overflow-hidden">
      
      {/* Header */}
      <header className="glass-panel py-3 px-4 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          {currentStep.title}
        </h1>
        <div className="text-xs bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
          Step {currentStepId} / {GAME_STEPS.length - 1}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        {activeTab === 'main' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Image Toggle Bar */}
            <div 
              className="bg-slate-800 border-b border-slate-700 flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-slate-700 transition-colors"
              onClick={() => setIsImageCollapsed(!isImageCollapsed)}
            >
              <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                謎画像
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isImageCollapsed ? 'rotate-180' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>

            {/* Image Area */}
            <div className={`transition-all duration-500 overflow-hidden ${isImageCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
              <div 
                className="relative w-full aspect-4/3 bg-black flex items-center justify-center border-b border-slate-800 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setZoomedImage(currentStep.puzzleImage)}
              >
                <Image 
                  src={currentStep.puzzleImage} 
                  alt="謎画像" 
                  fill 
                  className="object-contain"
                  priority
                />
                <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1.5 backdrop-blur-sm pointer-events-none text-white/70">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Theme Area */}
            <div className="p-4 flex-1 flex flex-col">
              {phase === 'search' && (
                <div className="glass rounded-xl p-4 mb-4 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] animate-in fade-in slide-in-from-top-2 duration-300">
                  <h2 className="text-blue-400 text-sm font-semibold mb-1">現在のお題</h2>
                  <p className="text-lg text-slate-100">{currentStep.themeText}</p>
                </div>
              )}

              {/* Form Area */}
              <div className="mt-auto">
                {errorMsg && (
                  <div className="mb-3 text-red-400 text-sm bg-red-900/20 p-2 rounded-lg border border-red-500/20 text-center animate-bounce">
                    {errorMsg}
                  </div>
                )}
                
                {phase === 'puzzle' ? (
                  isPuzzleSolvedPending ? (
                    // 青ハイライト演出UI
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
                      <label className="text-sm text-blue-400 font-semibold">✓ 正解！</label>
                      <input
                        type="text"
                        value={currentStep.puzzleAnswer}
                        disabled
                        className="bg-blue-950/60 border-2 border-blue-400 rounded-lg p-3 text-blue-300 font-bold text-center tracking-widest cursor-not-allowed shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-all"
                      />
                      <button
                        type="button"
                        onClick={proceedToSearchPhase}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-400 hover:to-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        お題へ進む
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                  <form onSubmit={handlePuzzleSubmit} className="flex flex-col gap-3">
                    <label className="text-sm text-slate-400">謎の答えを入力してください</label>
                    <input 
                      type="text" 
                      value={puzzleInput}
                      onChange={(e) => setPuzzleInput(e.target.value)}
                      className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="こたえ"
                    />
                    <button 
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
                    >
                      回答する
                    </button>
                  </form>
                  )
                ) : (
                  <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
                    <label className="text-sm text-amber-400 font-semibold">フィールドからお題を探そう！</label>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="text-xs text-slate-400 mb-1 block">場所 (A〜L)</span>
                          <select
                            value={searchLocation}
                            onChange={(e) => {
                              setSearchLocation(e.target.value);
                              setSearchItem('');
                            }}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 appearance-none"
                          >
                            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                        <div className="flex-1">
                          <span className="text-xs text-slate-400 mb-1 block">基準となるアイテム名</span>
                          <select
                            value={searchItem}
                            onChange={(e) => setSearchItem(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 appearance-none"
                          >
                            <option value="">選択してください</option>
                            {getAvailableItemsForLocation(searchLocation).map(item => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 mb-1 block">基準となるアイテムのどこにある？</span>
                        <select
                          value={searchPosition}
                          onChange={(e) => setSearchPosition(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 appearance-none"
                        >
                          {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>


                    <button 
                      type="submit"
                      className="mt-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-amber-500 hover:to-orange-500 active:scale-95 transition-all"
                    >
                      特定する
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="p-4 h-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-bold text-center text-white mb-2">館内マップ</h2>

            {/* Memo Area */}
            {discoveredMemos.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <h3 className="text-emerald-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  判明した情報
                </h3>
                <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                  {discoveredMemos.map((memo, i) => (
                    <li key={i}>{memo}</li>
                  ))}
                </ul>
              </div>
            )}

            <div 
              className="bg-slate-800 rounded-xl p-2 border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors group relative"
              onClick={() => setZoomedImage('/images/map1f.png')}
            >
              <h3 className="text-center text-sm text-slate-400 mb-2">1F</h3>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                <Image src="/images/map1f.png" alt="Map 1F" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute bottom-4 right-4 bg-black/50 rounded-full p-1.5 backdrop-blur-sm pointer-events-none text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
            <div 
              className="bg-slate-800 rounded-xl p-2 border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors group relative"
              onClick={() => setZoomedImage('/images/map2f.png')}
            >
              <h3 className="text-center text-sm text-slate-400 mb-2">2F</h3>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                <Image src="/images/map2f.png" alt="Map 2F" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute bottom-4 right-4 bg-black/50 rounded-full p-1.5 backdrop-blur-sm pointer-events-none text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="p-4 h-full animate-in fade-in zoom-in-95 duration-300 flex flex-col">
            <h2 className="text-xl font-bold text-center text-white mb-2">フィールド写真</h2>
            <p className="text-sm text-slate-400 mb-4 text-center">探索して見つけた場所の写真です。</p>
            
            {/* 相棒と話すボタン（リスト上部） */}
            {(() => {
              const availablePartnerEvents = currentStep.partnerEvents?.filter(e => unlockedPhotos.includes(e.targetPhoto)) || [];
              if (availablePartnerEvents.length === 0) return null;
              
              return (
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {availablePartnerEvents.map(event => (
                    <button 
                      key={event.targetPhoto}
                      onClick={(e) => handlePartnerClick(event.message, e)}
                      className="bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg border border-indigo-400/50 flex items-center gap-1.5 backdrop-blur-sm animate-pulse transition-all active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      写真{event?.displayPhotoName ?? event.targetPhoto}について話す
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Partner Message Area (in Photos Tab) */}
            {(() => {
              if (!activePartnerMessage) return null;
              const activeEvent = currentStep.partnerEvents?.find(e => e.message === activePartnerMessage);
              const qKey = activeEvent ? `${currentStepId}_${activeEvent.targetPhoto}` : '';
              const isSolved = qKey && solvedPartnerQuestions.includes(qKey);
              const hasQuestion = activeEvent && activeEvent.questionAnswer;

              return (
                <div className="mb-4 shrink-0 bg-indigo-900/60 rounded-2xl rounded-tl-none p-4 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-in slide-in-from-top-2 fade-in duration-300 relative">
                  <button 
                    onClick={() => setActivePartnerMessage(null)}
                    className="absolute top-2 right-2 text-indigo-300 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold shadow-inner">相</div>
                    <span className="text-indigo-300 text-xs font-bold">相棒</span>
                  </div>
                  
                  <p className="text-white text-sm leading-relaxed">
                    {isSolved && activeEvent?.questionAnswer?.successMessage 
                      ? activeEvent.questionAnswer.successMessage 
                      : activePartnerMessage
                    }
                  </p>

                  {hasQuestion && !isSolved && (
                    <div className="mt-3 pt-3 border-t border-indigo-500/30 flex flex-col gap-2">
                      <span className="text-xs text-indigo-300 font-semibold">回答を入力してください</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={partnerAnswerInput}
                          onChange={(e) => setPartnerAnswerInput(e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                          placeholder="答え"
                        />
                        <button
                          onClick={() => {
                            if (partnerAnswerInput.trim() === activeEvent.questionAnswer!.answer) {
                              setSolvedPartnerQuestions(prev => [...prev, qKey]);
                              setPartnerAnswerError('');
                              alert(`正解！アイテム「${activeEvent.questionAnswer!.unlockItem}」が ${activeEvent.questionAnswer!.unlockLocation} の選択肢に追加されました！`);
                            } else {
                              setPartnerAnswerError('答えが違います。');
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                        >
                          回答
                        </button>
                      </div>
                      {partnerAnswerError && (
                        <span className="text-xs text-red-400 font-medium">{partnerAnswerError}</span>
                      )}
                    </div>
                  )}

                  {isSolved && hasQuestion && (
                    <div className="mt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      解答済み（選択肢「{activeEvent.questionAnswer!.unlockItem}」が解放されました）
                    </div>
                  )}
                </div>
              );
            })()}
            
            <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4 no-scrollbar">
              {unlockedPhotos.map(photo => {
                const isNew = newPhotos.includes(photo);
                const currentFilename = photoFiles[photo] || photo;
                return (
                  <div
                    key={photo}
                    className={`relative rounded-xl overflow-hidden aspect-square bg-slate-800 border-2 cursor-pointer transition-all duration-300 group hover:opacity-90 ${isNew ? 'border-amber-500 animate-[pulse-border_2s_ease-in-out_infinite]' : 'border-slate-700 hover:border-slate-500'}`}
                    onClick={() => {
                      setZoomedImage(`/images/${currentFilename}.png`);
                      if (currentStepId === 0 && photo === 'A' && !showedPuzzleDialog) {
                        setShowPuzzleDialogAfterZoom(true);
                      }
                    }}
                  >
                    <Image 
                      src={`/images/${currentFilename}.png`} 
                      alt={`Location ${photo}`} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {isNew && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-[pulse_1s_ease-in-out_infinite]">
                        NEW
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                      <p className="text-center text-white font-bold text-sm">{photo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="p-4 h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-bold text-center text-white mb-4">過去の記録</h2>
            <div className="flex flex-col gap-4">
              {GAME_STEPS.filter(s => s.id < currentStepId).map(step => (
                <div key={step.id} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                  <h3 className="font-bold text-blue-400 border-b border-slate-700 pb-1 mb-2">{step.title}</h3>
                  <div className="flex gap-3">
                    <div 
                      className="relative w-20 h-20 bg-black rounded-lg overflow-hidden shrink-0 cursor-pointer border border-slate-600 hover:opacity-80 transition-opacity"
                      onClick={() => setZoomedImage(step.puzzleImage)}
                    >
                      <Image src={step.puzzleImage} alt={step.title} fill className="object-contain" />
                      <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-0.5 text-white/80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm flex-1">
                      <div>
                        <span className="text-slate-500 text-xs block">謎の答え</span>
                        <span className="text-slate-200">{step.puzzleAnswer}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block">お題</span>
                        <span className="text-slate-200">{step.themeText}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block">特定したアイテム</span>
                        <span className="text-slate-200">場所{step.searchTarget.location} ({step.searchTarget.position}): {step.searchTarget.item}</span>
                      </div>
                    </div>
                  </div>
                  {/* 相棒との会話履歴 */}
                  {step.partnerEvents?.map(event => 
                    readPartnerMessages.includes(event.message) && (
                      <div key={event.message} className="mt-3 bg-indigo-900/40 p-2.5 rounded-xl rounded-tl-none border border-indigo-500/30 text-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[8px] font-bold">相</div>
                          <span className="text-indigo-400 font-bold text-xs">相棒</span>
                        </div>
                        <span className="text-indigo-100 text-xs">{event.message}</span>
                      </div>
                    )
                  )}
                </div>
              ))}
              {GAME_STEPS.filter(s => s.id < currentStepId).length === 0 && (
                <div className="text-center text-slate-500 text-sm mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  まだクリアしたステップがありません。
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full glass-panel flex justify-around items-center h-16 pb-safe z-20">
        <button 
          onClick={() => setActiveTab('main')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'main' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-medium">メイン</span>
        </button>

        <button 
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'map' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-[10px] font-medium whitespace-nowrap">マップ＆メモ</span>
        </button>

        <button 
          onClick={() => setActiveTab('photos')}
          className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'photos' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {newPhotos.length > 0 && activeTab !== 'photos' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-slate-900"></span>
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">写真</span>
        </button>

        <button 
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'log' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-medium">ログ</span>
        </button>
      </nav>
      
      {/* Tutorial Dialog */}
      {tutorialDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setTutorialDialog(null)}
        >
          <div
            className="bg-slate-800 border-2 border-blue-500/50 rounded-2xl p-6 max-w-xs mx-4 shadow-2xl animate-in scale-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {tutorialDialog === 'tutorial_photos' && (
              <>
                <div className="mb-4">
                  <p className="text-slate-100 text-base leading-relaxed">
                    写真タブを確認してみよう。謎に登場したイラストが可視化されたことが確認できるぞ！
                  </p>
                </div>
                <button
                  onClick={() => setTutorialDialog(null)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2 rounded-lg hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
                >
                  OK
                </button>
              </>
            )}
            {tutorialDialog === 'start_puzzle' && (
              <>
                <div className="mb-4">
                  <p className="text-slate-100 text-base leading-relaxed">
                    それではメインタブの謎を解こう！
                  </p>
                </div>
                <button
                  onClick={() => setTutorialDialog(null)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2 rounded-lg hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
                >
                  OK
                </button>
              </>
            )}
            {tutorialDialog === 'tutorial_search' && (
              <>
                <div className="mb-4">
                  <p className="text-slate-100 text-base leading-relaxed">
                    お題に合うアイテムは見えない状態だ。今見えているものから推測して、そのアイテムの場所を指定しよう
                  </p>
                </div>
                <button
                  onClick={() => setTutorialDialog(null)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2 rounded-lg hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
                >
                  OK
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setZoomedImage(null);
            if (showPuzzleDialogAfterZoom) {
              setTutorialDialog('start_puzzle');
              setShowedPuzzleDialog(true);
              setShowPuzzleDialogAfterZoom(false);
            }
          }}
        >
          <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center p-4">
            <button
              className="absolute top-4 right-4 z-50 bg-slate-800/80 text-white rounded-full p-2 hover:bg-slate-700 transition-colors border border-slate-600"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImage(null);
                if (showPuzzleDialogAfterZoom) {
                  setTutorialDialog('start_puzzle');
                  setShowedPuzzleDialog(true);
                  setShowPuzzleDialogAfterZoom(false);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <Image 
                src={zoomedImage} 
                alt="拡大画像" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
