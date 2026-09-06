import { useEffect, useState } from 'react'
import { lessons } from './data/curriculum'
import type { Level } from './data/curriculum'
import { advanceStep, readProgress, STORAGE_KEY } from './lib/progress'
import TaskWorkspace from './exercises/TaskWorkspace'
import ReferenceDemo from './components/ReferenceDemo'
import './App.css'

const levels: { id: Level; name: string; description: string }[] = [
  { id: 'basic', name: '基礎', description: 'まず、動くものをつくる' },
  { id: 'intermediate', name: '中級', description: '設計と体験を磨く' },
  { id: 'nightmare', name: 'ナイトメア', description: '難しい条件に立ち向かう' },
]
const steps = ['要件を読んだ', '実装した', 'UIで確認した', 'テストを追加・実行した']
function App() {
  const [selected, setSelected] = useState(lessons[0].id)
  const [progress, setProgress] = useState(readProgress)
  const [storageError, setStorageError] = useState(false)
  const lesson = lessons.find(l => l.id === selected) ?? lessons[0]
  const current = progress[lesson.id] ?? 0
  const completed = lessons.filter(l => progress[l.id] === 4).length
  const next = lessons[lessons.findIndex(l => l.id === lesson.id) + 1]
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) }
    catch { /* In-memory progress remains usable when storage is unavailable. */ }
  }, [progress])
  function record(step: number) {
    const updated = { ...progress, [lesson.id]: advanceStep(current, step) }
    setProgress(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); setStorageError(false) }
    catch { setStorageError(true) }
  }
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#main"><span className="brand-mark">h.</span>Hook & Build<span className="brand-label">LEARNING WORKSPACE</span></a><span className="local-indicator"><i />LOCAL LEARNING</span></header>
    <div className="layout">
      <aside className="sidebar" aria-label="カリキュラム">
        <div className="eyebrow">YOUR LEARNING PATH</div><h2>小さくつくる。<br />深くわかる。</h2><p className="muted">React / Express / Testing</p>
        <div className="course-progress"><span>学習の進捗</span><strong>{completed}<small> / {lessons.length}</small></strong><progress value={completed} max={lessons.length} aria-label="完了した課題" /></div>
        <nav aria-label="課題一覧">{levels.map((level, index) => <section className="level-group" key={level.id}>
          <div className="level-heading"><span>0{index + 1}</span><div><h3>{level.name}</h3><small>{level.description}</small></div></div>
          {lessons.filter(l => l.level === level.id).map((l, i) => <button key={l.id} className={`lesson-link ${selected === l.id ? 'active' : ''}`} aria-current={selected === l.id ? 'step' : undefined} onClick={() => setSelected(l.id)}><span className="lesson-number">{progress[l.id] === 4 ? '✓' : String(i + 1).padStart(2, '0')}</span><span>{l.title}</span><span aria-hidden="true">{selected === l.id ? '↗' : ''}</span></button>)}
        </section>)}</nav>
        <div className="sidebar-note">理解は、コードの向こう側に。<br />一つずつ、自分の手で。</div>
      </aside>
      <main id="main">
        <div className="breadcrumb">学習ワークスペース <span>/</span> {levels.find(l => l.id === lesson.level)?.name}</div>
        <div className="page-heading"><div><div className="eyebrow">BUILD → OBSERVE → VERIFY</div><h1>つくって、動かして、確かめる。</h1><p>要件からはじめる、あなたのタスク管理アプリ。</p></div><span className="chapter-count">{String(lessons.indexOf(lesson) + 1).padStart(2, '0')}<small> / {lessons.length}</small></span></div>
        <div className="learning-flow">{['要件を読む', '実装する', 'UIで確認', 'テストを追加'].map((s, i) => <div key={s} className={i < current ? 'done' : i === current ? 'current' : ''}><span>{i < current ? '✓' : `0${i + 1}`}</span>{s}{i < 3 && <b aria-hidden="true">→</b>}</div>)}</div>
        <div className="work-grid">
          <article className="lesson-card" key={lesson.id}>
            <div className="card-top"><span className="badge green">{levels.find(l => l.id === lesson.level)?.name}</span><span className="muted">CHALLENGE {String(lessons.indexOf(lesson) + 1).padStart(2, '0')}</span></div>
            <h2>{lesson.title}</h2><p className="lesson-summary">{lesson.summary}</p><div className="tags">{lesson.hooks.map(h => <span key={h}>{h}</span>)}</div>
            <section className="requirements"><h3><span>01</span>実装する要件</h3><ul>{lesson.requirements.map(r => <li key={r}>{r}</li>)}</ul></section>
            <section className="edit-location"><h3><span>02</span>コードを書く場所</h3><code>{lesson.file}</code><p>エディタで編集して保存すると、プレビューに反映されます。APIの変更はサーバー側で確認しましょう。</p></section>
            <section><h3><span>03</span>UIで確かめること</h3><ul>{lesson.checks.map(c => <li key={c}>{c}</li>)}</ul></section>
            <section><h3><span>04</span>実装を立証するテスト</h3><ul>{lesson.testHints.map(t => <li key={t}>{t}</li>)}</ul><p className="muted">UI確認の後にテストを追記。Vitest: <code>npm test</code> / ブラウザ: <code>npm run test:e2e</code></p></section>
            <details className="reference"><summary><span>参考書をひらく<small>{lesson.reference.title}</small></span><span className="toggle-label">開閉 ＋</span></summary><div className="reference-content"><p>{lesson.reference.explanation}</p><pre><code>{lesson.reference.code}</code></pre><ReferenceDemo kind={lesson.reference.demo} /><p className="muted">独立した参考例です。課題の完成判定には含まれません。</p></div></details>
            <div className="checklist"><h3>取り組みを記録</h3><p>順番に確認しましょう。テスト結果は自己申告です。</p>{steps.map((s, i) => <label key={s}><input type="checkbox" checked={i < current} disabled={i > current} onChange={() => record(i)} />{s}</label>)}{storageError && <p role="alert">進捗を保存できません。この画面では続けられますが、再読み込みすると失われます。</p>}</div>
            {next ? <button className="primary next-button" disabled={current !== 4} onClick={() => setSelected(next.id)}>次の課題へ <span>→</span></button> : current === 4 && <p role="status">最終課題を完了しました。学んだことを振り返りましょう。</p>}
          </article>
          <aside className="preview-column" aria-label="実装と学習ガイド"><div className="preview-header"><span><i />LIVE PREVIEW</span><small>あなたのコードが動く場所</small></div><TaskWorkspace /><div className="mentor-note"><span className="eyebrow">LEARNING NOTE</span><h3>「動いた」の、その先へ。</h3><p>まずは自分の手で実装。UIの変化を確かめたら、その振る舞いをテストで言葉にしてみましょう。</p><div className="note-line" /><p>詰まったら、課題内の参考書をひらく。必要な分だけ、ヒントを取り入れよう。</p></div><details className="setup-guide"><summary>起動とテストのガイド</summary><p><code>npm run dev</code> で画面とAPIを起動します。</p><p><code>src/exercises/TaskWorkspace.test.tsx</code> にコンポーネントテスト、<code>e2e/exercises/</code> にUIテストを追加します。</p><p>提供済みテストは学習基盤の検証です。あなたの課題が完成したことを保証するものではありません。</p></details></aside>
        </div><footer>Hook & Build <span>一つの機能を、基礎からナイトメアまで。</span></footer>
      </main>
    </div>
  </div>
}
export default App
