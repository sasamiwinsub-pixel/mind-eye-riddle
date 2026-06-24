'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { BONUS_STEP_SUBMISSIONS, FINAL_STEP_SUBMISSIONS, GAME_STEPS, LAST_STEP_START_PHOTO_UPDATE, LAST_STEP_SUBMISSIONS, LOCATIONS, POSITIONS, type LastStepSubmissionData } from '@/constants/gameData';
import { loadSavedSession, saveGameProgress } from '@/lib/gameProgressStorage';

type Tab = 'main' | 'map' | 'photos' | 'log';
type CutInSpeaker = '相棒' | '自分' | 'ゲームマスター';
type CutInLine = {
  speaker: CutInSpeaker;
  text: string;
};
type FinalSubmission = {
  location: string;
  position: string;
  item: string;
  specifiedName: string;
};
type PendingCutIn = {
  lines: CutInLine[];
  stepIndex: number;
  skipLog?: boolean;
};
type SavedGameProgress = {
  currentStepId: number;
  phase: 'puzzle' | 'search';
  activeTab: Tab;
  searchLocation: string;
  searchPosition: string;
  searchItem: string;
  isFollowUpPuzzle: boolean;
  lastStep: 0 | 1 | 2 | 3;
  lastStepOneName: string;
  hotSpringAnswer: string;
  lastStepOneAnswerLog: string | null;
  lastStepTwoAnswerLog: string | null;
  finalSphereAnswer?: string;
  isGameCleared: boolean;
  finalSubmissions: FinalSubmission[];
  showCorrectOverlay: boolean;
  isRulesInfoUnlocked: boolean;
  isAdditionalRuleUnlocked: boolean;
  isSingleVisualizationRuleUnlocked: boolean;
  isResubmissionRuleUnlocked: boolean;
  showRulesInfoPrompt: boolean;
  hasShownStepOSearchHint: boolean;
  isStepOSearchSolved: boolean;
  stepOSearchHintStartedAt: number | null;
  tabGuideStep: 'photos' | 'photoA' | 'map' | null;
  hasStartedTabGuide: boolean;
  isPuzzleSolvedPending: boolean;
  isImageCollapsed: boolean;
  readPartnerMessages: string[];
  unlockedPhotos: string[];
  photoFiles: Record<string, string>;
  newPhotos: string[];
  photoTabHasUnreadUpdate?: boolean;
  cutInLines: CutInLine[];
  cutInIndex: number;
  pendingCutIn: PendingCutIn | null;
  applyLastStepPhotoUpdateAfterCutIn: boolean;
  unlockSingleVisualizationRuleAfterCutIn: boolean;
  cutInLogByStep: Record<number, CutInLine[]>;
  solvedPartnerQuestions: string[];
};

const CUT_IN_LINES = {
  tutorialStart: [
    { speaker: '相棒', text: '立山君、聞こえる？' },
    { speaker: '相棒', text: '今は何もない真っ白の空間なんだけど、これからゲーム開始みたいだね' },
    { speaker: 'ゲームマスター', text: 'ただいまよりゲームのチュートリアルを開始します。まずはこの謎を解いてください' },
  ],
  tutorialPuzzleSolved: [
    { speaker: '相棒', text: '僕が幽体離脱で見に行くと、自動でそっちに写真が送られるみたいだ。逐一送るようにするよ' },
  ],
  stepOnePuzzleStart: [
    { speaker: '相棒', text: 'まずは謎からだね' },
  ],
  stepOnePuzzleSolved: [
    { speaker: '相棒', text: '次は提出写真を確認して、見えないものを想像しよう' },
  ],
  stepUSearchSolved: [
    { speaker: '相棒', text: '直接ライオンの銅像って提出はできないんだね' },
  ],
  stepEPuzzleSolved: [
    { speaker: 'ゲームマスター', text: '追加情報です。謎の回答が青くなった場合、イラストに登場していなくても可視化できる状態となったことを示します。なお、青くなる条件はゲームフィールドに存在していることです' },
  ],
  stepESearchSolved: [
    { speaker: '相棒', text: '卵ごと提出しても、中に正解のアイテムを含んでいれば判定されるってことだね' },
  ],
  stepOSearchHint: [
    { speaker: '相棒', text: 'うーん...。' },
    { speaker: '相棒', text: 'Fのパックの中身が球体っぽいね。中身は良くわからないけどこれしかなさそう' },
  ],
  stepOSearchSolved: [
    { speaker: '相棒', text: '正解みたいだね。どういう球体なんだろう' },
    { speaker: 'ゲームマスター', text: 'ここで補足情報ですが、種類・大きさ・名称の全て一致するものがある場合、一つしか可視化されません' },
  ],
  stepKiFirstPuzzleSolved: [
    { speaker: '相棒', text: 'ひょっとして、今まで登場したアイテム的にこっちのが適切なんじゃない？' },
    { speaker: '相棒', text: '～～～。今伝えた通りに謎に変化を加えたとき、読み方が変わるアイテムを答えてみて' },
  ],
  lastStepStart: [
    { speaker: '相棒', text: 'あと一つ提出するだけだ！' },
    { speaker: 'ゲームマスター', text: '残念ですが、提出場所「お」は数秒間正解判定となったもののすぐに不正解判定へ変わっております。全ての提出場所が安定して正解判定となることが成功条件です' },
    { speaker: '相棒', text: '何だって！？謎の球体が変化したの...か？ひとまず「お」の場所を再確認しよう' },
    { speaker: 'ゲームマスター', text: '「お」も後で再提出してもらうため、残り二つです。最後のお題「蜘蛛」の提出場所は「あ」～「き」のいずれか好きな場所で構いません' },
    { speaker: 'ゲームマスター', text: 'しかし、Fの8個ある球体の中の一つにしか蜘蛛は存在せず、現状一度の提出で正解することは不可能です'},
    { speaker: '相棒', text: 'ならどうすればいいんだ？' },
    { speaker: 'ゲームマスター', text: 'そこで、「外」の選択肢を解放してあげましょう。ただし、提出後に謎の球体が何かを最後に当ててもらいます' },
    { speaker: 'ゲームマスター', text: '提出場所で一カ所しかない温泉の場所が分からなければ、クリアすることはできないでしょう' },
    { speaker: '相棒', text: 'なんか意外と親切なゲームマスターだな。ひとまず温泉の場所を特定しよう' },

  ],
  lastStepTwoStart:[
    { speaker: '相棒', text: 'じゃあ、蜘蛛を提出してみよう！' },
    { speaker: '相棒', text: 'しかし、「パック」の「中」という指定では、ランダムに一つ謎の球体が選ばれて蜘蛛が当たるか分からないな' },
    { speaker: '相棒', text: '一度で確実に蜘蛛が提出される指定の仕方をしよう' },
  ],
  // lastStepTwoStart: [
  //   { speaker: '相棒', text: 'まさか募金箱のお金を移動させるなんて...。立山君はこういう時に頼もしいけど、友人の横山としては倫理観が心配だね' },
  //   { speaker: 'ゲームマスター', text: 'ご安心ください。元々空の募金箱に2枚の硬貨、11円を事前に募金をしておきました。窃盗には当たらないのでご安心を' },
  //   { speaker: '相棒', text: 'なら、大丈夫か。あ、君に負けじと一つやってみたいことをしても良いかい？' },
  //   { speaker: '相棒', text: '実は提出時以外で一度だけ転送をさせる権利が僕に与えられていたんだけど、その権利をここで行使したい' },
  //   { speaker: '相棒', text: '僕の予想だと提出場所のどこかが温泉だと思うのだけど、温泉だと思う場所に一度球体として提出したものを転送してみたいんだ' },
  // ],
  // 最後に玉と謎の球体の回答でLAST3
  // おまけでゲームマスターが疑われるのを防ぐ目的で延長戦へ
  lastStepThreeStart: [
    { speaker: '相棒', text: '「お」の温泉に提出してみたけど、すぐに蜘蛛のフィギュアが出てきたね' },
    { speaker: '相棒', text: 'どうやらFにある謎の球体、温泉に反応して球体が消えていくようだ。徐々にフィギュアが見えてきたので間違いない' },
  ],
  bonusStart: [
    { speaker: '相棒', text: '相棒は気づいていたみたいだけど、ずいぶんと助けてくれたみたいだね。ゲームマスター？' },
    { speaker: 'ゲームマスター', text: '気づいていましたか。実はお題をいくつか消して選択肢を解放したり、少々肩入れをしすぎたので、後で疑われてしまうかもしれません' },
    { speaker: '相棒', text: 'うーん、どうする相棒？削ったお題も出してもらって、疑いの眼を向けられないようにしてあげる？' },
    { speaker: 'ゲームマスター', text: 'ありがたい申し出ですが、何も手助けできないですよ？' },
  ],
} satisfies Record<string, CutInLine[]>;

const getLastStepLogIndex = (step: 1 | 2 | 3) => GAME_STEPS.length + step - 1;
const getBonusStepLogIndex = (step: 1 | 2) => GAME_STEPS.length + 3 + step;

const highlightedCutInText = 'まさか募金箱のお金を移動させるなんて...。立山君はこういう時に頼もしいけど、友人の横山としては倫理観が心配だね';

const renderCutInText = (text: string) => {
  if (text !== highlightedCutInText) return text;

  return text.split(/(立山|横山)/g).map((part, index) => (
    part === '立山' || part === '横山'
      ? <span key={`${part}-${index}`} className="font-black text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]">{part}</span>
      : part
  ));
};

const normalizeTextAnswer = (value: string) => value
  .normalize('NFKC')
  .trim()
  .toLowerCase()
  .replace(/[\s　]+/g, '')
  .replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60));

const matchesTextAnswer = (input: string, answers: string[]) => {
  const normalizedInput = normalizeTextAnswer(input);
  return answers.some(answer => normalizeTextAnswer(answer) === normalizedInput);
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const isStringArray = (value: unknown): value is string[] => (
  Array.isArray(value) && value.every(item => typeof item === 'string')
);

const isCutInLine = (value: unknown): value is CutInLine => (
  isRecord(value)
  && (value.speaker === '相棒' || value.speaker === '自分' || value.speaker === 'ゲームマスター')
  && typeof value.text === 'string'
);

const isCutInLines = (value: unknown): value is CutInLine[] => (
  Array.isArray(value) && value.every(isCutInLine)
);

const isFinalSubmission = (value: unknown): value is FinalSubmission => (
  isRecord(value)
  && typeof value.location === 'string'
  && typeof value.position === 'string'
  && typeof value.item === 'string'
  && typeof value.specifiedName === 'string'
);

const isSavedGameProgress = (value: unknown): value is SavedGameProgress => {
  if (!isRecord(value)) return false;

  const validPendingCutIn = value.pendingCutIn === null || (
    isRecord(value.pendingCutIn)
    && isCutInLines(value.pendingCutIn.lines)
    && typeof value.pendingCutIn.stepIndex === 'number'
    && (value.pendingCutIn.skipLog === undefined || typeof value.pendingCutIn.skipLog === 'boolean')
  );
  const validPhotoFiles = isRecord(value.photoFiles)
    && Object.values(value.photoFiles).every(filename => typeof filename === 'string');
  const validCutInLog = isRecord(value.cutInLogByStep)
    && Object.values(value.cutInLogByStep).every(isCutInLines);
  const validTabGuide = value.tabGuideStep === null
    || value.tabGuideStep === 'photos'
    || value.tabGuideStep === 'photoA'
    || value.tabGuideStep === 'map';

  return (
    typeof value.currentStepId === 'number'
    && GAME_STEPS.some(step => step.id === value.currentStepId)
    && (value.phase === 'puzzle' || value.phase === 'search')
    && (value.activeTab === 'main' || value.activeTab === 'map' || value.activeTab === 'photos' || value.activeTab === 'log')
    && typeof value.searchLocation === 'string'
    && typeof value.searchPosition === 'string'
    && typeof value.searchItem === 'string'
    && typeof value.isFollowUpPuzzle === 'boolean'
    && (value.lastStep === 0 || value.lastStep === 1 || value.lastStep === 2 || value.lastStep === 3)
    && typeof value.lastStepOneName === 'string'
    && typeof value.hotSpringAnswer === 'string'
    && (value.lastStepOneAnswerLog === null || typeof value.lastStepOneAnswerLog === 'string')
    && (value.lastStepTwoAnswerLog === null || typeof value.lastStepTwoAnswerLog === 'string')
    && (value.finalSphereAnswer === undefined || typeof value.finalSphereAnswer === 'string')
    && typeof value.isGameCleared === 'boolean'
    && Array.isArray(value.finalSubmissions)
    && (
      value.finalSubmissions.length === FINAL_STEP_SUBMISSIONS.length
      || value.finalSubmissions.length === 2
      || value.finalSubmissions.length === 8
    )
    && value.finalSubmissions.every(isFinalSubmission)
    && typeof value.showCorrectOverlay === 'boolean'
    && typeof value.isRulesInfoUnlocked === 'boolean'
    && typeof value.isAdditionalRuleUnlocked === 'boolean'
    && typeof value.isSingleVisualizationRuleUnlocked === 'boolean'
    && typeof value.isResubmissionRuleUnlocked === 'boolean'
    && typeof value.showRulesInfoPrompt === 'boolean'
    && typeof value.hasShownStepOSearchHint === 'boolean'
    && typeof value.isStepOSearchSolved === 'boolean'
    && (value.stepOSearchHintStartedAt === null || typeof value.stepOSearchHintStartedAt === 'number')
    && validTabGuide
    && typeof value.hasStartedTabGuide === 'boolean'
    && typeof value.isPuzzleSolvedPending === 'boolean'
    && typeof value.isImageCollapsed === 'boolean'
    && isStringArray(value.readPartnerMessages)
    && isStringArray(value.unlockedPhotos)
    && validPhotoFiles
    && isStringArray(value.newPhotos)
    && (value.photoTabHasUnreadUpdate === undefined || typeof value.photoTabHasUnreadUpdate === 'boolean')
    && isCutInLines(value.cutInLines)
    && typeof value.cutInIndex === 'number'
    && Number.isInteger(value.cutInIndex)
    && value.cutInIndex >= 0
    && (value.cutInLines.length === 0 ? value.cutInIndex === 0 : value.cutInIndex < value.cutInLines.length)
    && validPendingCutIn
    && typeof value.applyLastStepPhotoUpdateAfterCutIn === 'boolean'
    && typeof value.unlockSingleVisualizationRuleAfterCutIn === 'boolean'
    && validCutInLog
    && isStringArray(value.solvedPartnerQuestions)
  );
};

const createInitialSubmissions = (targets: LastStepSubmissionData[]): FinalSubmission[] => (
  targets.map(submission => {
    const originalStep = GAME_STEPS[submission.stepIndex];
    const isSameAsOriginal = !submission.isPending
      && submission.originalSubmittedItem === submission.retryItem;
    const unchangedTarget = submission.acceptedTargets[0];

    return {
      location: isSameAsOriginal ? unchangedTarget.location : originalStep.searchTarget.location,
      position: isSameAsOriginal ? unchangedTarget.position : originalStep.searchTarget.position,
      item: isSameAsOriginal ? unchangedTarget.item : '',
      specifiedName: isSameAsOriginal ? submission.retryItem : '',
    };
  })
);


export default function GameInterface() {
  const [currentStepId, setCurrentStepId] = useState(0);
  const [phase, setPhase] = useState<'puzzle' | 'search'>('puzzle');
  const [activeTab, setActiveTab] = useState<Tab>('main');

  // 入力状態
  const [puzzleInput, setPuzzleInput] = useState('');
  const [searchLocation, setSearchLocation] = useState(LOCATIONS[0]);
  const [searchPosition, setSearchPosition] = useState(POSITIONS[0]);
  const [searchItem, setSearchItem] = useState('');
  const [isFollowUpPuzzle, setIsFollowUpPuzzle] = useState(false);
  const [lastStep, setLastStep] = useState<0 | 1 | 2 | 3>(0);
  const [lastStepOneName, setLastStepOneName] = useState('');
  const [hotSpringAnswer, setHotSpringAnswer] = useState('');
  const [lastStepOneAnswerLog, setLastStepOneAnswerLog] = useState<string | null>(null);
  const [lastStepTwoAnswerLog, setLastStepTwoAnswerLog] = useState<string | null>(null);
  const [finalSphereAnswer, setFinalSphereAnswer] = useState('');
  const [isGameCleared, setIsGameCleared] = useState(false);
  const [finalSubmissions, setFinalSubmissions] = useState<FinalSubmission[]>(() => createInitialSubmissions(FINAL_STEP_SUBMISSIONS));
  const [showBonus, setShowBonus] = useState(false);
  const [bonusStep, setBonusStep] = useState<1 | 2>(1);
  const [bonusLastStepOneName, setBonusLastStepOneName] = useState('');
  const [bonusIndex, setBonusIndex] = useState(0);
  const [bonusSubmissions, setBonusSubmissions] = useState<FinalSubmission[]>(() => createInitialSubmissions(BONUS_STEP_SUBMISSIONS));
  const [bonusMessage, setBonusMessage] = useState('');
  const [showBonusChoice, setShowBonusChoice] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [showCorrectOverlay, setShowCorrectOverlay] = useState(false);
  const [showRulesInfo, setShowRulesInfo] = useState(false);
  const [isRulesInfoUnlocked, setIsRulesInfoUnlocked] = useState(false);
  const [isAdditionalRuleUnlocked, setIsAdditionalRuleUnlocked] = useState(false);
  const [isSingleVisualizationRuleUnlocked, setIsSingleVisualizationRuleUnlocked] = useState(false);
  const [isResubmissionRuleUnlocked, setIsResubmissionRuleUnlocked] = useState(false);
  const [showRulesInfoPrompt, setShowRulesInfoPrompt] = useState(false);
  const [hasShownStepOSearchHint, setHasShownStepOSearchHint] = useState(false);
  const [isStepOSearchSolved, setIsStepOSearchSolved] = useState(false);
  const [stepOSearchHintStartedAt, setStepOSearchHintStartedAt] = useState<number | null>(null);
  const [tabGuideStep, setTabGuideStep] = useState<'photos' | 'photoA' | 'map' | null>(null);
  const [hasStartedTabGuide, setHasStartedTabGuide] = useState(false);

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
  const [photoTabHasUnreadUpdate, setPhotoTabHasUnreadUpdate] = useState(
    GAME_STEPS[0].unlockedPhotos.length > 0,
  );

  const [cutInLines, setCutInLines] = useState<CutInLine[]>(CUT_IN_LINES.tutorialStart);
  const [cutInIndex, setCutInIndex] = useState(0);
  const [pendingCutIn, setPendingCutIn] = useState<PendingCutIn | null>(null);
  const [applyLastStepPhotoUpdateAfterCutIn, setApplyLastStepPhotoUpdateAfterCutIn] = useState(false);
  const [unlockSingleVisualizationRuleAfterCutIn, setUnlockSingleVisualizationRuleAfterCutIn] = useState(false);
  const [cutInLogByStep, setCutInLogByStep] = useState<Record<number, CutInLine[]>>({
    0: CUT_IN_LINES.tutorialStart,
  });
  const [selectedCutInLogStep, setSelectedCutInLogStep] = useState<number | null>(null);

  // 相棒クイズ解答状態
  const [solvedPartnerQuestions, setSolvedPartnerQuestions] = useState<string[]>([]);
  const [partnerAnswerInput, setPartnerAnswerInput] = useState('');
  const [partnerAnswerError, setPartnerAnswerError] = useState('');
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  
  const currentStepIndex = Math.max(GAME_STEPS.findIndex(s => s.id === currentStepId), 0);
  const currentStep = GAME_STEPS[currentStepIndex];
  const activePuzzleImage = isFollowUpPuzzle && currentStep.followUpPuzzle
    ? currentStep.followUpPuzzle.image
    : currentStep.puzzleImage;
  const activePuzzleAnswer = isFollowUpPuzzle && currentStep.followUpPuzzle
    ? currentStep.followUpPuzzle.answer
    : currentStep.puzzleAnswer;
  const activePuzzleAnswers = isFollowUpPuzzle && currentStep.followUpPuzzle
    ? [currentStep.followUpPuzzle.answer, ...(currentStep.followUpPuzzle.acceptedAnswers || [])]
    : [currentStep.puzzleAnswer, ...(currentStep.acceptedPuzzleAnswers || [])];
  const displayTitle = lastStep > 0 ? `LASTSTEP${lastStep}` : currentStep.title;
  const reachedSteps = GAME_STEPS.slice(0, currentStepIndex + 1);
  const finalSubmissionTargets = FINAL_STEP_SUBMISSIONS;
  const lastStepTwoPositions = [...POSITIONS, '外'];

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const savedGame = loadSavedSession()?.game;
      if (isSavedGameProgress(savedGame)) {
        setCurrentStepId(savedGame.currentStepId);
        setPhase(savedGame.phase);
        setActiveTab(savedGame.activeTab);
        setSearchLocation(savedGame.searchLocation);
        setSearchPosition(savedGame.searchPosition);
        setSearchItem(savedGame.searchItem);
        setIsFollowUpPuzzle(savedGame.isFollowUpPuzzle);
        setLastStep(savedGame.lastStep);
        setLastStepOneName(savedGame.lastStepOneName);
        setHotSpringAnswer(savedGame.hotSpringAnswer);
        setLastStepOneAnswerLog(savedGame.lastStepOneAnswerLog);
        setLastStepTwoAnswerLog(savedGame.lastStepTwoAnswerLog);
        setFinalSphereAnswer(savedGame.finalSphereAnswer ?? '');
        setIsGameCleared(savedGame.isGameCleared);
        setFinalSubmissions(
          savedGame.finalSubmissions.length === FINAL_STEP_SUBMISSIONS.length
            ? savedGame.finalSubmissions
            : savedGame.finalSubmissions.length === 2
              ? [savedGame.finalSubmissions[0]]
            : [savedGame.finalSubmissions[4], savedGame.finalSubmissions[7]],
        );
        setShowCorrectOverlay(savedGame.showCorrectOverlay);
        setIsRulesInfoUnlocked(savedGame.isRulesInfoUnlocked);
        setIsAdditionalRuleUnlocked(savedGame.isAdditionalRuleUnlocked);
        setIsSingleVisualizationRuleUnlocked(savedGame.isSingleVisualizationRuleUnlocked);
        setIsResubmissionRuleUnlocked(savedGame.isResubmissionRuleUnlocked);
        setShowRulesInfoPrompt(savedGame.showRulesInfoPrompt);
        setHasShownStepOSearchHint(savedGame.hasShownStepOSearchHint);
        setIsStepOSearchSolved(savedGame.isStepOSearchSolved);
        setStepOSearchHintStartedAt(savedGame.stepOSearchHintStartedAt);
        setTabGuideStep(savedGame.tabGuideStep);
        setHasStartedTabGuide(savedGame.hasStartedTabGuide);
        setIsPuzzleSolvedPending(savedGame.isPuzzleSolvedPending);
        setIsImageCollapsed(savedGame.isImageCollapsed);
        setReadPartnerMessages(savedGame.readPartnerMessages);
        setUnlockedPhotos(savedGame.unlockedPhotos);
        setPhotoFiles(savedGame.photoFiles);
        setNewPhotos(savedGame.newPhotos);
        setPhotoTabHasUnreadUpdate(
          savedGame.photoTabHasUnreadUpdate
            ?? (savedGame.newPhotos.length > 0 && savedGame.activeTab !== 'photos'),
        );
        setCutInLines(savedGame.cutInLines);
        setCutInIndex(savedGame.cutInIndex);
        setPendingCutIn(savedGame.pendingCutIn);
        setApplyLastStepPhotoUpdateAfterCutIn(savedGame.applyLastStepPhotoUpdateAfterCutIn);
        setUnlockSingleVisualizationRuleAfterCutIn(savedGame.unlockSingleVisualizationRuleAfterCutIn);
        setCutInLogByStep(savedGame.cutInLogByStep);
        setSolvedPartnerQuestions(savedGame.solvedPartnerQuestions);
      }
      setHasRestoredProgress(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!hasRestoredProgress) return;

    saveGameProgress({
      currentStepId,
      phase,
      activeTab,
      searchLocation,
      searchPosition,
      searchItem,
      isFollowUpPuzzle,
      lastStep,
      lastStepOneName,
      hotSpringAnswer,
      lastStepOneAnswerLog,
      lastStepTwoAnswerLog,
      finalSphereAnswer,
      isGameCleared,
      finalSubmissions,
      showCorrectOverlay,
      isRulesInfoUnlocked,
      isAdditionalRuleUnlocked,
      isSingleVisualizationRuleUnlocked,
      isResubmissionRuleUnlocked,
      showRulesInfoPrompt,
      hasShownStepOSearchHint,
      isStepOSearchSolved,
      stepOSearchHintStartedAt,
      tabGuideStep,
      hasStartedTabGuide,
      isPuzzleSolvedPending,
      isImageCollapsed,
      readPartnerMessages,
      unlockedPhotos,
      photoFiles,
      newPhotos,
      photoTabHasUnreadUpdate,
      cutInLines,
      cutInIndex,
      pendingCutIn,
      applyLastStepPhotoUpdateAfterCutIn,
      unlockSingleVisualizationRuleAfterCutIn,
      cutInLogByStep,
      solvedPartnerQuestions,
    } satisfies SavedGameProgress);
  }, [
    activeTab,
    applyLastStepPhotoUpdateAfterCutIn,
    cutInIndex,
    cutInLines,
    cutInLogByStep,
    currentStepId,
    finalSubmissions,
    finalSphereAnswer,
    hasRestoredProgress,
    hasShownStepOSearchHint,
    hasStartedTabGuide,
    hotSpringAnswer,
    isAdditionalRuleUnlocked,
    isFollowUpPuzzle,
    isGameCleared,
    isImageCollapsed,
    isPuzzleSolvedPending,
    isResubmissionRuleUnlocked,
    isRulesInfoUnlocked,
    isSingleVisualizationRuleUnlocked,
    isStepOSearchSolved,
    lastStep,
    lastStepOneAnswerLog,
    lastStepOneName,
    lastStepTwoAnswerLog,
    newPhotos,
    pendingCutIn,
    phase,
    photoFiles,
    photoTabHasUnreadUpdate,
    readPartnerMessages,
    searchItem,
    searchLocation,
    searchPosition,
    showCorrectOverlay,
    showRulesInfoPrompt,
    solvedPartnerQuestions,
    stepOSearchHintStartedAt,
    tabGuideStep,
    unlockSingleVisualizationRuleAfterCutIn,
    unlockedPhotos,
  ]);

  useEffect(() => {
    if (!hasRestoredProgress) return;
    if (
      phase !== 'search'
      || currentStep.id !== 3
      || hasShownStepOSearchHint
      || isStepOSearchSolved
    ) return;

    if (stepOSearchHintStartedAt === null) {
      const initializeTimer = window.setTimeout(() => setStepOSearchHintStartedAt(Date.now()), 0);
      return () => window.clearTimeout(initializeTimer);
    }

    const remainingTime = Math.max(0, stepOSearchHintStartedAt + 20_000 - Date.now());
    const timerId = window.setTimeout(() => {
      setHasShownStepOSearchHint(true);
      setCutInLines(CUT_IN_LINES.stepOSearchHint);
      setCutInIndex(0);
      setCutInLogByStep(prev => ({
        ...prev,
        [currentStepIndex]: [...(prev[currentStepIndex] || []), ...CUT_IN_LINES.stepOSearchHint],
      }));
    }, remainingTime);

    return () => window.clearTimeout(timerId);
  }, [
    currentStep.id,
    currentStepIndex,
    hasRestoredProgress,
    hasShownStepOSearchHint,
    isStepOSearchSolved,
    phase,
    stepOSearchHintStartedAt,
  ]);

  const getPartnerEventKey = (stepId: number, eventIndex: number) => `${stepId}_${eventIndex}`;

  // これまでに判明した情報(memos)を取得
  const discoveredMemos = reachedSteps.flatMap(s => s.memos || []);

  // 選択可能なアイテムを累積・解放状況から取得する関数
  const getAvailableItemsForLocation = (loc: string) => {
    const items = new Set<string>();
    
    // 1. 各ステップ（現在のステップ含む）で解放されたアイテム
    reachedSteps.forEach(step => {
      if (step && step.unlockedLocationItems && step.unlockedLocationItems[loc]) {
        step.unlockedLocationItems[loc].forEach(item => items.add(item));
      }
    });
    
    // 2. 解答済みの相棒クイズによって解放されたアイテム
    reachedSteps.forEach(step => {
      if (step && step.partnerEvents) {
        step.partnerEvents.forEach((event, eventIndex) => {
          const qKey = getPartnerEventKey(step.id, eventIndex);
          if (solvedPartnerQuestions.includes(qKey) && event.questionAnswer) {
            if (event.questionAnswer.unlockLocation === loc) {
              items.add(event.questionAnswer.unlockItem);
            }
          }
        });
      }
    });
    
    return Array.from(items);
  };

  const closeRulesInfo = () => {
    setShowRulesInfo(false);
    if (isRulesInfoUnlocked && !hasStartedTabGuide) {
      setTabGuideStep('photos');
      setHasStartedTabGuide(true);
    }
  };

  const addCutInToLog = (lines: CutInLine[], stepIndex: number) => {
    setCutInLogByStep(prev => ({
      ...prev,
      [stepIndex]: [...(prev[stepIndex] || []), ...lines],
    }));
  };

  const setPhotoUpdateMarkers = (photos: string[]) => {
    setNewPhotos(photos);
    setPhotoTabHasUnreadUpdate(photos.length > 0);
  };

  const startCutIn = (lines: CutInLine[], stepIndex = currentStepIndex, addToLog = true) => {
    setCutInLines(lines);
    setCutInIndex(0);
    if (addToLog) addCutInToLog(lines, stepIndex);
  };

  const showCorrectThenCutIn = (
    lines: CutInLine[],
    stepIndex = currentStepIndex,
    logImmediately = false,
  ) => {
    if (logImmediately) addCutInToLog(lines, stepIndex);
    setPendingCutIn({ lines, stepIndex, skipLog: logImmediately });
    setShowCorrectOverlay(true);
  };

  const startLastStep = () => {
    setLastStep(1);
    setPhase('search');
    setIsPuzzleSolvedPending(false);
    setIsImageCollapsed(true);
    setActivePartnerMessage(null);
    setActiveTab('main');
    setErrorMsg('');
    setApplyLastStepPhotoUpdateAfterCutIn(true);
    showCorrectThenCutIn(CUT_IN_LINES.lastStepStart, getLastStepLogIndex(1));
  };

  const applyLastStepStartPhotoUpdate = () => {
    const newlyUnlocked = LAST_STEP_START_PHOTO_UPDATE.unlockedPhotos || [];
    const updatedPhotos = LAST_STEP_START_PHOTO_UPDATE.updatedPhotos || {};
    const newlyUpdated = Object.keys(updatedPhotos);

    setUnlockedPhotos(prev => Array.from(new Set([...prev, ...newlyUnlocked])));
    setPhotoFiles(prev => {
      const next = { ...prev };
      newlyUnlocked.forEach(photo => {
        if (!next[photo]) next[photo] = photo;
      });
      Object.entries(updatedPhotos).forEach(([photo, filename]) => {
        next[photo] = filename;
      });
      return next;
    });
    setPhotoUpdateMarkers([...newlyUnlocked, ...newlyUpdated]);
  };

  const closeCorrectOverlay = () => {
    setShowCorrectOverlay(false);
    if (pendingCutIn) {
      startCutIn(pendingCutIn.lines, pendingCutIn.stepIndex, !pendingCutIn.skipLog);
      setPendingCutIn(null);
    }
  };

  const advanceCutIn = () => {
    if (cutInIndex >= cutInLines.length - 1) {
      if (applyLastStepPhotoUpdateAfterCutIn) {
        applyLastStepStartPhotoUpdate();
        setApplyLastStepPhotoUpdateAfterCutIn(false);
      }
      if (unlockSingleVisualizationRuleAfterCutIn) {
        setIsSingleVisualizationRuleUnlocked(true);
        setShowRulesInfoPrompt(true);
        setUnlockSingleVisualizationRuleAfterCutIn(false);
      }
      if (showBonus && cutInLines === CUT_IN_LINES.bonusStart) {
        setShowBonusChoice(true);
      }
      setCutInLines([]);
      setCutInIndex(0);
      return;
    }
    setCutInIndex(cutInIndex + 1);
  };

  // ゲーム開始時にチュートリアルダイアログを表示
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
    if (currentStepIndex === 0) {
      setIsRulesInfoUnlocked(true);
      setShowRulesInfoPrompt(true);
      showCorrectThenCutIn(CUT_IN_LINES.tutorialPuzzleSolved, currentStepIndex);
    } else if (currentStepIndex === 1) {
      showCorrectThenCutIn(CUT_IN_LINES.stepOnePuzzleSolved, currentStepIndex);
    }

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

    setPhotoUpdateMarkers([...newlyUnlocked, ...newlyUnlockedAtTheme, ...newlyUpdated]);

    if (currentStepIndex === GAME_STEPS.length - 1) {
      startLastStep();
      return;
    }

  };

  const proceedAfterPuzzleSolved = () => {
    if (currentStep.followUpPuzzle && !isFollowUpPuzzle) {
      setIsPuzzleSolvedPending(false);
      setPuzzleInput('');
      setIsFollowUpPuzzle(true);
      return;
    }
    proceedToSearchPhase();
  };

  const handlePuzzleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchesTextAnswer(puzzleInput, activePuzzleAnswers)) {
      setErrorMsg('');
      if (currentStep.followUpPuzzle && !isFollowUpPuzzle) {
        setPuzzleInput('');
        if (currentStep.showBlueAnswerEffect) {
          setIsPuzzleSolvedPending(true);
        } else {
          setIsFollowUpPuzzle(true);
        }
        showCorrectThenCutIn(CUT_IN_LINES.stepKiFirstPuzzleSolved, currentStepIndex);
        return;
      }
      const shouldShowBlueAnswerEffect = isFollowUpPuzzle
        ? currentStep.followUpPuzzle?.showBlueAnswerEffect ?? currentStep.showBlueAnswerEffect
        : currentStep.showBlueAnswerEffect;
      if (shouldShowBlueAnswerEffect) {
        // 青ハイライト演出モード：一時停止してボタン表示
        setIsPuzzleSolvedPending(true);
        if (currentStep.id === 2) {
          setIsAdditionalRuleUnlocked(true);
          setShowRulesInfoPrompt(true);
          startCutIn(CUT_IN_LINES.stepEPuzzleSolved, currentStepIndex);
        }
      } else {
        proceedToSearchPhase();
      }
    } else {
      setErrorMsg('答えが違います。もう一度考えてみよう！');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acceptedTargets = [
      currentStep.searchTarget,
      ...(currentStep.acceptedSearchTargets || []),
    ];
    const isCorrectTarget = acceptedTargets.some(({ location, position, item }) => (
      searchLocation === location
      && searchPosition === position
      && searchItem.trim() === item
    ));
    const matchedIncorrectMessage = currentStep.incorrectSearchMessages?.find(({ location, position, item }) => (
      (location === undefined || searchLocation === location)
      && (position === undefined || searchPosition === position)
      && (item === undefined || searchItem.trim() === item)
    ));
    
    if (isCorrectTarget) {
      setErrorMsg('');
      setSearchItem('');
      if (currentStep.id === 3) {
        setIsStepOSearchSolved(true);
      }
      // 次のステップへ
      if (currentStepIndex < GAME_STEPS.length - 1) {
        const nextStep = GAME_STEPS[currentStepIndex + 1];
        setCurrentStepId(nextStep.id);
        setIsFollowUpPuzzle(false);
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
        setPhotoUpdateMarkers([...newlyUnlocked, ...newlyUpdated]);
        
        // メインタブに戻し、相棒のメッセージもリセットする
        setActivePartnerMessage(null);
        setActiveTab('main');
        if (currentStepIndex === 0) {
          showCorrectThenCutIn(CUT_IN_LINES.stepOnePuzzleStart, currentStepIndex + 1);
        }
        if (currentStepIndex === 2) {
          startCutIn(CUT_IN_LINES.stepUSearchSolved, currentStepIndex);
        }
        if (currentStep.id === 2) {
          startCutIn(CUT_IN_LINES.stepESearchSolved, currentStepIndex);
        }
        if (currentStep.id === 3) {
          setUnlockSingleVisualizationRuleAfterCutIn(true);
          startCutIn(CUT_IN_LINES.stepOSearchSolved, currentStepIndex);
        }
      } else {
        startLastStep();
      }
    } else {
      setErrorMsg(matchedIncorrectMessage?.message ?? '場所、位置、またはアイテム名が違います。');
    }
  };

  const updateFinalSubmission = (index: number, field: keyof FinalSubmission, value: string) => {
    setFinalSubmissions(prev => prev.map((submission, i) => {
      if (i !== index) return submission;
      return {
        ...submission,
        [field]: value,
        ...(field === 'location' ? { item: '' } : {}),
      };
    }));
  };

  const updateBonusSubmission = (field: keyof FinalSubmission, value: string) => {
    setBonusSubmissions(prev => prev.map((submission, index) => (
      index === bonusIndex
        ? { ...submission, [field]: value, ...(field === 'location' ? { item: '' } : {}) }
        : submission
    )));
    setBonusMessage('');
  };

  const handleLastStepTwoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchesTextAnswer(hotSpringAnswer, ['お'])) {
      setErrorMsg('');
      setLastStepTwoAnswerLog(`提出場所：${hotSpringAnswer}`);
      setHotSpringAnswer('');
      setLastStep(2);
      showCorrectThenCutIn(CUT_IN_LINES.lastStepTwoStart, getLastStepLogIndex(2));
      return;
    }
    setErrorMsg('温泉だと思う提出場所が違います。');
  };

  const handleLastStepSpiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      matchesTextAnswer(hotSpringAnswer, ['お'])
      && searchLocation === 'F'
      && searchItem === '蜘蛛'
      && searchPosition === '外'
    ) {
      setErrorMsg('');
      setLastStepOneAnswerLog(
        `提出場所：${hotSpringAnswer} / 場所：${searchLocation} / 基準アイテム：${searchItem} / 位置：${searchPosition}`
      );
      setHotSpringAnswer('');
      setSearchItem('');
      setSearchPosition(POSITIONS[0]);
      setLastStep(3);
      setPhotoFiles(prev => ({ ...prev, お: 'お2', F: 'F4' }));
      setPhotoUpdateMarkers(['お', 'F']);
      showCorrectThenCutIn(CUT_IN_LINES.lastStepThreeStart, getLastStepLogIndex(3), true);
      return;
    }
    setErrorMsg('お題「蜘蛛」を提出できません。');
  };

  const handleBonusStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      searchLocation === 'K'
      && searchItem === '募金箱'
      && searchPosition === '中'
      && matchesTextAnswer(bonusLastStepOneName, ['1円玉'])
    ) {
      setBonusMessage('');
      setSearchItem('');
      setBonusLastStepOneName('');
      setBonusStep(2);
      showCorrectThenCutIn(CUT_IN_LINES.lastStepThreeStart, getBonusStepLogIndex(2), true);
      return;
    }
    setBonusMessage('場所、位置、アイテム、または名称指定が違います。');
  };

  const handleFinalSubmissionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allCorrect = finalSubmissionTargets.every((target, index) => {
      const submission = finalSubmissions[index];
      const matchesAcceptedTarget = target.acceptedTargets.some(acceptedTarget => (
        submission
        && submission.location === acceptedTarget.location
        && submission.position === acceptedTarget.position
        && submission.item === acceptedTarget.item
      ));
      return submission
        && matchesAcceptedTarget;
    });
    const isSphereAnswerCorrect = matchesTextAnswer(finalSphereAnswer, [
      'バスボール',
      'ばすぼーる',
      'バスぼーる',
      'ばすボール',
      'バスボム',
      'ばすぼむ',
      '入浴剤',
      'ばすだま',
      'バスだま',
      '入浴球',
      'にゅうよくだま',
      'にゅうよくきゅう',
    ]);

    if (allCorrect && isSphereAnswerCorrect) {
      setErrorMsg('');
      setIsGameCleared(true);
    } else if (allCorrect) {
      setErrorMsg('球体の再提出は合っています。Fの謎の球体が何だったのかを見直しましょう。');
    } else if (isSphereAnswerCorrect) {
      setErrorMsg('Fの謎の球体の答えは合っています。球体の再提出内容を見直しましょう。');
    } else {
      setErrorMsg('どこかの提出内容が違います。これまでの記録を見直してみましょう。');
    }
  };

  const handleBonusSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    const target = BONUS_STEP_SUBMISSIONS[bonusIndex];
    const submission = bonusSubmissions[bonusIndex];
    const matchesAcceptedTarget = target.acceptedTargets.some(acceptedTarget => (
      submission.location === acceptedTarget.location
      && submission.position === acceptedTarget.position
      && submission.item === acceptedTarget.item
    ));
    const matchesName = matchesTextAnswer(submission.specifiedName, [
      target.retryItem,
      ...(target.acceptedRetryItems || []),
    ]);

    if (!matchesAcceptedTarget || !matchesName) {
      setBonusMessage('提出内容が違います。これまでの記録を見直してみましょう。');
      return;
    }

    if (bonusIndex === BONUS_STEP_SUBMISSIONS.length - 1) {
      setBonusIndex(BONUS_STEP_SUBMISSIONS.length);
      setBonusMessage('おまけの再提出をすべて完了しました！');
      return;
    }

    setBonusIndex(index => index + 1);
    setBonusMessage('正解です。次の提出へ進みます。');
  };

  const activeCutInLine = cutInLines[cutInIndex] || null;
  const selectedCutInLogLines = selectedCutInLogStep !== null ? cutInLogByStep[selectedCutInLogStep] || [] : [];
  const isLastStepHotSpringStage = lastStep === 1 || (lastStep === 2 && !lastStepTwoAnswerLog);
  const isLastStepSpiderStage = lastStep === 2 && Boolean(lastStepTwoAnswerLog);
  const lastStepTwoItems = Array.from(new Set([
    ...getAvailableItemsForLocation(searchLocation),
    ...(searchLocation === 'F' ? ['蜘蛛'] : []),
  ]));
  const visibleLastStepLogSteps: (1 | 2 | 3)[] = lastStep === 0
    ? []
    : isLastStepSpiderStage
      ? [1, 2]
    : lastStep >= 3
        ? [1, 2, 3]
        : [1];
  const selectedCutInLogTitle = selectedCutInLogStep === null
    ? ''
    : selectedCutInLogStep < GAME_STEPS.length
      ? GAME_STEPS[selectedCutInLogStep]?.title || ''
      : selectedCutInLogStep > GAME_STEPS.length + 3
        ? `EXTRA${selectedCutInLogStep - GAME_STEPS.length - 3}`
        : `LASTSTEP${selectedCutInLogStep - GAME_STEPS.length + 1}`;
  const cutInTheme = activeCutInLine?.speaker === 'ゲームマスター'
    ? 'border-rose-400/70 from-rose-950/95 via-slate-950/95 to-rose-900/90 text-rose-100'
    : activeCutInLine?.speaker === '自分'
      ? 'border-cyan-400/70 from-cyan-950/95 via-slate-950/95 to-blue-900/90 text-cyan-100'
      : 'border-indigo-400/70 from-indigo-950/95 via-slate-950/95 to-violet-900/90 text-indigo-100';
  const cutInBadgeClass = activeCutInLine?.speaker === 'ゲームマスター'
    ? 'bg-rose-500 text-white'
    : activeCutInLine?.speaker === '自分'
      ? 'bg-cyan-500 text-slate-950'
      : 'bg-indigo-500 text-white';
  const isAllClear = bonusIndex >= BONUS_STEP_SUBMISSIONS.length;

  if (!hasRestoredProgress) {
    return <div className="mx-auto h-[100dvh] max-w-md bg-slate-950" />;
  }

  const renderBonusMain = () => {
    const isBonusComplete = bonusIndex >= BONUS_STEP_SUBMISSIONS.length;
    const target = isBonusComplete ? null : BONUS_STEP_SUBMISSIONS[bonusIndex];
    const submission = isBonusComplete ? null : bonusSubmissions[bonusIndex];
    const originalStep = target ? GAME_STEPS[target.stepIndex] : null;
    const isSameAsOriginal = target
      ? !target.isPending && target.originalSubmittedItem === target.retryItem
      : false;
    const configuredItems = target && submission
      ? target.acceptedTargets
        .filter(acceptedTarget => acceptedTarget.location === submission.location)
        .map(acceptedTarget => acceptedTarget.item)
      : [];
    const availableItems = target && submission && originalStep
      ? Array.from(new Set([
        ...getAvailableItemsForLocation(submission.location),
        ...configuredItems,
        ...(submission.location === originalStep.searchTarget.location ? [originalStep.searchTarget.item] : []),
      ]))
      : [];

    if (showBonusChoice) {
      return (
        <div className="flex min-h-full flex-col items-center justify-center px-5 py-6 pb-28 text-slate-100">
          <div className="w-full rounded-3xl border border-amber-300/30 bg-slate-900/95 p-5 text-center shadow-2xl shadow-amber-950/30">
            <p className="text-xs font-black tracking-[0.35em] text-amber-300">EXTRA</p>
            <h1 className="mt-2 text-2xl font-black text-white">削られたお題にも挑戦しますか？</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              どちらを選んでも、おまけの再提出へ進みます。
            </p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => setShowBonusChoice(false)}
                className="rounded-2xl border border-slate-600 bg-slate-800 px-4 py-5 text-lg font-black text-slate-100 transition-colors hover:bg-slate-700 active:scale-95"
              >
                仕方ないな
              </button>
              <button
                type="button"
                onClick={() => setShowBonusChoice(false)}
                className="rounded-2xl border border-amber-300/50 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-5 text-lg font-black text-white shadow-lg shadow-amber-950/40 transition-all hover:from-amber-500 hover:to-orange-500 active:scale-95"
              >
                謎は全部解きたい！
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (bonusStep === 1) {
      return (
        <div className="flex min-h-full flex-col px-5 py-6 pb-28 text-slate-100">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.3em] text-amber-300">EXTRA 1</p>
              <h1 className="mt-1 text-2xl font-black">「アルミ」を再提出</h1>
            </div>
            <button type="button" onClick={() => setShowBonus(false)} className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-bold text-slate-200">
              クリア画面へ
            </button>
          </div>

          <form onSubmit={handleBonusStepOneSubmit} className="mt-auto flex flex-col gap-3 rounded-2xl border border-amber-400/25 bg-slate-900/80 p-4 shadow-xl">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3">
              <h3 className="text-sm font-bold text-amber-300">「アルミ」を再提出</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                場所・アイテム・位置を選択し、転送対象の名称も指定してください。
                ※先ほどと同じアルミ缶は提出できません
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-400">場所</span>
                <select
                  value={searchLocation}
                  onChange={(e) => {
                    setSearchLocation(e.target.value);
                    setSearchItem('');
                    setBonusMessage('');
                  }}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  {LOCATIONS.map(location => <option key={location} value={location}>{location}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-400">基準となるアイテム</span>
                <select
                  value={searchItem}
                  onChange={(e) => {
                    setSearchItem(e.target.value);
                    setBonusMessage('');
                  }}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">選択してください</option>
                  {getAvailableItemsForLocation(searchLocation).map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">位置</span>
              <select
                value={searchPosition}
                onChange={(e) => {
                  setSearchPosition(e.target.value);
                  setBonusMessage('');
                }}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white focus:border-amber-500 focus:outline-none"
              >
                {POSITIONS.map(position => <option key={position} value={position}>{position}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-amber-300">名称指定（必須）</span>
              <input
                type="text"
                value={bonusLastStepOneName}
                onChange={(e) => {
                  setBonusLastStepOneName(e.target.value);
                  setBonusMessage('');
                }}
                required
                className="w-full rounded-lg border border-amber-500/50 bg-slate-800 p-3 text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="転送するものの名称"
              />
            </label>
            {bonusMessage && <p className="text-center text-sm font-bold text-amber-200">{bonusMessage}</p>}
            <button type="submit" className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 py-3 font-bold text-white shadow-lg transition-all hover:from-amber-500 hover:to-orange-500 active:scale-95">
              再提出する
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex min-h-full flex-col px-5 py-6 pb-28 text-slate-100">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.3em] text-amber-300">EXTRA 2</p>
            <h1 className="mt-1 text-2xl font-black">残りの再提出</h1>
          </div>
          <button type="button" onClick={() => setShowBonus(false)} className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-bold text-slate-200">
            クリア画面へ
          </button>
        </div>

        {isBonusComplete || !target || !submission || !originalStep ? (
          <div className="my-auto rounded-2xl border border-amber-400/30 bg-amber-950/30 p-6 text-center">
            <p className="text-xl font-black text-amber-200">おまけコンプリート</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">本編では使わなかった提出先も、すべて正しく再提出できました。</p>
          </div>
        ) : (
          <form onSubmit={handleBonusSubmission} className="flex flex-col gap-4 rounded-2xl border border-amber-400/25 bg-slate-900/80 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">{originalStep.title}</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-amber-300">{bonusIndex + 1} / {BONUS_STEP_SUBMISSIONS.length}</span>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-xs leading-relaxed text-slate-300">
              <div>お題：<span className="font-bold text-white">{originalStep.themeText}</span></div>
              <div className="mt-1">ログで見えないが提出したもの：<span className="font-bold text-white">{target.logDisplayItem ?? target.originalSubmittedItem}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="mb-1 block text-xs text-slate-400">場所</span><select value={submission.location} disabled={isSameAsOriginal} onChange={e => updateBonusSubmission('location', e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"><option value="">選択</option>{LOCATIONS.map(value => <option key={value}>{value}</option>)}</select></label>
              <label><span className="mb-1 block text-xs text-slate-400">位置</span><select value={submission.position} disabled={isSameAsOriginal} onChange={e => updateBonusSubmission('position', e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3">{POSITIONS.map(value => <option key={value}>{value}</option>)}</select></label>
            </div>
            <label><span className="mb-1 block text-xs text-slate-400">基準となるアイテム</span><select value={submission.item} disabled={isSameAsOriginal} onChange={e => updateBonusSubmission('item', e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"><option value="">選択してください</option>{availableItems.map(value => <option key={value}>{value}</option>)}</select></label>
            <label><span className="mb-1 block text-xs font-bold text-amber-300">名称指定（必須）</span><input required value={submission.specifiedName} onChange={e => updateBonusSubmission('specifiedName', e.target.value)} className="w-full rounded-lg border border-amber-500/40 bg-slate-800 p-3" placeholder="転送するものの名称" /></label>
            {bonusMessage && <p className="text-center text-sm font-bold text-amber-200">{bonusMessage}</p>}
            <button type="submit" className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 py-3 font-bold text-white">この内容で提出する</button>
          </form>
        )}
      </div>
    );
  }

  if (isGameCleared && !showBonus) {
    return (
      <div className="relative mx-auto flex h-[100dvh] max-w-md flex-col overflow-y-auto bg-slate-950 px-6 py-8 text-slate-100 no-scrollbar">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>
        <main className="relative z-10 flex min-h-full flex-col items-center justify-center text-center">
          <p className="mb-3 text-xs font-black tracking-[0.35em] text-cyan-300">GAME CLEAR</p>
          <div className="relative w-full max-w-sm aspect-square">
            <Image
              src={isAllClear ? '/images/allclear.png' : '/images/clear.png'}
              alt={isAllClear ? 'オールクリア' : 'ゲームクリア'}
              fill
              priority
              className="object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.25)]"
            />
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-wider text-white">ゲームクリア</h1>
          <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-slate-900/70 px-5 py-4 text-lg font-bold leading-relaxed text-cyan-50 shadow-xl backdrop-blur">
            {isAllClear ? '心の眼で全ての謎を解き明かしました' : '心の眼で謎を解き明かしました'}
          </p>
          {!isAllClear && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('main');
                setBonusMessage('');
                setShowBonusChoice(false);
                setShowBonus(true);
                if (bonusStep === 1 && bonusIndex === 0) {
                  startCutIn(CUT_IN_LINES.bonusStart, getBonusStepLogIndex(1));
                }
              }}
              className="mt-5 rounded-xl border border-amber-300/40 bg-amber-500/15 px-6 py-3 font-black text-amber-100 transition-colors hover:bg-amber-500/25"
            >
              おまけの再提出に挑戦する
            </button>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-slate-900 relative overflow-hidden">
      
      {/* Header */}
      <header className="glass-panel py-3 px-4 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          {showBonus ? 'EXTRA' : displayTitle}
        </h1>
        <div className="text-xs bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
          {showBonus ? `EXTRA ${bonusStep} / 2` : lastStep > 0 ? `LAST ${lastStep} / 3` : `Step ${currentStepIndex} / ${GAME_STEPS.length - 1}`}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative min-h-0 flex-1 overflow-y-auto pb-24 no-scrollbar">
        {activeTab === 'main' && (showBonus ? renderBonusMain() : (
          <div className="flex min-h-full flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isRulesInfoUnlocked && (
              <div className="absolute right-4 bottom-20 z-30 flex flex-col items-end gap-2">
                {showRulesInfoPrompt && (
                  <div className="max-w-56 rounded-xl border border-cyan-300/40 bg-slate-800/95 px-3 py-2 text-xs font-bold leading-relaxed text-cyan-50 shadow-lg shadow-cyan-950/40 animate-pulse">
                    {isAdditionalRuleUnlocked
                      ? '追加で判明したルールがあります。informationを確認してください。'
                      : 'ゲームのルールはいつでも確認できます。まずはここを押してみましょう。'}
                  </div>
                )}
                <button
                  type="button"
                  aria-label="ゲームのルールを確認する"
                  onClick={() => {
                    setShowRulesInfo(true);
                    setShowRulesInfoPrompt(false);
                  }}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/50 bg-slate-800/90 text-cyan-300 shadow-lg shadow-cyan-950/40 backdrop-blur transition-all hover:border-cyan-200 hover:bg-slate-700 active:scale-95 ${showRulesInfoPrompt ? 'animate-bounce ring-2 ring-cyan-300/70' : ''}`}
                >
                  <span className="text-xl font-black leading-none">i</span>
                  {showRulesInfoPrompt && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black leading-none text-white shadow-lg">
                      NEW
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Image Toggle Bar */}
            {(lastStep === 0 || lastStep === 3) && <div
              className="flex shrink-0 cursor-pointer items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2 transition-colors hover:bg-slate-700"
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
            </div>}

            {/* Image Area */}
            {(lastStep === 0 || lastStep === 3) && <div className={`shrink-0 overflow-hidden transition-all duration-500 ${isImageCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
              <div 
                className="relative w-full aspect-4/3 bg-black flex items-center justify-center border-b border-slate-800 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setZoomedImage(activePuzzleImage)}
              >
                <Image 
                  src={activePuzzleImage}
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
            </div>}

            {phase === 'puzzle' && isFollowUpPuzzle && currentStep.followUpPuzzle && (
              <div className="border-b border-emerald-500/30 bg-emerald-950/40 px-4 py-3">
                <p className="text-sm font-bold leading-relaxed text-emerald-100">
                  緑が追加してみた部分だけど、追加したことで読み方が変わるものは何？
                </p>
              </div>
            )}
            
            {/* Theme Area */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="mb-3 flex justify-end">
                <a
                  href="/hints"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-100 shadow-sm transition-colors hover:bg-cyan-500/20"
                >
                  ヒントを見る
                </a>
              </div>

              {phase === 'search' && lastStep === 0 && (
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
                        value={activePuzzleAnswer}
                        disabled
                        className="bg-blue-950/60 border-2 border-blue-400 rounded-lg p-3 text-blue-300 font-bold text-center tracking-widest cursor-not-allowed shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-all"
                      />
                      <button
                        type="button"
                        onClick={proceedAfterPuzzleSolved}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-400 hover:to-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {currentStep.followUpPuzzle && !isFollowUpPuzzle ? '追加の謎へ進む' : 'お題へ進む'}
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
                ) : isLastStepHotSpringStage ? (
                  <form onSubmit={handleLastStepTwoSubmit} className="flex flex-col gap-3">
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-4 shadow-[0_0_18px_rgba(6,182,212,0.12)]">
                      <h3 className="text-sm font-bold text-cyan-300">どこが温泉か？</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        温泉だと思う提出場所を答えてください。
                      </p>
                    </div>
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-400">提出場所</span>
                      <select
                        value={hotSpringAnswer}
                        onChange={(e) => setHotSpringAnswer(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-center text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="">選択してください</option>
                        {['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け'].map(place => (
                          <option key={place} value={place}>{place}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 py-3 font-bold text-white shadow-lg transition-all hover:from-cyan-500 hover:to-blue-500 active:scale-95"
                    >
                      回答する
                    </button>
                  </form>
                ) : isLastStepSpiderStage ? (
                  <form onSubmit={handleLastStepSpiderSubmit} className="flex flex-col gap-3">
                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3">
                      <h3 className="text-sm font-bold text-amber-300">提出場所「？」に「蜘蛛」を提出</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        提出場所も選び、そこへお題「蜘蛛」を提出してください。位置に「外」が追加されています。
                      </p>
                    </div>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-amber-300">提出場所</span>
                      <select
                        value={hotSpringAnswer}
                        onChange={(e) => setHotSpringAnswer(e.target.value)}
                        required
                        className="w-full rounded-lg border border-amber-500/40 bg-slate-800 p-3 text-center text-white focus:border-amber-400 focus:outline-none"
                      >
                        <option value="">選択してください</option>
                        {['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け'].map(place => (
                          <option key={place} value={place}>{place}</option>
                        ))}
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="mb-1 block text-xs text-slate-400">写真の場所</span>
                        <select
                          value={searchLocation}
                          onChange={(e) => {
                            setSearchLocation(e.target.value);
                            setSearchItem('');
                          }}
                          className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white focus:border-amber-500 focus:outline-none"
                        >
                          {LOCATIONS.map(location => <option key={location} value={location}>{location}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-slate-400">基準となるアイテム</span>
                        <select
                          value={searchItem}
                          onChange={(e) => setSearchItem(e.target.value)}
                          className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="">選択してください</option>
                          {lastStepTwoItems.map(item => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-400">位置</span>
                      <select
                        value={searchPosition}
                        onChange={(e) => setSearchPosition(e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white focus:border-amber-500 focus:outline-none"
                      >
                        {lastStepTwoPositions.map(position => <option key={position} value={position}>{position}</option>)}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 py-3 font-bold text-white shadow-lg transition-all hover:from-amber-500 hover:to-orange-500 active:scale-95"
                    >
                      提出する
                    </button>
                  </form>
                ) : lastStep === 3 ? (
                  <form onSubmit={handleFinalSubmissionsSubmit} className="flex flex-col gap-3">
                    <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 shadow-[0_0_18px_rgba(244,63,94,0.12)]">
                      <h3 className="text-sm font-bold text-rose-300">最終提出</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        球体の再提出と、Fの謎の球体が何だったのかを同時に回答してください。
                      </p>
                    </div>

                    <div className="max-h-[42vh] space-y-3 overflow-y-auto pr-1 no-scrollbar">
                      {finalSubmissionTargets.map((target, index) => {
                        const originalStep = GAME_STEPS[target.stepIndex];
                        const isSameAsOriginal = !target.isPending && target.originalSubmittedItem === target.retryItem;
                        const submission = finalSubmissions[index];
                        const configuredItems = target.acceptedTargets
                          .filter(acceptedTarget => acceptedTarget.location === submission.location)
                          .map(acceptedTarget => acceptedTarget.item);
                        const availableItems = Array.from(new Set([
                          ...getAvailableItemsForLocation(submission.location),
                          ...configuredItems,
                          ...(submission.location === originalStep.searchTarget.location ? [originalStep.searchTarget.item] : []),
                        ]));
                        return (
                          <div key={`${originalStep.id}-${index}`} className={`rounded-xl border p-3 ${isSameAsOriginal ? 'border-slate-700 bg-slate-800/45 opacity-70' : 'border-slate-700 bg-slate-800/80'}`}>
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-100">{originalStep.title}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isSameAsOriginal ? 'bg-slate-700 text-slate-300' : 'bg-slate-900 text-slate-400'}`}>
                                {isSameAsOriginal ? '変更なし' : `${index + 1}/${finalSubmissionTargets.length}`}
                              </span>
                            </div>
                            <div className="mb-2 rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1.5 text-[11px] leading-relaxed text-slate-300">
                              <div>
                                お題：<span className="font-bold text-slate-100">{originalStep.themeText}</span>
                              </div>
                              {target.isPending ? (
                                <div className="mt-1">今回あわせて回答する提出です</div>
                              ) : (
                                <div className="mt-1">
                                  ログで見えないが提出したもの：<span className="font-bold text-slate-100">{target.logDisplayItem ?? target.originalSubmittedItem}</span>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <label className="block">
                                <span className="mb-1 block text-[11px] font-bold text-slate-400">場所</span>
                                <select
                                  value={submission.location}
                                  onChange={(e) => updateFinalSubmission(index, 'location', e.target.value)}
                                  disabled={isSameAsOriginal}
                                  className="w-full rounded-lg border border-slate-600 bg-slate-900 p-2 text-sm text-white focus:border-rose-400 focus:outline-none"
                                >
                                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                              </label>

                              <label className="block">
                                <span className="mb-1 block text-[11px] font-bold text-slate-400">位置</span>
                                <select
                                  value={submission.position}
                                  onChange={(e) => updateFinalSubmission(index, 'position', e.target.value)}
                                  disabled={isSameAsOriginal}
                                  className="w-full rounded-lg border border-slate-600 bg-slate-900 p-2 text-sm text-white focus:border-rose-400 focus:outline-none"
                                >
                                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                              </label>
                            </div>

                            <label className="mt-2 block">
                              <span className="mb-1 block text-[11px] font-bold text-slate-400">基準となるアイテム</span>
                              <select
                                value={submission.item}
                                onChange={(e) => updateFinalSubmission(index, 'item', e.target.value)}
                                disabled={isSameAsOriginal}
                                className="w-full rounded-lg border border-slate-600 bg-slate-900 p-2 text-sm text-white focus:border-rose-400 focus:outline-none"
                              >
                                <option value="">選択してください</option>
                                {availableItems.map(item => (
                                  <option key={item} value={item}>{item}</option>
                                ))}
                              </select>
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    <label className="block rounded-xl border border-cyan-500/30 bg-cyan-950/25 p-3">
                      <span className="mb-1 block text-xs font-bold text-cyan-300">Fの謎の球体は何だった？</span>
                      <input
                        type="text"
                        value={finalSphereAnswer}
                        onChange={(e) => setFinalSphereAnswer(e.target.value)}
                        required
                        className="w-full rounded-lg border border-cyan-500/40 bg-slate-900 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="答えを入力"
                      />
                    </label>

                    <button
                      type="submit"
                      className="mt-1 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 py-3 font-bold text-white shadow-lg transition-all hover:from-rose-500 hover:to-red-500 active:scale-95"
                    >
                      提出を確定する
                    </button>
                  </form>
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
        ))}

        {activeTab === 'map' && (
          <div className="min-h-full px-4 pt-4 pb-28 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
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
              if (lastStep > 0 || isGameCleared || showBonus) return null;

              const isCurrentPuzzleSolved = phase === 'search' || isPuzzleSolvedPending;
              const availablePartnerEvents = currentStep.partnerEvents?.filter(event => (
                unlockedPhotos.includes(event.targetPhoto)
                && (!event.availableAfterPuzzleSolved || isCurrentPuzzleSolved)
              )) || [];
              if (availablePartnerEvents.length === 0) return null;
              
              return (
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {availablePartnerEvents.map((event, eventIndex) => (
                    <button 
                      key={`${event.targetPhoto}_${eventIndex}`}
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
              if (!activePartnerMessage || lastStep > 0 || isGameCleared || showBonus) return null;
              const activeEventIndex = currentStep.partnerEvents?.findIndex(e => e.message === activePartnerMessage) ?? -1;
              const activeEvent = activeEventIndex >= 0 ? currentStep.partnerEvents?.[activeEventIndex] : undefined;
              const qKey = activeEvent ? getPartnerEventKey(currentStep.id, activeEventIndex) : '';
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
                      <span className="text-xs text-indigo-300 font-semibold">
                        {activeEvent.questionAnswer!.choices ? '回答を選択してください' : '回答を入力してください'}
                      </span>
                      <div className="flex gap-2">
                        {activeEvent.questionAnswer!.choices ? (
                          <select
                            value={partnerAnswerInput}
                            onChange={(e) => setPartnerAnswerInput(e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">選択してください</option>
                            {activeEvent.questionAnswer!.choices.map(choice => (
                              <option key={choice} value={choice}>{choice}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={partnerAnswerInput}
                            onChange={(e) => setPartnerAnswerInput(e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="答え"
                          />
                        )}
                        <button
                          onClick={() => {
                            if (matchesTextAnswer(partnerAnswerInput, [
                              activeEvent.questionAnswer!.answer,
                              ...(activeEvent.questionAnswer!.acceptedAnswers || []),
                            ])) {
                              setSolvedPartnerQuestions(prev => [...prev, qKey]);
                              setPartnerAnswerError('');
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
            
            <div className="min-h-0 flex-1 overflow-y-auto pb-4 no-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {unlockedPhotos.map(photo => {
                const isNew = newPhotos.includes(photo);
                const currentFilename = photoFiles[photo] || photo;
                const shouldGuidePhotoA = tabGuideStep === 'photoA' && photo === 'A';
                return (
                  <div
                    key={photo}
                    className={`relative rounded-xl overflow-hidden aspect-square bg-slate-800 border-2 cursor-pointer transition-all duration-300 group hover:opacity-90 ${shouldGuidePhotoA ? 'z-10 border-cyan-300 ring-4 ring-cyan-300/60 animate-pulse' : isNew ? 'border-amber-500 animate-[pulse-border_2s_ease-in-out_infinite]' : 'border-slate-700 hover:border-slate-500'}`}
                    onClick={() => {
                      setZoomedImage(`/images/${currentFilename}.png`);
                      if (shouldGuidePhotoA) {
                        setTabGuideStep('map');
                      }
                    }}
                  >
                    {shouldGuidePhotoA && (
                      <div className="absolute left-2 right-2 top-2 z-20 rounded-xl border border-cyan-300/40 bg-slate-900/95 px-3 py-2 text-center text-xs font-bold leading-relaxed text-cyan-50 shadow-lg animate-pulse">
                        写真Aを押して確認しましょう。
                      </div>
                    )}
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
          </div>
        )}

        {activeTab === 'log' && (
          <div className="min-h-full px-4 pt-4 pb-28 flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-bold text-center text-white mb-4">過去の記録</h2>
            <div className="flex flex-col gap-4">
              {reachedSteps.map((step, stepIndex) => {
                const isCurrentStep = stepIndex === currentStepIndex;
                const isWaitingForFollowUpPuzzle = Boolean(
                  currentStep.followUpPuzzle && !isFollowUpPuzzle && isPuzzleSolvedPending
                );
                const isCurrentPuzzleSolved = phase === 'search'
                  || lastStep > 0
                  || (isPuzzleSolvedPending && !isWaitingForFollowUpPuzzle);
                const stepCutInLog = cutInLogByStep[stepIndex] || [];
                const submittedAssumption = LAST_STEP_SUBMISSIONS.find(submission => submission.stepIndex === stepIndex);
                return (
                <div key={step.id} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                  <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                    <h3 className="font-bold text-blue-400">{step.title}</h3>
                    <div className="flex items-center gap-2">
                      {isCurrentStep && (
                        <span className="rounded-full bg-cyan-900/70 px-2 py-1 text-[10px] font-bold text-cyan-200">
                          現在
                        </span>
                      )}
                      {stepCutInLog.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCutInLogStep(stepIndex)}
                          className="shrink-0 rounded-full border border-indigo-400/50 bg-indigo-900/50 px-2.5 py-1 text-[11px] font-bold text-indigo-100 transition-colors hover:bg-indigo-800"
                        >
                          会話ログ
                        </button>
                      )}
                    </div>
                  </div>
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
                      {!isCurrentStep || isCurrentPuzzleSolved ? (
                        <>
                          <div>
                            <span className="text-slate-500 text-xs block">謎の答え</span>
                            <span className="text-slate-200">{step.puzzleAnswer}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs block">お題</span>
                            <span className="text-slate-200">{step.themeText}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">謎に挑戦中</span>
                      )}
                      {!isCurrentStep && (
                        <div>
                          <span className="text-slate-500 text-xs block">特定したアイテム</span>
                          <span className="text-slate-200">場所{step.searchTarget.location} ({step.searchTarget.position}): {step.searchTarget.item}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 相棒との会話履歴 */}
                  {!isCurrentStep && submittedAssumption && (
                    <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm">
                      <span className="text-slate-500 text-xs block">提出した想定のもの</span>
                      <span className="text-slate-200">
                        {submittedAssumption.logDisplayItem ?? submittedAssumption.originalSubmittedItem}
                      </span>
                    </div>
                  )}
                  {step.partnerEvents?.map((event, eventIndex) => {
                    const questionKey = getPartnerEventKey(step.id, eventIndex);
                    const isQuestionSolved = solvedPartnerQuestions.includes(questionKey);
                    const loggedMessage = event.questionAnswer
                      ? (isQuestionSolved ? event.questionAnswer.successMessage : null)
                      : event.message;

                    return readPartnerMessages.includes(event.message) && loggedMessage ? (
                      <div key={event.message} className="mt-3 bg-indigo-900/40 p-2.5 rounded-xl rounded-tl-none border border-indigo-500/30 text-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[8px] font-bold">相</div>
                          <span className="text-indigo-400 font-bold text-xs">相棒</span>
                        </div>
                        <span className="text-indigo-100 text-xs">{loggedMessage}</span>
                      </div>
                    ) : null;
                  })}
                </div>
                );
              })}
              {visibleLastStepLogSteps.map(step => {
                const logIndex = getLastStepLogIndex(step);
                const stepCutInLog = cutInLogByStep[logIndex] || [];
                const question = step === 1
                  ? '温泉だと思う提出場所はどこか？'
                  : step === 2
                    ? '提出場所「お」に、お題「蜘蛛」を提出する'
                    : null;
                const submittedAnswer = step === 1
                  ? lastStepTwoAnswerLog
                  : step === 2
                    ? lastStepOneAnswerLog
                    : null;
                return (
                  <div key={`last-step-${step}`} className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-rose-300">LASTSTEP{step}</h3>
                      {stepCutInLog.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedCutInLogStep(logIndex)}
                          className="shrink-0 rounded-full border border-indigo-400/50 bg-indigo-900/50 px-2.5 py-1 text-[11px] font-bold text-indigo-100 transition-colors hover:bg-indigo-800"
                        >
                          会話ログ
                        </button>
                      )}
                    </div>
                    {question && (
                      <div className="mt-3 space-y-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs leading-relaxed">
                        <div>
                          <span className="block font-bold text-slate-500">お題・質問</span>
                          <span className="text-slate-200">{question}</span>
                        </div>
                        {submittedAnswer && (
                          <div>
                            <span className="block font-bold text-slate-500">回答した内容</span>
                            <span className="text-slate-100">{submittedAnswer}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
          onClick={() => {
            setActiveTab('map');
            if (tabGuideStep === 'map') {
              setTabGuideStep(null);
            }
          }}
          className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'map' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'} ${tabGuideStep === 'map' ? 'animate-bounce text-emerald-300' : ''}`}
        >
          {tabGuideStep === 'map' && (
            <div className="absolute bottom-full mb-2 w-36 rounded-xl border border-emerald-300/40 bg-slate-800/95 px-3 py-2 text-center text-xs font-bold leading-relaxed text-emerald-50 shadow-lg shadow-emerald-950/40 animate-pulse">
              次にマップ＆メモを確認しましょう。
            </div>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-[10px] font-medium whitespace-nowrap">マップ＆メモ</span>
        </button>

        <button 
          onClick={() => {
            setActiveTab('photos');
            setPhotoTabHasUnreadUpdate(false);
            if (tabGuideStep === 'photos') {
              setTabGuideStep('photoA');
            }
          }}
          className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'photos' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'} ${tabGuideStep === 'photos' ? 'animate-bounce text-amber-300' : ''}`}
        >
          {tabGuideStep === 'photos' && (
            <div className="absolute bottom-full mb-2 w-32 rounded-xl border border-amber-300/40 bg-slate-800/95 px-3 py-2 text-center text-xs font-bold leading-relaxed text-amber-50 shadow-lg shadow-amber-950/40 animate-pulse">
              次に写真タブを確認しましょう。
            </div>
          )}
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {photoTabHasUnreadUpdate && activeTab !== 'photos' && (
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

      {showCorrectOverlay && (
        <button
          type="button"
          aria-label="正解表示を閉じる"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={closeCorrectOverlay}
        >
          <span className="rounded-2xl border-2 border-emerald-300/70 bg-emerald-500 px-10 py-6 text-4xl font-black tracking-widest text-white shadow-[0_0_35px_rgba(16,185,129,0.65)] animate-in zoom-in-95 duration-200">
            正解
          </span>
        </button>
      )}

      {activeCutInLine && (
        <button
          type="button"
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-black/65 px-3 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={advanceCutIn}
          aria-label="会話を進める"
        >
          <div className="absolute inset-x-[-12%] top-1/2 h-28 -translate-y-1/2 -skew-y-3 bg-white/10 blur-sm" />
          <div className={`relative w-full max-w-md -skew-y-3 border-y-2 bg-gradient-to-r px-5 py-5 text-left shadow-[0_0_40px_rgba(99,102,241,0.35)] ${cutInTheme}`}>
            <div className="skew-y-3">
              <div className="mb-3 flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-lg ${cutInBadgeClass}`}>
                  {activeCutInLine.speaker.slice(0, 1)}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">COMMUNICATION</p>
                  <p className="text-lg font-black text-white">{activeCutInLine.speaker}</p>
                </div>
              </div>
              <p className="text-xl font-bold leading-relaxed text-white drop-shadow">
                {renderCutInText(activeCutInLine.text)}
              </p>
              <p className="mt-4 text-right text-xs font-bold tracking-widest text-white/50">
                TAP TO CONTINUE {cutInIndex + 1}/{cutInLines.length}
              </p>
            </div>
          </div>
        </button>
      )}

      {selectedCutInLogStep !== null && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedCutInLogStep(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-indigo-400/40 bg-slate-900 p-5 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300/70">COMMUNICATION LOG</p>
                <h2 className="text-lg font-bold text-indigo-200">{selectedCutInLogTitle}</h2>
              </div>
              <button
                type="button"
                aria-label="閉じる"
                onClick={() => setSelectedCutInLogStep(null)}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {selectedCutInLogLines.map((line, index) => (
                <div key={`${line.speaker}-${index}`} className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[11px] font-bold text-white">
                      {line.speaker}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-100">{line.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showRulesInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeRulesInfo}
        >
          <div
            className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-cyan-400/40 bg-slate-900 p-5 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-cyan-300">ゲームのルール</h2>
              <button
                type="button"
                aria-label="閉じる"
                onClick={closeRulesInfo}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5 text-sm leading-relaxed">
              <section>
                <h3 className="mb-2 font-bold text-emerald-300">クリア条件</h3>
                <p>マップ上の「あ」〜「け」の全てにお題のアイテムを提出する</p>
                <p className="mt-2 text-slate-300">※謎のイラストで登場したアイテムしか視認できない</p>
              </section>

              {/* <section>
                <h3 className="mb-2 font-bold text-amber-300">アイテム提出方法</h3>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>各場所の謎に正解するとお題が出題される</li>
                  <li>お題に沿ったアイテムの場所を特定すると、提出場所へ自動で転送される</li>
                </ol>
              </section> */}

              <section>
                <h3 className="mb-2 font-bold text-indigo-300">視認できないアイテムを提出するには？</h3>
                <p>視認できているアイテムを基準に、写真上でどの位置にあるかを指定すると、最も近いアイテムが一つだけ提出される</p>
                <p className="mt-2 text-slate-300">※位置の基準に選んだアイテムは転送できない</p>
                <p className="mt-2 text-slate-300">※入れ子構造の中身だけを直接取り出せないが、対象となったアイテムの中身丸ごとが転送される</p>
              </section>

              {(isAdditionalRuleUnlocked || isSingleVisualizationRuleUnlocked) && (
                <section className="rounded-xl border border-rose-400/30 bg-rose-950/20 p-3">
                  <h3 className="mb-2 font-bold text-rose-300">追加で判明したルール</h3>
                  {isAdditionalRuleUnlocked && (
                    <>
                      <p>謎の回答が青くなった場合、回答した名称のものが可視化できる状態となったことを示す</p>
                      <p className="mt-2 text-slate-300">※青くなる条件は、ゲームフィールドに存在していること</p>
                    </>
                  )}
                  {isSingleVisualizationRuleUnlocked && (
                    <p className={`${isAdditionalRuleUnlocked ? 'mt-3 border-t border-rose-400/20 pt-3' : ''}`}>
                      種類・大きさ・名称の全て一致するものがある場合、そのうち一つしか可視化されない
                    </p>
                  )}
                </section>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center p-4">
            <button
              className="absolute top-4 right-4 z-50 bg-slate-800/80 text-white rounded-full p-2 hover:bg-slate-700 transition-colors border border-slate-600"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImage(null);
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
