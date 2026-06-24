export type Phase = 'puzzle' | 'search';

export interface StepData {
  id: number;
  title: string;
  puzzleImage: string;
  themeText: string;
  puzzleAnswer: string; // 前半のテキスト入力正解
  acceptedPuzzleAnswers?: string[];
  followUpPuzzle?: {
    image: string;
    answer: string;
    acceptedAnswers?: string[];
    showBlueAnswerEffect?: boolean;
  };
  searchTarget: {
    location: string; // A~L
    position: string; // 上, 下, 左, 右, 中,それ自身
    item: string; // アイテム名
  };
  acceptedSearchTargets?: {
    location: string;
    position: string;
    item: string;
  }[];
  incorrectSearchMessages?: {
    location?: string;
    position?: string;
    item?: string;
    message: string;
  }[];
  unlockedPhotos: string[]; // このステップで新規解放されるフィールド写真
  unlockedPhotosAtTheme?: string[]; // お題表示時に新規解放されるフィールド写真
  updatedPhotosAtTheme?: Record<string, string>; // お題表示時に既存の写真を差し替える (例: { 'A': 'A_v2' })
  updatedPhotosAtPuzzle?: Record<string, string>; // 次の謎表示時に既存の写真を差し替える (例: { 'A': 'A_v3' })
  unlockedLocationItems?: Record<string, string[]>; // このステップで追加される、場所ごとのアイテム選択肢
  showBlueAnswerEffect?: boolean; // 正解時に青ハイライト演出を出してから「お題へ」ボタンで進む
  memos?: string[]; // このステップで判明したルールや情報
  partnerEvents?: {
    targetPhoto: string; // どの写真に会話ボタンを出すか
    displayPhotoName?: string; // 会話ボタンに表示する名前（省略時はtargetPhotoと同じ）
    availableAfterPuzzleSolved?: boolean; // このステップの謎に正解した後から会話可能にする
    message: string;     // 相棒のセリフ
    questionAnswer?: {   // 相棒イベントでのクイズ回答仕様
      answer: string;        // 正解テキスト
      acceptedAnswers?: string[];
      choices?: string[];    // 指定時は自由入力ではなく選択式にする
      unlockLocation: string; // 解放される場所(A〜L)
      unlockItem: string;     // 解放されるアイテム名
      successMessage?: string; // 正解時の相棒セリフ
    };
  }[];
}

export interface LastStepSubmissionData {
  stepIndex: number;
  label: string;
  originalSubmittedItem: string;
  logDisplayItem?: string;
  retryItem: string;
  acceptedRetryItems?: string[];
  acceptedTargets: {
    location: string;
    item: string;
    position: string;
  }[];
  excludeFromFinalSubmission?: boolean;
  isPending?: boolean;
}

export interface PhotoUpdateData {
  unlockedPhotos?: string[];
  updatedPhotos?: Record<string, string>;
}

export const GAME_STEPS: StepData[] = [
  {
    id: 0,
    title: 'チュートリアル-提出場所：「あ」',
    puzzleImage: '/images/step0.png',
    themeText: 'カギ（写真Aの金庫の中にあるので、回答してみてください）',
    puzzleAnswer: 'れでぃ',
    acceptedPuzzleAnswers: ['れでぃー', 'READY', 'ready', 'レディ', 'レディー', ],
    searchTarget: { location: 'A', position: '中', item: '金庫' },
    unlockedPhotos: ['A'],
    unlockedLocationItems: {
      A: ['灰皿', '金庫', 'ティーパック', '湯呑']
    },
    memos: ['ルール1：相棒はアイテムに干渉できず、通信と写真連携しかできない'],
  },
  {
    id: 1,
    title: '提出場所：「い」',
    puzzleImage: '/images/step1.png',
    themeText: 'たんさん',
    puzzleAnswer: 'PM',
    acceptedPuzzleAnswers: ['pm', '午後', 'ごご', 'ゴゴ'],
    searchTarget: { location: 'D', position: '中', item: '時計' },
    unlockedPhotos: ['B','D'],
    unlockedLocationItems: {
      B: ['ライオンの銅像','時計'],
      D: ['時計']
    },
    partnerEvents: [
      { targetPhoto: 'B', message: '可視化されて分かったが、どうやら僕はこのライオンの銅像に姿を変えられてしまったらしい。そりゃ動けないわけだ。' },
      { targetPhoto: 'D', message: '動いている時計だ。この穴の大きさに４本ぐらい、最も一般的なサイズじゃないか？' }
    ],
  },
  {
    id: 1-5,
    title: '提出場所：「う」',
    puzzleImage: '/images/step1-5.png',
    themeText: '足が偶数本あるもの',
    puzzleAnswer: 'かけじく',
    acceptedPuzzleAnswers: ['掛け軸', '掛軸', 'カケジク'],
    showBlueAnswerEffect: true,
    searchTarget: { location: 'B', position: '下', item: '時計' },
    unlockedPhotos: ['C'],
    updatedPhotosAtTheme: {'A': 'A2'}, // ステップ1-5のお題が出たタイミングで、写真AをA3に差し替える    
    unlockedLocationItems: {
      'C': ['ラケット'],
      'A': ['掛け軸']
    },
    memos: ['ルール2：相棒はライオンの銅像に姿が変わっている'],
     incorrectSearchMessages: [
      {
        location: 'B',
        item: 'ライオンの銅像',
        message: '基準とするアイテム自体を提出対象にはできません',
      }
    ],

  },
  {
    id: 2,
    title: '提出場所：「え」',
    puzzleImage: '/images/step2.png',
    themeText: '漢字表示で黄を含むもの',
    puzzleAnswer: 'ぱっく',
    acceptedPuzzleAnswers: ['パック', 'PACK', 'pack'],
    showBlueAnswerEffect: true,
    searchTarget: { location: 'E', position: '中', item: '卵のパック' },
    unlockedPhotos: [],
    unlockedPhotosAtTheme: ['E','F','G'],
    unlockedLocationItems: {
      E: ['紙パック'],
      F: ['パック'],
      G: ['短い個包装パック（左）', '長い個包装パック（右）']
    },
    updatedPhotosAtPuzzle: {'B': 'B2'},
    partnerEvents: [
      { 
        targetPhoto: 'E', 
        availableAfterPuzzleSolved: true,
        message: 'これらは中身が想像つきそうだ。写真上で右のパックの中身は何か？',
        questionAnswer: {
          answer: '納豆',
          acceptedAnswers: ['なっとう'],
          unlockLocation: 'E',
          unlockItem: '納豆のパック',
          successMessage: 'そうだ、納豆だ！Eの選択肢に納豆のパックが追加されたぞ！'
        }
      },
      { 
        targetPhoto: 'E', 
        availableAfterPuzzleSolved: true,
        message: 'これらは中身が想像つきそうだ。写真上で真ん中のパックの中身は何か？',
        questionAnswer: {
          answer: '卵',
          acceptedAnswers: ['たまご'],
          unlockLocation: 'E',
          unlockItem: '卵のパック',
          successMessage: 'そうだ、卵だ！Eの選択肢に卵のパックが追加されたぞ！'
        }
      }
    ],
  },
  {
    id: 3,
    title: '提出場所：「お」',
    puzzleImage: '/images/step3.png',
    themeText: '球体',
    puzzleAnswer: '12',
    acceptedPuzzleAnswers: ['十二', 'じゅうに', 'ジュウニ', '１２'],
    searchTarget: { location: 'F', position: '中', item: 'パック' },
    unlockedPhotos: ['H'],
    updatedPhotosAtPuzzle: { 'G': 'G2', 'A': 'A3' }, // ステップ1の謎が出たタイミングで、写真AをA2に差し替える
    unlockedLocationItems: {
      A: ['畳'],
      H: ['浴衣'],
      G: ['ドライヤー', 'ハブラシ', 'カミソリ']
    },
    partnerEvents: [
      { 
        targetPhoto: 'F', 
        availableAfterPuzzleSolved: true,
        message: 'なんかこれ、球体っぽくない？影の感じもそれっぽい気がする',
      }
    ],
  },
  {
    id: 4,
    title: '提出場所：「か」',
    puzzleImage: '/images/step4.png',
    themeText: 'かけるのに使うもの',
    puzzleAnswer: 'だい',
    acceptedPuzzleAnswers: ['台', '大', 'ダイ'],
    showBlueAnswerEffect: true,
    searchTarget: { location: 'H', position: '上', item: '浴衣' },
    acceptedSearchTargets: [{ location: 'H', position: '中', item: '浴衣' }],
    incorrectSearchMessages: [
      {
        location: 'A',
        item: '掛け軸',
        message: '掛ける部分も含めて掛け軸です',
      }
    ],
    unlockedPhotos: ['I'],
    updatedPhotosAtPuzzle: { 'F': 'F2', },
    updatedPhotosAtTheme: {'A': 'A4', 'G': 'G3', 'C': 'C2' }, 
    unlockedPhotosAtTheme: ['K'],
    unlockedLocationItems: {
      A: ['机'],
      C: ['卓球台'],
      K: ['カウンター'],
      G: ['洗面台'],
      I: ['酒瓶']
    },
  },
  {
    id: 5,
    title: '提出場所：「き」',
    puzzleImage: '/images/step5.png',
    themeText: 'アルミ',
    puzzleAnswer: 'くも',
    acceptedPuzzleAnswers: ['クモ', '蜘蛛'],
    followUpPuzzle: {
      image: '/images/step5-2.png',
      answer: '温泉饅頭',
      acceptedAnswers: ['おんせんまんじゅう', 'オンセンマンジュウ', 'まんじゅう', '饅頭', 'マンジュウ'],
      showBlueAnswerEffect: false,
    },
    showBlueAnswerEffect: true,
    searchTarget: { location: 'I', position: '右', item: '酒瓶' },
    incorrectSearchMessages: [
      {
        location: 'I',
        item: '右の缶',
        message: '提出したいもの自体を基準アイテムにはできません',
      },
    ],
    unlockedPhotos: [],
    updatedPhotosAtPuzzle: {'A': 'A6', 'I': 'I2' },
    unlockedLocationItems: {
      A: ['墨汁', '饅頭', '盆', '扇子', 'イス'],
      I: ['右の缶', '左の缶']
    },
    partnerEvents: [
      { targetPhoto: 'A',  message: 'あれ？「き」の謎画像のタイミングで掛け軸に文字が増えたね'
        
       },
      { targetPhoto: 'I', displayPhotoName: '？', message: 'どこかにアルミの可能性があるものはないか？',
        availableAfterPuzzleSolved: true,
        questionAnswer: {
          answer: 'I',
          choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K'],
          unlockLocation: 'E',
          unlockItem: 'アルミ缶(右)',
          successMessage: 'どちらも形状も大きさも同じだが、見分けるのが得意でね...右がアルミ缶だ！！'
        },
       }
    ],
  },
  {
    id: 6,
    title: '提出場所：「く」',
    puzzleImage: '/images/step6.png',
    themeText: '尻に敷かれるもの',
    puzzleAnswer: 'ホログラム',
    acceptedPuzzleAnswers: ['ほろぐらむ', 'hologram'],
    showBlueAnswerEffect: true,
    unlockedPhotosAtTheme: [],
    searchTarget: { location: 'A', position: '上', item: 'イス' },
    unlockedPhotos: ['J'],
    updatedPhotosAtPuzzle: {'I': 'I3' },
    updatedPhotosAtTheme: {'K': 'K2','I': 'I4', 'F': 'F3' },
    unlockedLocationItems: {
      J: ['体重計']
    },
  },
  {
    id: 7,
    title: '提出場所：「？」',
    puzzleImage: '/images/step7.png',
    themeText: '蜘蛛',
    puzzleAnswer: 'かんち',
    acceptedPuzzleAnswers: ['完治', 'カンチ'],
    searchTarget: { location: 'J', position: '下', item: 'きつね' },
    unlockedPhotos: ['L', 'お'],
    updatedPhotosAtPuzzle: { },
    unlockedLocationItems: {
      K: ['暖簾', '募金箱']
    },
    partnerEvents: [
      { targetPhoto: 'お',  message: 'おかしいな...Ｅの謎の球体を提出した場所に木のフィギュア？が出現してる...'        
       },
      ]
  },
];

export const LAST_STEP_START_PHOTO_UPDATE: PhotoUpdateData = {
  unlockedPhotos: [],
  // updatedPhotos: {'B': 'B', 'I': 'I5'},
};

export const LAST_STEP_SUBMISSIONS: LastStepSubmissionData[] = [
  {
    stepIndex: 0,
    label: '0',
    originalSubmittedItem: 'キー',
    retryItem: 'キー',
    acceptedTargets: [{ location: 'A', item: '金庫', position: '中' }],
  },
  {
    stepIndex: 1,
    label: '1',
    originalSubmittedItem: '電池',
    retryItem: 'コーラ',
    acceptedRetryItems: ['コカ・コーラ', 'こか・こーら', 'コカコーラ', 'こかこーら', 'こーら', '缶', 'かん'],
    acceptedTargets: [{ location: 'I', item: '酒瓶', position: '左' }],
  },
  {
    stepIndex: 2,
    label: '1-5',
    originalSubmittedItem: 'ライオンの銅像',
    retryItem: '机',
    acceptedRetryItems: ['つくえ', 'デスク', 'テーブル', 'ローテーブル'],
    acceptedTargets: [
      { location: 'A', item: '盆', position: '下' },
      { location: 'A', item: '湯呑', position: '下' },
      { location: 'A', item: 'ティーパック', position: '下' },
      { location: 'A', item: '畳', position: '上' },
    ],
  },
  {
    stepIndex: 3,
    label: '2',
    originalSubmittedItem: '卵',
    retryItem: '横山',
    acceptedRetryItems: ['よこやま', 'ヨコヤマ', '横山'],
    acceptedTargets: [{ location: 'B', item: '時計', position: '下' }],
  },
  {
    stepIndex: 4,
    label: '3',
    originalSubmittedItem: 'バスボール',
    logDisplayItem: '球体',
    retryItem: 'ピンポン玉',
    acceptedRetryItems: ['ピンポン玉', 'ピンポンだま', '卓球の玉', '卓球玉', '卓球だま'],
    acceptedTargets: [
      { location: 'C', item: 'ラケット', position: '下' },
      { location: 'C', item: '卓球台', position: '上' },
    ],
  },
  {
    stepIndex: 5,
    label: '4',
    originalSubmittedItem: 'ハンガー',
    retryItem: '10円玉',
    acceptedRetryItems: ['10','１０','10円玉', '10えんだま', 'じゅうえんだま', 'ジュウエンダマ', '10円', '10えん', 'じゅうえん', 'ジュウエン', '銅貨', 'どうか'],
    acceptedTargets: [{ location: 'K', item: '募金箱', position: '中' }],
  },
  {
    stepIndex: 6,
    label: '5',
    originalSubmittedItem: '缶',
    retryItem: '1円玉',
    acceptedRetryItems: ['1','１','1円玉', '1えんだま', 'いちえんだま', 'イチエンダマ', '1円', '1えん', 'いちえん', 'イチエン'],
    acceptedTargets: [{ location: 'K', item: '募金箱', position: '中' }],
    excludeFromFinalSubmission: true,
  },
  {
    stepIndex: 7,
    label: '6',
    originalSubmittedItem: '座布団',
    retryItem: '座布団',
    acceptedTargets: [{ location: 'A', item: 'イス', position: '上' }],
  },
  {
    stepIndex: 8,
    label: '7',
    originalSubmittedItem: '蜘蛛',
    retryItem: 'バスボール',
    acceptedRetryItems: ['ばすぼむ', '入浴剤', 'ばすだま', 'バスだま', '入浴球', 'にゅうよくだま', 'にゅうよくきゅう', 'ばすぼーる', 'バスぼーる', 'ばすボール', 'バスボム'],
    acceptedTargets: [{ location: 'F', item: 'パック', position: '外' }],
    isPending: true,
  },
];

const RESUBMISSION_TARGETS = LAST_STEP_SUBMISSIONS.filter(
  submission => !submission.excludeFromFinalSubmission
);

export const FINAL_STEP_SUBMISSIONS = RESUBMISSION_TARGETS.filter(
  submission => submission.stepIndex === 4
);

export const BONUS_STEP_SUBMISSIONS = LAST_STEP_SUBMISSIONS.filter(
  submission => submission.stepIndex !== 4 && submission.stepIndex !== 8
);

export const LOCATIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
export const POSITIONS = ['中','上', '下', '左', '右'];
