export type Level = 'basic' | 'intermediate' | 'nightmare'
export interface Lesson {
  id: string
  level: Level
  title: string
  summary: string
  hooks: string[]
  requirements: string[]
  checks: string[]
  testHints: string[]
  file: string
  reference: {
    title: string
    explanation: string
    code: string
    demo: 'state' | 'effect' | 'ref' | 'reducer' | 'context' | 'memo' | 'async' | 'middleware' | 'transition'
  }
}

const workspace = 'src/exercises/chapters.tsx'
const server = 'server/exercises.ts + src/exercises/chapters.tsx'
const refs: Record<string, Lesson['reference']> = {
  state: { title: 'useState — UIと状態', explanation: '状態の更新は次の描画につながります。直前の値に依存する更新には関数形式を使います。配列やオブジェクトは新しく作ります。', code: 'const [count, setCount] = useState(0)\n<button onClick={() => setCount(n => n + 1)}>{count}</button>', demo: 'state' },
  effect: { title: 'useEffect — 外部との同期', explanation: 'Effectは通信やタイマーなど外部との同期に使います。表示値の計算だけならレンダー中に行い、不要なEffectを増やしません。終了時は後始末をします。', code: 'useEffect(() => {\n  const timer = setInterval(() => setSeconds(s => s + 1), 1000)\n  return () => clearInterval(timer)\n}, [])', demo: 'effect' },
  ref: { title: 'useRef / useId — 入力を支える', explanation: 'refはDOM参照など描画に使わない値を保持します。refの変更は再描画を起こしません。useIdでラベルと入力を関連付けます。', code: 'const inputRef = useRef<HTMLInputElement>(null)\nconst id = useId()\n<label htmlFor={id}>名前</label>\n<input id={id} ref={inputRef} />\n<button onClick={() => inputRef.current?.focus()}>入力へ</button>', demo: 'ref' },
  reducer: { title: 'useReducer — 状態遷移を集める', explanation: 'イベントをactionとして表現し、純粋なreducerで次の状態を返します。通信やDOM操作はreducerの外で扱います。', code: 'function reducer(state: number, action: "increment" | "reset") {\n  return action === "reset" ? 0 : state + 1\n}\nconst [count, dispatch] = useReducer(reducer, 0)', demo: 'reducer' },
  context: { title: 'useContext — 必要な場所へ届ける', explanation: 'Contextはツリー内で値を共有します。共有範囲を絞り、各コンポーネント固有の状態まで集約しないようにします。', code: 'const ThemeContext = createContext("light")\nfunction Label() {\n  const theme = useContext(ThemeContext)\n  return <span className={theme}>テーマ</span>\n}', demo: 'context' },
  memo: { title: 'useMemo / useCallback — 計測して判断', explanation: '計算結果と関数参照を再利用します。正しさの仕組みではありません。依存配列を正しく指定し、Profilerで改善が確認できる場合に採用します。', code: 'const total = useMemo(() => expensiveSum(values), [values])\nconst onSelect = useCallback((id: string) => {\n  setSelectedId(id)\n}, [])', demo: 'memo' },
  async: { title: '非同期処理 — 中断と状態', explanation: '通信中・成功・失敗を区別します。Effectから取得する場合は後始末で古い通信を中断できます。AbortErrorと本当の失敗を区別しましょう。', code: 'useEffect(() => {\n  const controller = new AbortController()\n  loadPreview(controller.signal).catch(error => {\n    if (error.name !== "AbortError") setError(error.message)\n  })\n  return () => controller.abort()\n}, [])', demo: 'async' },
  middleware: { title: 'Express — ミドルウェアの順序', explanation: 'ミドルウェアは登録順に動きます。レスポンスを終了するかnextで後続へ進みます。エラーハンドラーはルートの後に登録します。デモは起動中のExpressに通信し、HTTP状態と通過順を表示します。', code: 'import express, { type ErrorRequestHandler } from "express"\nconst app = express()\napp.use(express.json())\napp.use((req, res, next) => {\n  res.setHeader("X-Learning-App", "demo")\n  next()\n})\napp.get("/api/ping", (_req, res) => res.json({ ok: true }))\nconst handleError: ErrorRequestHandler = (_err, _req, res, _next) => {\n  res.status(500).json({ message: "処理に失敗しました" })\n}\napp.use(handleError)', demo: 'middleware' },
  transition: { title: 'useTransition / useDeferredValue — 応答性', explanation: '入力の更新を優先し、重い表示の更新を後に回します。処理量自体が減るわけではなく、通信の間引きにもなりません。入力値そのものをTransition内で更新しないでください。', code: 'const [query, setQuery] = useState("")\nconst deferredQuery = useDeferredValue(query)\nconst [isPending, startTransition] = useTransition()\n// 入力はsetQueryで即時更新\n// 別の重い表示切替はstartTransition内で更新', demo: 'transition' },
}

export const lessons: Lesson[] = [
  {
    id: 'basic-01', level: 'basic', title: 'タスクを追加して一覧に表示', summary: '最初の操作からUI更新までをuseStateでつなぐ。', hooks: ['useState'], file: workspace,
    requirements: ['タイトル入力と追加ボタンを実装する。', '空白だけの入力は拒否し、タイトルの前後空白を除く。', '追加ごとに一意なIDを付け、入力を空にする。'],
    checks: ['2件追加すると入力した順で表示される。', '空白だけの入力では件数が増えず、理由が表示される。'],
    testHints: ['UI確認後、Testing Libraryで入力→追加→一覧表示を検証する。', '空文字と空白のみの入力をパラメータ化して検証する。'], reference: refs.state,
  },
  {
    id: 'basic-02', level: 'basic', title: '編集と削除を実装', summary: 'IDを基準に更新し、配列を不変に扱う。', hooks: ['useState'], file: workspace,
    requirements: ['タスクのタイトルを編集・保存・キャンセルできる。', '編集でも空白のみのタイトルを拒否する。', '指定したIDのタスクだけを削除する。'],
    checks: ['同名タスクが2件あっても選択した1件だけを編集・削除できる。', 'キャンセルで元のタイトルが維持される。'],
    testHints: ['保存とキャンセルを別のUIテストにする。', '同名タスクの削除後、残るIDを確認する。'], reference: refs.state,
  },
  {
    id: 'basic-03', level: 'basic', title: '完了と未完了を切り替え', summary: '状態から件数と見た目を導く。', hooks: ['useState'], file: workspace,
    requirements: ['チェックボックスで完了状態を切り替える。', '完了タスクは見た目とテキストの両方で区別する。', '未完了件数はタスク配列から計算する。'],
    checks: ['完了→未完了と戻すと件数も元に戻る。', 'タスクが0件なら未完了件数は0になる。'],
    testHints: ['チェック操作後のchecked属性と未完了件数を検証する。', '見た目のCSS名だけでなく表示の意味を検証する。'], reference: refs.state,
  },
  {
    id: 'basic-04', level: 'basic', title: '検索・絞り込み・並び替え', summary: '派生データを重複したstateに保存しない。', hooks: ['useState'], file: workspace,
    requirements: ['タイトルの部分一致検索と全件・未完了・完了の絞り込みを実装する。', '追加順とタイトル順を切り替えられる。', '元配列を破壊せず、該当なしの状態を表示する。'],
    checks: ['検索と完了フィルターが同時に適用される。', '検索を消して追加順に戻すと元の順序になる。'],
    testHints: ['絞り込み関数をVitestで検証し、組み合わせ操作をUIテストで確認する。', 'ソート後も元配列が変化しないことを確認する。'], reference: refs.state,
  },
  {
    id: 'basic-05', level: 'basic', title: '期限と優先度を設定', summary: '複数入力とアクセシブルなラベルを整える。', hooks: ['useState', 'useId'], file: workspace,
    requirements: ['任意の期限とlow・medium・highの優先度を追加・編集できる。', '期限未設定を許可し、一覧に期限と優先度を表示する。', '各入力にラベルを付け、色だけに意味を依存させない。'],
    checks: ['期限なしでも追加でき、後から期限を設定・解除できる。', 'キーボード操作だけで各フィールドを編集できる。'],
    testHints: ['ラベルから入力を取得して設定と解除を検証する。', '日付はYYYY-MM-DDの値として検証し、時刻依存を持ち込まない。'], reference: refs.ref,
  },
  {
    id: 'basic-06', level: 'basic', title: 'Expressで取得と保存', summary: 'ReactだけのアプリをAPIへ接続する。', hooks: ['useEffect', 'useState', 'Express Router'], file: server,
    requirements: ['GET・POST /api/tasksとPATCH・DELETE /api/tasks/:idを実装する。', 'メモリ保存を使い、サーバー再起動でデータが消えることを表示する。', 'UIに通信中・成功・失敗を表示し、初回取得をEffectで行う。'],
    checks: ['追加・編集・完了切替・削除が再読込後にも反映される。', 'API停止時にエラーが見え、通信中の表示が終了する。'],
    testHints: ['UI確認後、APIの成功応答と存在しないIDをVitestで検証する。', 'UIテストでは通信を制御し、loading→成功とloading→失敗を確認する。'], reference: refs.effect,
  },
  {
    id: 'basic-07', level: 'basic', title: 'PostgreSQLとPrismaをローカルで起動', summary: 'ローカルに教材用DBを作り、Prismaで保存・取得する。', hooks: ['PostgreSQL', 'Prisma', 'マイグレーション'], file: 'prisma/schema.prisma + server/db/practice-service.ts',
    requirements: ['既存のローカルPostgreSQLに教材専用DBを作り、.envを接続先に合わせる。', 'npm run db:apply → npm run db:generate → npm run db:checkの順に保存と取得を確認する。', 'npm run db:demoでタスクを保存し、再実行して同じIDとタイトルを取得する。'],
    checks: ['直接インストールしたPostgreSQLで保存・再取得でき、Prisma StudioでPracticeTaskを確認できる。', 'プログラムを終了しても保存したタスクを同じIDで再取得できる。'],
    testHints: ['提供済みのURL検証と実DBへの疎通確認は別の検証。', 'mockテストの成功だけではマイグレーションや保存の成功は確認できない。'], reference: refs.middleware,
  },
  {
    id: 'intermediate-01', level: 'intermediate', title: '状態遷移をreducerに整理', summary: '追加・編集・削除・完了のルールを集約する。', hooks: ['useReducer'], file: workspace,
    requirements: ['既存のタスク操作をactionとして定義する。', 'reducerは副作用を持たず、入力のstateを変更しない。', '操作の見た目と結果を維持する。'],
    checks: ['基礎のすべての操作が同じ結果になる。', '存在しないIDへの操作でも他のタスクは変化しない。'],
    testHints: ['reducerを表形式で検証し、主要操作のUIテストも維持する。', '凍結した入力stateで不変性を検証する。'], reference: refs.reducer,
  },
  {
    id: 'intermediate-02', level: 'intermediate', title: 'Contextと独自Hookで共有', summary: '一覧とサマリーの共有状態を整理する。', hooks: ['useContext', 'useReducer', 'custom Hook'], file: workspace,
    requirements: ['一覧と件数サマリーが同じタスク状態を参照する。', 'Providerと利用用Hookでアクセスをまとめる。', '入力途中の文字など局所的な状態は必要な範囲に置く。'],
    checks: ['一覧で完了を切り替えると離れたサマリーも更新される。', '別のProviderを置いた場合、状態が相互に混ざらない。'],
    testHints: ['Provider込みのUIテストで共有状態を検証する。', 'Providerがない場合の明確なエラーも検証する。'], reference: refs.context,
  },
  {
    id: 'intermediate-03', level: 'intermediate', title: '入力とフォーカスを改善', summary: '編集開始や入力エラー時の移動を自然にする。', hooks: ['useRef', 'useId', 'useEffect'], file: workspace,
    requirements: ['編集開始時に対象の入力へフォーカスする。', '入力エラーを入力欄と関連付け、保存成功後は適切な操作位置へ戻す。', 'DOM参照をstateに保存しない。'],
    checks: ['マウスなしで編集・保存・キャンセルを完了できる。', 'エラー時に入力内容が失われず、修正箇所が分かる。'],
    testHints: ['userEventとtoHaveFocusでフォーカス移動を検証する。', 'エラーメッセージとaria-describedbyの関係を検証する。'], reference: refs.ref,
  },
  {
    id: 'intermediate-04', level: 'intermediate', title: '非同期検索を独自Hookへ', summary: '待機・失敗・再試行を一貫して扱う。', hooks: ['useEffect', 'custom Hook'], file: server,
    requirements: ['APIにタイトル検索クエリを追加する。', '取得処理を独自Hookに分け、通信中と失敗、再試行を提供する。', 'Effectの依存とcleanupを定義し、アンマウント時の通信を中断する。'],
    checks: ['検索語を変更すると対応する結果と通信状態が表示される。', '失敗後にAPIを復旧すると再試行で一覧を取得できる。'],
    testHints: ['通信をモックして失敗→再試行→成功を検証する。', 'アンマウント時にsignalがabortされることを検証する。'], reference: refs.async,
  },
  {
    id: 'intermediate-05', level: 'intermediate', title: '計測して検索表示を最適化', summary: '最適化の効果を実測で判断する。', hooks: ['useMemo', 'useCallback'], file: workspace,
    requirements: ['十分な件数のデータでProfilerを使い、変更前の描画時間を記録する。', '負荷のある計算や不要な子描画が確認できた箇所だけ最適化する。', '変更後の同じ操作を計測し、改善しない場合は採用しない判断も残す。'],
    checks: ['検索結果と操作結果が変更前と一致する。', '同じデータ・操作条件で変更前後の測定結果を比較できる。'],
    testHints: ['検索結果の回帰を検証し、厳密な実行時間をCIの合否条件にしない。', '依存する値を変えたとき古い結果が残らないことを確認する。'], reference: refs.memo,
  },
  {
    id: 'intermediate-06', level: 'intermediate', title: 'ミドルウェアでAPIを整える', summary: '入力検証と共通エラー処理を体験する。', hooks: ['express.json', 'middleware', 'error handler'], file: server,
    requirements: ['JSON解析→入力検証→ルート→共通エラー処理の順を整理する。', '不正入力は400、未知のIDは404を返す。', 'エラー応答の形式を統一し、UIに説明を表示する。'],
    checks: ['空白タイトルの送信は400になり、一覧に追加されない。', '未知のIDを操作すると404の説明が表示される。'],
    testHints: ['不正なJSON・入力・未知IDの応答をAPIテストで検証する。', 'レスポンスが一度だけ送られ、後続処理に進まないことを確認する。'], reference: refs.middleware,
  },
  {
    id: 'intermediate-07', level: 'intermediate', title: 'Prismaのモックテストを書く', summary: 'DBなしで成功・不正入力・通信失敗を再現し、保存処理の責務を学ぶ。', hooks: ['Vitest', 'Prisma', 'mockResolvedValue', 'mockRejectedValue'], file: 'server/prisma.test.ts + server/db/practice-service.ts',
    requirements: ['基礎7の実DB確認後、server/prisma.test.tsの参考例を読む。', '実PrismaClientの代わりに型付きモックをサービスへ渡す仕組みを説明する。', '一覧取得の正常系と異常系のit.todoを実装する。'],
    checks: ['DBを停止してもnpm run test:prismaが実行できる。', '引数・戻り値・エラーを検証し、モックを呼んだだけで成功にしない。'],
    testHints: ['mockResolvedValueで2件を返し、orderByと返り値を検証する。', 'mockRejectedValueとrejectsで一覧取得失敗を検証する。beforeEachでモックを初期化する。'], reference: refs.async,
  },
  {
    id: 'nightmare-01', level: 'nightmare', title: '削除をUndoできるようにする', summary: '履歴と非同期保存を含む状態遷移を設計する。', hooks: ['useReducer', 'useRef', 'useEffect'], file: server,
    requirements: ['削除後5秒間だけ取り消しを提供する。', '取消可能期間はサーバー削除を遅延し、取消で元の位置に復元する。', '連続削除を区別し、タイマーのcleanupと保存失敗を扱う。'],
    checks: ['2件続けて削除し、片方だけを取り消せる。', '5秒経過後は取消不可となり、再取得しても削除が維持される。'],
    testHints: ['UI確認後、fake timersで期限の直前・直後を検証する。', '連続削除と片方だけの取消、API失敗を検証する。'], reference: refs.reducer,
  },
  {
    id: 'nightmare-02', level: 'nightmare', title: '完了切替を楽観的に反映', summary: '待ち時間を減らし、失敗時の整合性を守る。', hooks: ['useReducer', 'useRef'], file: workspace,
    requirements: ['API応答前に完了表示を更新し、保存中を示す。', '保存失敗時は直前の確定状態に戻して理由を表示する。', '同じタスクの保存中は次の切替を無効にし、他タスクは操作可能にする。'],
    checks: ['遅延させた通信でも完了表示はすぐ変わる。', '失敗で表示と件数が戻り、別タスクの変更は維持される。'],
    testHints: ['未解決Promiseで応答前のUIを検証する。', '1件の失敗が別の成功を取り消さないことを検証する。'], reference: refs.async,
  },
  {
    id: 'nightmare-03', level: 'nightmare', title: '検索の競合と中断を制御', summary: '古いレスポンスで新しい結果を上書きしない。', hooks: ['useEffect', 'useRef', 'custom Hook'], file: workspace,
    requirements: ['検索入力から300ms待って通信する。', '古いリクエストを中断し、最新要求だけを結果に反映する。', '中断をエラーとして表示せず、最新通信のloadingを維持する。'],
    checks: ['連続入力で不要な通信が減る。', '古い応答を後から返しても最新検索の結果が保たれる。'],
    testHints: ['fake timersで300msの境界と通信回数を検証する。', '応答順を逆にし、古い成功と失敗が最新状態を壊さないことを検証する。'], reference: refs.async,
  },
  {
    id: 'nightmare-04', level: 'nightmare', title: '大量データでも入力を優先', summary: '入力と重い表示の更新優先度を分ける。', hooks: ['useDeferredValue', 'useTransition', 'useMemo'], file: workspace,
    requirements: ['大量データで入力遅延を測定してから改善する。', '入力値は即時更新し、重い検索表示に遅延値を利用する。', '別の重い表示切替をTransitionで扱い、更新待ちを表示する。'],
    checks: ['CPUを遅くした状態でも入力文字はすぐ表示される。', '更新待ちの表示が消えたら最新条件と結果が一致する。'],
    testHints: ['実行時間の閾値ではなく、最終結果と入力値の整合を検証する。', '操作感の改善はProfilerの記録と手動確認を併用する。'], reference: refs.transition,
  },
  {
    id: 'nightmare-05', level: 'nightmare', title: '同時編集の競合を検出', summary: '別画面からの更新を黙って上書きしない。', hooks: ['useReducer', 'Express middleware'], file: server,
    requirements: ['タスクにversionを持ち、更新要求で期待するversionを送る。', '古いversionは409にし、サーバーの最新データを保持する。', 'UIで競合を説明し、入力を残して再取得する選択肢を提供する。'],
    checks: ['2画面で同じタスクを開き、後から古い内容を保存すると409になる。', '入力内容と最新内容を確認してから再編集できる。'],
    testHints: ['同じversionによる2回の更新で成功と409を検証する。', '競合応答で下書きが消えず、自動再送しないことを検証する。'], reference: refs.middleware,
  },
  {
    id: 'nightmare-06', level: 'nightmare', title: '障害から安全に復旧', summary: '通信失敗を観測し、重複せず再試行する。', hooks: ['useEffect', 'useRef', 'Express middleware'], file: server,
    requirements: ['各リクエストに追跡IDを付け、UIのエラーとログを照合できるようにする。', 'POSTに操作IDを付け、同じ操作の再送で重複作成しない。', '取得の再試行には上限を設け、操作中断でタイマーと通信を終了する。'],
    checks: ['保存完了後に応答だけ失われた場合も再送でタスクが増えない。', '連続失敗で再試行が上限に達し、理由と手動再試行が表示される。'],
    testHints: ['同じ操作IDのPOSTを再送して件数と返却IDを検証する。', 'fake timersで上限・中断を検証し、ログに秘密値が含まれないことを確認する。'], reference: refs.middleware,
  },
]
