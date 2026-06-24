type HintGroup = {
  label: string;
  hints: string[];
};

type HintSection = {
  title: string;
  groups: HintGroup[];
};

const hintSections: HintSection[] = [
  {
    title: '提出場所「あ」',
    groups: [
      {
        label: '謎ヒント',
        hints: [
          'それぞれのアイテムを素直に言ったとき、共通点はないでしょうか？',
          '右側のイラストは緑茶です',
          '色が共通していないでしょうか？',
          '英語で埋めてみましょう',
          'brown,gold,gray,greenが順番に入ります',
        ],
      },
      {
        label: 'お題',
        hints: ['指示の通り場所A、金庫、中で回答しよう'],
      },
    ],
  },
  {
    title: '提出場所「い」',
    groups: [
      {
        label: '謎ヒント',
        hints: [
          '右上のイラストは「しし」です',
          '時計は何時頃を指しているでしょうか？',
          '4時4分が「しし」となる言い方の法則はないでしょうか？',
          '午後をアルファベットで表すと？',
        ],
      },
      {
        label: 'お題',
        hints: [
          'たんさん、を色々言い換えてみましょう',
          '写真上では見えていないが、写真に写っているアイテムに関連する「たんさん」はないでしょうか？',
          '「単三」電池があるとしたらどこでしょうか？',
          '時計に電池が入っていそうです',
        ],
      },
    ],
  },
  {
    title: '提出場所「う」',
    groups: [
      {
        label: '謎',
        hints: [
          '上の例示はラケットです',
          '色によってそれぞれの位置が分かりそうです',
          '矢印ということはフリック入力ではないでしょうか？',
          'フリック入力にしてはマスが多いですが、フリック入力の左下が何か考えましょう（分からない場合は調べてみましょう）',
        ],
      },
      {
        label: 'お題',
        hints: [
          '足が偶数本の生き物のようなものはなかったでしょうか？',
          'ライオンの銅像がありました',
        ],
      },
    ],
  },
  {
    title: '提出場所「え」',
    groups: [
      {
        label: '謎',
        hints: ['言葉を思いつくかどうかです。3つ目が一番簡単です'],
      },
      {
        label: 'お題',
        hints: [
          '黄のアイテムは見えないです',
          '黄色っぽいものを含んでいるものを探してみましょう',
          'それは内部に黄色を持っています',
          'キミはないでしょうか？',
          '卵の黄身です',
          '卵のパックの中に卵（黄身）があります',
        ],
      },
    ],
  },
  {
    title: '提出場所「お」',
    groups: [
      {
        label: '謎',
        hints: [
          'ひとまずカタカナで入れてみましょう',
          'カタカナで入れてから黄色矢印に従って変換してみましょう',
          '何かしらの共通点はないでしょうか？',
          'ドライヤーの黄色矢印変換は少し特殊です',
          'ハブラシ、タタミ、カミソリに共通点がないか考えましょう',
          'ハブラシ、タタミ、カミソリは共通して、○○を含んでいます',
          '音階が共通点です。音階を含むように黄色矢印で変換してみましょう',
          'ドが1、シが7となるようです',
          '含んでいる音階を足し算してみましょう',
          '答えは１２です',
        ],
      },
      {
        label: 'お題',
        hints: [
          '球体に見えるものは、相棒が言う通りFの何かしらのパックの中にしか無さそうです',
          'F、パック、中で回答しましょう',
        ],
      },
    ],
  },
  {
    title: '提出場所「か」',
    groups: [
      {
        label: '謎',
        hints: [
          '⅓と⅔はこれまででてきていません。想像して解きましょう',
          '瓶が何を示しているか考えてみましょう',
          '３つの法則を考えてみましょう',
          '？の大きさにも注目しましょう',
          '瓶は「しょうちゅう」を表しています',
          '小、中、？',
        ],
      },
      {
        label: 'お題',
        hints: [
          'かけるものではなく、かけるのに使うものです',
          'かけるの意味を色々考えてみましょう',
          '見えていないけど、かけられているものはないでしょうか？',
          '浴衣をよく見てみましょう',
        ],
      },
    ],
  },
  {
    title: '提出場所「き」',
    groups: [
      {
        label: '謎',
        hints: [
          '右側と左側の上部の何かが入れ替わっているようです',
          '右側の上部のものをご存じではないでしょうか？赤い丸が大きくて目立っています',
          '赤い丸は太陽を表しています',
          '右側の中のイラストたちを平仮名（カタカナ）で書き出してみましょう',
          '太陽に関係するものに注目して、含まれているものの法則を見つけましょう',
          '左から水金地火木土天海の文字が含まれていると黒塗りになっているようです',
          '左側の法則も同様に考えてみましょう',
          'インクのようなもので見えないせいで、全て書き出しても言葉が足りません。写真の変化と組み合わせて考えてみましょう',
          '掛け軸の文字が増えていることに注目しましょう',
          '法則は右から一十百千万です',
          'インクのようなものが墨汁、墨汁の下が饅頭です',
          '文字を消して右側に足りない「蜘蛛」が答えです',
        ],
      },
      {
        label: 'お題',
        hints: [
          'アルミの材質が有名なものを探しましょう',
          'アルミ○○です',
          'アルミ缶です。アルミ缶かどうかは相棒が見分けてくれます',
        ],
      },
    ],
  },
  {
    title: '提出場所「く」',
    groups: [
      {
        label: '謎',
        hints: [
          '上から2段目の例示から考えてみましょう',
          '上から3段目と2段目は×Cが増えたことによる違いです',
          'Aは縦、Bは横です',
          '縦×横をすると何が出るでしょうか？',
          '縦×横で面積が出ます',
          'Ｃは高さです',
          '右上は体重計です',
          '上から1段目は足の長さを示しています',
          '足の長さ、体重計の長さは一般的にどんな単位でしょうか？',
          'センチメートルです',
          '一番下の段は体重計と足が合わさっていることを表しています',
          '体重計に足を乗っけたらどんな単位が出るでしょうか？',
          'キログラムです',
        ],
      },
      {
        label: 'お題',
        hints: [
          'おそらくこの場所は温泉旅館です',
          '座るときにあった方が良さそうなものです',
          '座布団です',
          '座布団があるべき場所はどこでしょうか？写真を探してみましょう',
          '旅館の部屋を想像してみましょう（イメージがわかない場合はインターネット検索しましょう）',
          'イスが硬そうなので座布団があった方が良さそうです',
        ],
      },
    ],
  },
  {
    title: 'LASTSTEP1 提出場所「？」',
    groups: [
      {
        label: '謎',
        hints: [
          'イラストは暖簾です',
          '暖簾とロウニンをカタカナで考えましょう',
          '答えとなる二つの四角の一部に×がついています。その部分だけ消すことができるような文字を考えてみましょう',
          '答えは漢字です',
          '緑矢印の左下向きと右下向きでルのような漢字の部位を表しています',
          '緑丸は漢字を3つに分割した際の真ん中を意味しています',
          '左側の漢字は完です',
          '答えは完治です',
        ],
      },
    ],
  },
];

export const metadata = {
  title: 'ヒント一覧',
};

export default function HintsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <header className="sticky top-0 z-10 -mx-4 mb-5 border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur">
          <p className="text-xs font-black tracking-[0.35em] text-cyan-300">HINTS</p>
          <h1 className="mt-1 text-2xl font-black text-white">ヒント一覧</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            見たい提出場所を選び、必要な分だけヒントを開いてください。
          </p>
        </header>

        <div className="space-y-4 pb-12">
          {hintSections.map(section => (
            <section key={section.title} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl">
              <h2 className="text-lg font-black text-cyan-100">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.groups.map(group => (
                  <div key={`${section.title}-${group.label}`}>
                    <h3 className="mb-2 text-sm font-bold text-amber-300">{group.label}</h3>
                    <div className="space-y-2">
                      {group.hints.map((hint, index) => (
                        <details key={`${section.title}-${group.label}-${index}`} className="group rounded-xl border border-slate-700 bg-slate-950/70">
                          <summary className="cursor-pointer list-none px-3 py-2 text-sm font-bold text-slate-200 transition-colors group-open:text-cyan-200">
                            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-amber-200">
                              {index + 1}
                            </span>
                            ヒント {index + 1}
                          </summary>
                          <p className="border-t border-slate-800 px-4 py-3 text-sm leading-relaxed text-slate-200">
                            {hint}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
