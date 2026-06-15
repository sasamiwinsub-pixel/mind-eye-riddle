export type Phase = 'puzzle' | 'search';

export interface StepData {
  id: number;
  title: string;
  puzzleImage: string;
  themeText: string;
  puzzleAnswer: string; // 前半のテキスト入力正解
  searchTarget: {
    location: string; // A~L
    position: string; // 上, 下, 左, 右, 中
    item: string; // アイテム名
  };
  unlockedPhotos: string[]; // このステップで新規解放されるフィールド写真
  updatedPhotos?: Record<string, string>; // 既存の写真を差し替える場合の定義 (例: { 'A': 'A_v2' })
  memos?: string[]; // このステップで判明したルールや情報
  partnerEvents?: {
    targetPhoto: string; // どの写真に会話ボタンを出すか
    message: string;     // 相棒のセリフ
  }[];
}

export const GAME_STEPS: StepData[] = [
  {
    id: 0,
    title: 'チュートリアル',
    puzzleImage: '/images/step0.png',
    themeText: '（チュートリアル用お題）',
    puzzleAnswer: 'テスト',
    searchTarget: { location: 'A', position: '中', item: 'リンゴ' },
    unlockedPhotos: ['A'],
    memos: ['ルール1：謎を解くとお題が提示される', 'ルール2：お題のものを写真から探す'],
  },
  {
    id: 1,
    title: 'Step 1: 「あ」',
    puzzleImage: '/images/step1.png',
    themeText: '「あ」から始まるものを探せ',
    puzzleAnswer: 'こたえ1',
    searchTarget: { location: 'B', position: '上', item: 'あめ' },
    unlockedPhotos: ['B'],
    memos: ['館内には見えない通路が存在するらしい'],
    partnerEvents: [
      { targetPhoto: 'A', message: 'このリンゴ、よく見るとかじられた跡があるな…何か意味があるのか？' }
    ],
  },
  {
    id: 2,
    title: 'Step 2: 「い」',
    puzzleImage: '/images/step2.png',
    themeText: '「い」から始まるものを探せ',
    puzzleAnswer: 'こたえ2',
    searchTarget: { location: 'C', position: '下', item: 'いぬ' },
    unlockedPhotos: ['C'],
    partnerEvents: [
      { targetPhoto: 'B', message: 'さっき見つけたあめ玉、床に落ちていたのが少し気になるね。' }
    ],
  },
  {
    id: 3,
    title: 'Step 3: 「う」',
    puzzleImage: '/images/step3.png',
    themeText: '「う」から始まるものを探せ',
    puzzleAnswer: 'こたえ3',
    searchTarget: { location: 'D', position: '左', item: 'うさぎ' },
    unlockedPhotos: ['D'],
  },
  {
    id: 4,
    title: 'Step 4: 「え」',
    puzzleImage: '/images/step4.png',
    themeText: '「え」から始まるものを探せ',
    puzzleAnswer: 'こたえ4',
    searchTarget: { location: 'E', position: '右', item: 'えんぴつ' },
    unlockedPhotos: ['E', 'F'],
  },
  {
    id: 5,
    title: 'Step 5: 「お」',
    puzzleImage: '/images/step5.png',
    themeText: '「お」から始まるものを探せ',
    puzzleAnswer: 'こたえ5',
    searchTarget: { location: 'G', position: '中', item: 'おにぎり' },
    unlockedPhotos: ['G'],
  },
  {
    id: 6,
    title: 'Step 6: 「か」',
    puzzleImage: '/images/step6.png',
    themeText: '「か」から始まるものを探せ',
    puzzleAnswer: 'こたえ6',
    searchTarget: { location: 'H', position: '上', item: 'かさ' },
    unlockedPhotos: ['H', 'I'],
  },
  {
    id: 7,
    title: 'Step 7: 「き」',
    puzzleImage: '/images/step7.png',
    themeText: '「き」から始まるものを探せ',
    puzzleAnswer: 'こたえ7',
    searchTarget: { location: 'J', position: '下', item: 'きつね' },
    unlockedPhotos: ['J'],
  },
  {
    id: 8,
    title: 'Step 8: 「く」',
    puzzleImage: '/images/step8.png',
    themeText: '「く」から始まるものを探せ',
    puzzleAnswer: 'こたえ8',
    searchTarget: { location: 'L', position: '右', item: 'くるま' },
    unlockedPhotos: ['K', 'L'],
  },
];

export const LOCATIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
export const POSITIONS = ['上', '下', '左', '右', '中'];
