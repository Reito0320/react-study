import TestChallenge from './components/TestChallenge'
import { motion, MotionConfig, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { lessons } from './data/curriculum'
import type { Level } from './data/curriculum'
import { advanceStep, readProgress, STORAGE_KEY } from './lib/progress'
import Chapters from './exercises/chapters'
import TestResultsPanel from './components/TestResultsPanel'
import { NextAction } from './components/LearningGuide'
import ChapterZero from './tutorial/ChapterZero'
import './App.css'

const levels: { id: Level; name: string; description: string }[] = [
  { id: 'basic', name: '基礎', description: 'まず、動くものをつくる' },
  { id: 'intermediate', name: '中級', description: '設計と体験を磨く' },
  { id: 'nightmare', name: 'ナイトメア', description: '難しい条件に立ち向かう' },
]
const steps = ['要件を読んだ', '実装した', 'UIで確認した', 'テストを追加・実行した']
function App() {
  const reduceMotion = useReducedMotion()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem('hook-lab-sidebar-collapsed') === 'true' } catch { return false } })
  const [selected, setSelected] = useState(() => {
    try {
      const saved = localStorage.getItem('hook-lab-selected-chapter');
      return saved && (saved === 'chapter-00' || lessons.some(lesson => lesson.id === saved)) ? saved : 'chapter-00';
    } catch { return 'chapter-00'; }
  })
  useEffect(() => {
    try { localStorage.setItem('hook-lab-selected-chapter', selected); } catch { /* Continue in memory. */ }
  }, [selected])
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
  function toggleSidebar() {
    const next = !sidebarCollapsed; setSidebarCollapsed(next);
    try { localStorage.setItem('hook-lab-sidebar-collapsed', String(next)); } catch { /* usable without storage */ }
  }
  function record(step: number) {
    const updated = { ...progress, [lesson.id]: advanceStep(current, step) }
    setProgress(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); setStorageError(false) }
    catch { setStorageError(true) }
  }
  return <MotionConfig reducedMotion="user" transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeInOut' }}><div className="app-shell">
    <header className="topbar"><button className="sidebar-toggle" aria-expanded={!sidebarCollapsed} aria-controls="curriculum-sidebar" aria-label={sidebarCollapsed ? 'メニューを開く' : 'メニューを閉じる'} title={sidebarCollapsed ? 'メニューを開く' : 'メニューを閉じる'} onClick={toggleSidebar}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /><path d={sidebarCollapsed ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'} /></svg></button><a className="brand" href="#main"><span className="brand-mark">h.</span>Hook & Build<span className="brand-label">LEARNING WORKSPACE</span></a><span className="local-indicator"><i />LOCAL LEARNING</span></header>
    <motion.div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} initial={false} animate={{ '--sidebar-open': sidebarCollapsed ? 0 : 1 }}>
      <div className="sidebar-clip" inert={sidebarCollapsed} aria-hidden={sidebarCollapsed}><motion.aside id="curriculum-sidebar" className="sidebar" aria-label="カリキュラム" initial={false} animate={{ opacity: sidebarCollapsed ? 0 : 1, visibility: 'visible', transitionEnd: { visibility: sidebarCollapsed ? 'hidden' : 'visible' } }} >
        <div className="eyebrow">YOUR LEARNING PATH</div><h2>小さくつくる。<br />深くわかる。</h2><p className="muted">React / Express / Testing</p>
        <div className="course-progress"><span>学習の進捗</span><strong>{completed}<small> / {lessons.length}</small></strong><progress value={completed} max={lessons.length} aria-label="完了した課題" /></div>
        <button className={`lesson-link intro-link ${selected === 'chapter-00' ? 'active' : ''}`} aria-current={selected === 'chapter-00' ? 'page' : undefined} onClick={() => setSelected('chapter-00')}>00 はじめに：カウンターで実演{progress['chapter-00'] === 4 && <span className="completion-badge">✓ 完了</span>}</button>
        <nav aria-label="課題一覧">{levels.map((level, index) => <section className="level-group" key={level.id}>
          <div className="level-heading"><span>0{index + 1}</span><div><h3>{level.name}</h3><small>{level.description}</small></div></div>
          {lessons.filter(l => l.level === level.id).map((l, i) => <button key={l.id} className={`lesson-link ${selected === l.id ? 'active' : ''} ${progress[l.id] === 4 ? 'completed' : ''}`} aria-current={selected === l.id ? 'step' : undefined} onClick={() => setSelected(l.id)}><span className="lesson-number">{String(i + 1).padStart(2, '0')}</span><span>{l.title}</span>{progress[l.id] === 4 && <span className="completion-badge">✓ 完了</span>}<span aria-hidden="true">{selected === l.id ? '↗' : ''}</span></button>)}
        </section>)}</nav>
      </motion.aside></div>
      <main id="main">
        {selected === 'chapter-00' ? <ChapterZero completed={progress['chapter-00'] === 4} onCompletedChange={(completed) => setProgress(p => ({ ...p, 'chapter-00': completed ? 4 : 0 }))} onContinue={() => setSelected(lessons[0].id)} /> : <>
        <div className="work-grid">
          <motion.article className="lesson-card" key={lesson.id} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div className="card-top"><span className="badge green">{levels.find(l => l.id === lesson.level)?.name}</span><span className="muted">CHALLENGE {String(lessons.indexOf(lesson) + 1).padStart(2, '0')}</span></div>
            <h2>{lesson.title}</h2><p className="lesson-summary">{lesson.summary}</p><div className="tags">{lesson.hooks.map(h => <span key={h}>{h}</span>)}</div>
            <NextAction lesson={lesson} current={current} />
            <section className="requirements lesson-section">
              <h3><span>01</span>実装する要件</h3>
              <ul>{lesson.requirements.map(r => <li key={r}>{r}</li>)}</ul>
              <div className="edit-location">
                <h4>コードを書く場所</h4><code>{lesson.file}</code>
                <p>エディタで編集して保存すると、プレビューに反映されます。APIの変更はサーバー側で確認しましょう。</p>
              </div>
            </section>
            <section className="ui-checks lesson-section"><h3><span>02</span>UIで確かめること</h3><ul>{lesson.checks.map(c => <li key={c}>{c}</li>)}</ul></section>

            <div className="checklist" id="learning-checklist"><h3>取り組みを記録</h3><p>順番に確認しましょう。このチェックは学習の自己確認です。</p>{steps.map((s, i) => <label key={s}><input type="checkbox" checked={i < current} disabled={i > current} onChange={() => record(i)} />{s}</label>)}{storageError && <p role="alert">進捗を保存できません。この画面では続けられますが、再読み込みすると失われます。</p>}</div>
            {next ? <button className="primary next-button" disabled={current !== 4} onClick={() => setSelected(next.id)}>次の課題へ <span>→</span></button> : current === 4 && <p role="status">最終課題を完了しました。学んだことを振り返りましょう。</p>}
          </motion.article>
          <aside id="task-preview" className="preview-column" aria-label="実装と学習ガイド"><div className="preview-header"><span><i />LIVE PREVIEW</span><small>あなたのコードが動く場所</small></div><Chapters /><TestResultsPanel lessonId={lesson.id} /><TestChallenge lessonId={lesson.id} /><details className="setup-guide"><summary>起動とテストのガイド</summary><p><code>npm run dev</code> で画面とAPIを起動します。</p><p><code>src/exercises/chapters.test.tsx</code> にコンポーネントテスト、<code>e2e/exercises/</code> にUIテストを追加します。</p><p>提供済みテストは学習基盤とチャプター0を検証します。タスク管理のテストはTODOから自分で書きます。CSSはChapters内の通常のHTMLに自動で適用されます。</p></details></aside>
        </div></>}
      </main>
    </motion.div>
  </div></MotionConfig>
}
export default App
