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
  unlockedPhotosAtTheme?: string[]; // お題表示時に新規解放されるフィールド写真
  updatedPhotosAtTheme?: Record<string, string>; // お題表示時に既存の写真を差し替える (例: { 'A': 'A_v2' })
  updatedPhotosAtPuzzle?: Record<string, string>; // 次の謎表示時に既存の写真を差し替える (例: { 'A': 'A_v3' })
  unlockedLocationItems?: Record<string, string[]>; // このステップで追加される、場所ごとのアイテム選択肢
  showBlueAnswerEffect?: boolean; // 正解時に青ハイライト演出を出してから「お題へ」ボタンで進む
  memos?: string[]; // このステップで判明したルールや情報
  partnerEvents?: {
    targetPhoto: string; // どの写真に会話ボタンを出すか
    displayPhotoName?: string; // 会話ボタンに表示する名前（省略時はtargetPhotoと同じ）
    message: string;     // 相棒のセリフ
    questionAnswer?: {   // 相棒イベントでのクイズ回答仕様
      answer: string;        // 正解テキスト
      unlockLocation: string; // 解放される場所(A〜L)
      unlockItem: string;     // 解放されるアイテム名
      successMessage?: string; // 正解時の相棒セリフ
    };
  }[];
}

export const GAME_STEPS: StepData[] = [
  {
    id: 0,
    title: 'チュートリアル-提出場所：「あ」',
    puzzleImage: '/images/step0.png',
    themeText: '鍵',
    puzzleAnswer: 'れでぃ',
    searchTarget: { location: 'A', position: '中', item: '金庫' },
    unlockedPhotos: ['A'],
    unlockedLocationItems: {
      A: ['灰皿', '金庫', 'ティーパック', '湯呑']
    },
    memos: ['ルール1：相棒はアイテムに干渉できず、通信と写真連携しかできない','ルール2：謎の画像内に登場したイラストしか視認できない'],
  },
  {
    id: 1,
    title: '提出場所：「い」',
    puzzleImage: '/images/step1.png',
    themeText: 'たんさん',
    puzzleAnswer: 'PM',
    searchTarget: { location: 'C', position: '中', item: '時計' },
    unlockedPhotos: ['B','C'],
    unlockedLocationItems: {
      B: ['ライオンの銅像'],
      C: ['時計']
    },
    partnerEvents: [
      { targetPhoto: 'B', message: '可視化されて分かったが、どうやら僕はこのライオンに姿を変えられてしまったらしい。そりゃ動けないわけだ。' },
      { targetPhoto: 'C', message: 'この穴の大きさに４本ぐらい、丁度あのサイズじゃないか？' }
    ],
  },
  {
    id: 1-5,
    title: '提出場所：「う」',
    puzzleImage: '/images/step1-5.png',
    themeText: 'チュートリアル2なので無し',
    puzzleAnswer: 'かけじく',
    showBlueAnswerEffect: true,
    searchTarget: { location: 'C', position: '下', item: 'いぬ' },
    unlockedPhotos: ['I'],
    updatedPhotosAtTheme: {'A': 'A2'}, // ステップ1-5のお題が出たタイミングで、写真AをA3に差し替える
    unlockedLocationItems: {
      'I': ['ラケット'],
      'A': ['掛け軸']
    },
    memos: ['ルール3：青くなった謎の回答は、イラストに出ていなくても可視化される'],

  },
  {
    id: 2,
    title: '提出場所：「え」',
    puzzleImage: '/images/step2.png',
    themeText: '漢字表示で黄を含むもの',
    puzzleAnswer: 'ぱっく',
    showBlueAnswerEffect: true,
    searchTarget: { location: 'D', position: '中', item: '卵' },
    unlockedPhotos: ['D','E','F'],
    unlockedLocationItems: {
      D: ['紙パック'],
      E: ['個包装のパック'],
      F: ['短い個包装パック（左）', '長い個包装パック（右）']
    },
    partnerEvents: [
      { 
        targetPhoto: 'D', 
        message: 'これらは中身が想像つきそうだ。写真上で右のパックの中身は何か？',
        questionAnswer: {
          answer: '納豆',
          unlockLocation: 'D',
          unlockItem: '納豆',
          successMessage: 'そうだ、納豆だ！正解したな。Cの選択肢に納豆が追加されたぞ！'
        }
      },
            { 
        targetPhoto: 'D', 
        message: 'これらは中身が想像つきそうだ。写真上で真ん中のパックの中身は何か？',
        questionAnswer: {
          answer: '卵',
          unlockLocation: 'D',
          unlockItem: '卵',
          successMessage: 'そうだ、卵だ！正解したな。Cの選択肢に卵が追加されたぞ！'
        }
      }
    ],
  },
  {
    id: 3,
    title: '提出場所：「え」',
    puzzleImage: '/images/step3.png',
    themeText: '球体',
    puzzleAnswer: '12',
    searchTarget: { location: 'E', position: '中', item: 'パック' },
    unlockedPhotos: ['G'],
    updatedPhotosAtPuzzle: { 'F': 'F2', 'A': 'A3' }, // ステップ1の謎が出たタイミングで、写真AをA2に差し替える
    unlockedLocationItems: {
      A: ['畳'],
      G: ['浴衣'],
      F: ['ドライヤー', 'ハブラシ', 'カミソリ']
    },
    partnerEvents: [
      { targetPhoto: 'E', displayPhotoName: '？', message: '球体のような形のものがないだろうか？' }
    ],
  },
  {
    id: 4,
    title: '提出場所：「え」',
    puzzleImage: '/images/step4.png',
    themeText: 'かけるのに使うもの',
    puzzleAnswer: 'だい',
    showBlueAnswerEffect: true,
    searchTarget: { location: 'E', position: '上', item: '浴衣' },
    unlockedPhotos: ['H'],
    updatedPhotosAtTheme: {'A': 'A4', 'F': 'F3', 'I': 'I2' }, 
    unlockedLocationItems: {
      H: ['酒瓶','焼酎']
    },
  },
  {
    id: 5,
    title: 'Step 5: 「お」',
    puzzleImage: '/images/step5.png',
    themeText: 'アルミ',
    puzzleAnswer: 'くも',
    showBlueAnswerEffect: true,
    searchTarget: { location: 'H', position: '右', item: 'アルミ缶(右)' },
    unlockedPhotos: ['I'],
    updatedPhotosAtPuzzle: {'A': 'A6', 'H': 'H2' },
    unlockedLocationItems: {
      A: ['墨汁', '饅頭', '盆', '扇子', 'イス'],
      H: ['右の缶', '左の缶']
    },
    partnerEvents: [
      { targetPhoto: 'H', displayPhotoName: '？', message: 'どこかにアルミはないか？',
        questionAnswer: {
          answer: '缶',
          unlockLocation: 'D',
          unlockItem: 'アルミ缶(右)',
          successMessage: 'どちらも形状も大きさも同じだが、見分けるのが得意でね...右がアルミ缶だ！！'
        },
       },
       { targetPhoto: 'H', displayPhotoName: '？', message: 'では左は何だ？',
        questionAnswer: {
          answer: 'スチール缶',
          unlockLocation: 'D',
          unlockItem: 'スチール缶（左）',
          successMessage: 'ルールによると、形状も大きさも同じ場合、物の種類が変わらないと可視化されない...。似ていることを考慮すると、左がスチール缶だ！！'
        },
       }
    ],
  },
  {
    id: 6,
    title: 'Step 6: 「か」',
    puzzleImage: '/images/step6.png',
    themeText: '尻に敷かれるもの',
    puzzleAnswer: '6',
    searchTarget: { location: 'A', position: '上', item: 'イス' },
    unlockedPhotos: ['J'],
    unlockedLocationItems: {
      J: ['体重計']
    },
  },
  {
    id: 7,
    title: 'Step 7: 「き」',
    puzzleImage: '/images/step7.png',
    themeText: '足が偶数本あるもの',
    puzzleAnswer: '7',
    searchTarget: { location: 'J', position: '下', item: 'きつね' },
    unlockedPhotos: ['K'],
    unlockedLocationItems: {
      K: ['暖簾']
    },
  },
  {
    id: 8,
    title: 'Step 8: 「く」',
    puzzleImage: '/images/step8.png',
    themeText: '「く」から始まるものを探せ',
    puzzleAnswer: '8',
    searchTarget: { location: 'L', position: '右', item: 'くるま' },
    unlockedPhotos: ['K', 'L'],
    unlockedLocationItems: {
      L: ['くるま', 'バイク', '自転車']
    },
  },
];

export const LOCATIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
export const POSITIONS = ['上', '下', '左', '右', '中'];
