import { createContext, useContext, useDeferredValue, useEffect, useMemo, useReducer, useRef, useState, useTransition } from 'react'

type DemoKind = 'state' | 'effect' | 'ref' | 'reducer' | 'context' | 'memo' | 'async' | 'middleware' | 'transition'
function StateDemo() {
  const [count, setCount] = useState(0)
  return <><output aria-live="polite">カウント: {count}</output><button onClick={() => setCount(c => c + 1)}>＋1する</button><button onClick={() => setCount(0)}>リセット</button></>
}
function Ticker() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => { const timer = setInterval(() => setSeconds(s => s + 1), 1000); return () => clearInterval(timer) }, [])
  return <output aria-live="off">購読中: {seconds} 秒</output>
}
function EffectDemo() {
  const [running, setRunning] = useState(false)
  return <><button onClick={() => setRunning(r => !r)}>{running ? '購読を解除' : 'タイマーを購読'}</button>{running ? <Ticker /> : <p>解除するとタイマーをクリーンアップします。</p>}</>
}
function RefDemo() {
  const input = useRef<HTMLInputElement>(null)
  return <><input ref={input} aria-label="フォーカスのデモ" placeholder="ボタンからフォーカス" /><button onClick={() => input.current?.focus()}>入力欄にフォーカス</button></>
}
function ReducerDemo() {
  const [count, dispatch] = useReducer((n: number, action: 'plus' | 'reset') => action === 'plus' ? n + 1 : 0, 0)
  return <><output>集計値: {count}</output><button onClick={() => dispatch('plus')}>plusを送信</button><button onClick={() => dispatch('reset')}>resetを送信</button></>
}
const ThemeContext = createContext('light')
function ThemePreview() { const theme = useContext(ThemeContext); return <div className={`theme-preview ${theme}`}>子コンポーネントのテーマ: {theme}</div> }
function ContextDemo() { const [dark, setDark] = useState(false); return <><button onClick={() => setDark(v => !v)}>共有テーマを切り替え</button><ThemeContext.Provider value={dark ? 'dark' : 'light'}><ThemePreview /></ThemeContext.Provider></> }
function MemoDemo() {
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(false)
  const items = useMemo(() => Array.from({ length: 10000 }, (_, i) => `item-${i}`).filter(s => s.includes(query)), [query])
  return <><input aria-label="デモの検索" value={query} onChange={e => setQuery(e.target.value)} placeholder="item-99" /><output>{items.length} 件</output><button onClick={() => setDark(v => !v)}>関係ない表示を変更</button><p className={dark ? 'accent' : ''}>queryが変わったときに再計算。速度差はProfilerで測定し、必要な場合だけ最適化します。</p></>
}
function AsyncDemo() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')
  const latest = useRef(0)
  useEffect(() => {
    const request = ++latest.current
    const timer = setTimeout(() => { if (latest.current === request) setResult(query) }, 700)
    return () => { clearTimeout(timer) }
  }, [query])
  return <><input aria-label="非同期デモの入力" value={query} onChange={e => setQuery(e.target.value)} placeholder="連続して入力してみよう" /><output aria-live="polite">{query !== result ? '待機中…' : `結果: ${result || '未入力'}`}</output><p>このデモは700msのタイマーで遅延を再現します。入力変更時に前のタイマーを解除し、最新の入力だけを反映します。実通信ではAbortControllerを使います。</p></>
}
function TransitionDemo() {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const [size, setSize] = useState(1000)
  const [pending, startTransition] = useTransition()
  const rows = useMemo(() => Array.from({ length: size }, (_, i) => `row-${i}`).filter(v => v.includes(deferred)), [size, deferred])
  return <><input aria-label="応答性デモの入力" value={query} onChange={e => setQuery(e.target.value)} /><button onClick={() => startTransition(() => setSize(n => n === 1000 ? 10000 : 1000))}>データ量を切り替え</button><output>{pending || deferred !== query ? '表示を更新中…' : `${rows.length} 件 / 入力: ${query}`}</output><p>入力は即時更新。件数計算は遅延値で行います。小さな負荷では待機表示は一瞬です。ProfilerとCPU制限で観測してください。</p></>
}
function PipelineDemo() {
  const [result, setResult] = useState('未送信')
  const [busy, setBusy] = useState(false)
  async function send(fail: boolean) {
    setBusy(true); setResult('通信中…')
    try {
      const response = await fetch(`/api/reference/pipeline${fail ? '?fail=1' : ''}`)
      const body: unknown = await response.json()
      setResult(`HTTP ${response.status}\n${JSON.stringify(body, null, 2)}`)
    } catch { setResult('接続できません。npm run dev でExpressも起動してください。') }
    finally { setBusy(false) }
  }
  return <><button disabled={busy} onClick={() => void send(false)}>正常リクエスト</button><button disabled={busy} onClick={() => void send(true)}>エラーを確認</button><pre role="status">{result}</pre></>
}
export default function ReferenceDemo({ kind }: { kind: DemoKind }) {
  const demos = { state: StateDemo, effect: EffectDemo, ref: RefDemo, reducer: ReducerDemo, context: ContextDemo, memo: MemoDemo, async: AsyncDemo, middleware: PipelineDemo, transition: TransitionDemo }
  const Demo = demos[kind]
  return <div className="demo"><div className="eyebrow">INTERACTIVE DEMO</div><Demo /></div>
}
