import TestChallenge from './components/TestChallenge'
import { motion, MotionConfig, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { lessons } from './data/curriculum'
import type { Level } from './data/curriculum'
import { advanceStep, readProgress, STORAGE_KEY } from './lib/progress'
import Chapters from './exercises/chapters'
import TestResultsPanel from './components/TestResultsPanel'
import { NextAction } from './components/LearningGuide'
import ChapterZero from './tutorial/ChapterZero'
import ExpressTutorial from './tutorial/ExpressTutorial'
import PrismaTutorial from './tutorial/PrismaTutorial'
import './App.css'

const levels: { id: Level; name: string; description: string }[] = [
  { id: 'basic', name: '基礎', description: 'まず、動くものをつくる' },
  { id: 'intermediate', name: '中級', description: '設計と体験を磨く' },
  { id: 'nightmare', name: 'ナイトメア', description: '難しい条件に立ち向かう' },
]
const steps = ['要件を読んだ', '実装した', 'UIで確認した', 'テストを追加・実行した']
function App() {
  const reduceMotion = useReducedMotion()
  const shell = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLElement>(null)
  const workspace = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const [previewWidth, setPreviewWidth] = useState(() => {
    try {
      const saved = Number(localStorage.getItem('hook-lab-preview-width') ?? 50)
      return Number.isFinite(saved) ? Math.min(70, Math.max(35, saved)) : 50
    } catch { return 50 }
  })
  useEffect(() => {
    try { localStorage.setItem('hook-lab-preview-width', String(previewWidth)) } catch { /* usable without storage */ }
  }, [previewWidth])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem('hook-lab-sidebar-collapsed') === 'true' } catch { return false } })
  const [selected, setSelected] = useState(() => {
    try {
      const saved = localStorage.getItem('hook-lab-selected-chapter');
      return saved && (saved === 'chapter-00' || saved === 'express-tutorial' || saved === 'prisma-tutorial' || lessons.some(lesson => lesson.id === saved)) ? saved : 'chapter-00';
    } catch { return 'chapter-00'; }
  })
  useEffect(() => {
    try { localStorage.setItem('hook-lab-selected-chapter', selected); } catch { /* Continue in memory. */ }
  }, [selected])
  useEffect(() => {
    function updateMenuOffset() {
      const visibleHeight = Math.max(0, header.current?.getBoundingClientRect().bottom ?? 0)
      shell.current?.style.setProperty('--menu-top', `${visibleHeight}px`)
    }
    updateMenuOffset()
    window.addEventListener('scroll', updateMenuOffset, { passive: true })
    window.addEventListener('resize', updateMenuOffset)
    return () => {
      window.removeEventListener('scroll', updateMenuOffset)
      window.removeEventListener('resize', updateMenuOffset)
    }
  }, [])
  const [progress, setProgress] = useState(readProgress)
  const [storageError, setStorageError] = useState(false)
  const lesson = lessons.find(l => l.id === selected) ?? lessons[0]
  const current = progress[lesson.id] ?? 0
  const requiredLessons = lessons.filter(l => !l.optional)
  const completed = requiredLessons.filter(l => progress[l.id] === 4).length
  const next = lessons.slice(lessons.findIndex(l => l.id === lesson.id) + 1).find(l => !l.optional)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) }
    catch { /* In-memory progress remains usable when storage is unavailable. */ }
  }, [progress])
  function toggleSidebar() {
    const next = !sidebarCollapsed; setSidebarCollapsed(next);
    try { localStorage.setItem('hook-lab-sidebar-collapsed', String(next)); } catch { /* usable without storage */ }
  }
  function closeSidebar() {
    setSidebarCollapsed(true)
    try { localStorage.setItem('hook-lab-sidebar-collapsed', 'true') } catch { /* usable without storage */ }
    menuButton.current?.focus()
  }
  useEffect(() => {
    if (sidebarCollapsed) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSidebarCollapsed(true)
        try { localStorage.setItem('hook-lab-sidebar-collapsed', 'true') } catch { /* usable without storage */ }
        menuButton.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sidebarCollapsed])
  function record(step: number) {
    const updated = { ...progress, [lesson.id]: advanceStep(current, step) }
    setProgress(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); setStorageError(false) }
    catch { setStorageError(true) }
  }
  return <MotionConfig reducedMotion="user" transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeInOut' }}><div ref={shell} className="app-shell">
    <header ref={header} className="topbar"><button ref={menuButton} className="sidebar-toggle" aria-expanded={!sidebarCollapsed} aria-controls="curriculum-sidebar" aria-label={sidebarCollapsed ? 'メニューを開く' : 'メニューを閉じる'} title={sidebarCollapsed ? 'メニューを開く' : 'メニューを閉じる'} onClick={toggleSidebar}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /><path d={sidebarCollapsed ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'} /></svg></button><a className="brand" href="#main"><span className="brand-mark">h.</span>Hook & Build<span className="brand-label">LEARNING WORKSPACE</span></a><span className="local-indicator"><i />LOCAL LEARNING</span></header>
    <motion.div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} initial={false} animate={{ '--sidebar-open': sidebarCollapsed ? 0 : 1 }}>
      {!sidebarCollapsed && <button className="sidebar-backdrop" aria-label="メニューの外側を押して閉じる" onClick={closeSidebar} />}
      <div className="sidebar-clip"  inert={sidebarCollapsed} aria-hidden={sidebarCollapsed}><motion.aside id="curriculum-sidebar" className="sidebar" aria-label="カリキュラム" initial={false} animate={{ opacity: sidebarCollapsed ? 0 : 1, visibility: 'visible', transitionEnd: { visibility: sidebarCollapsed ? 'hidden' : 'visible' } }} >
        <div className="eyebrow">YOUR LEARNING PATH</div><h2>小さくつくる。<br />深くわかる。</h2><p className="muted">React / Express / Testing</p>
        <div className="course-progress"><span>必須課題の進捗</span><strong>{completed}<small> / {requiredLessons.length}</small></strong><progress value={completed} max={requiredLessons.length} aria-label="完了した課題" /></div>
        <button className={`lesson-link intro-link ${selected === 'chapter-00' ? 'active' : ''}`} aria-current={selected === 'chapter-00' ? 'page' : undefined} onClick={() => setSelected('chapter-00')}>00 はじめに：カウンターで実演{progress['chapter-00'] === 4 && <span className="completion-badge">✓ 完了</span>}</button>
        <button className={`lesson-link intro-link ${selected === 'express-tutorial' ? 'active' : ''}`} aria-current={selected === 'express-tutorial' ? 'page' : undefined} onClick={() => setSelected('express-tutorial')}>Expressチュートリアル</button>
        <button className={`lesson-link intro-link ${selected === 'prisma-tutorial' ? 'active' : ''}`} aria-current={selected === 'prisma-tutorial' ? 'page' : undefined} onClick={() => setSelected('prisma-tutorial')}>Prismaチュートリアル</button>
        <nav aria-label="課題一覧">{levels.map((level, index) => <section className="level-group" data-level={level.id} key={level.id}>
          <div className="level-heading"><span>0{index + 1}</span><div><h3>{level.name}</h3><small>{level.description}</small></div></div>
          {lessons.filter(l => l.level === level.id).map((l, i) => <button key={l.id} className={`lesson-link ${selected === l.id ? 'active' : ''} ${progress[l.id] === 4 ? 'completed' : ''}`} aria-current={selected === l.id ? 'step' : undefined} onClick={() => setSelected(l.id)}><span className="lesson-number">{String(i + 1).padStart(2, '0')}</span><span>{l.title}</span>{progress[l.id] === 4 && <span className="completion-badge">✓ 完了</span>}<span aria-hidden="true">{selected === l.id ? '↗' : ''}</span></button>)}
        </section>)}</nav>
      </motion.aside></div>
      <main id="main">
        {selected === 'chapter-00' ? <ChapterZero completed={progress['chapter-00'] === 4} onCompletedChange={(completed) => setProgress(p => ({ ...p, 'chapter-00': completed ? 4 : 0 }))} onContinue={() => setSelected(lessons[0].id)} /> : selected === 'express-tutorial' ? <ExpressTutorial onContinue={() => setSelected('basic-06')} /> : selected === 'prisma-tutorial' ? <PrismaTutorial onContinue={() => setSelected('basic-08')} /> : <>

        <div ref={workspace} className="work-grid" style={{ '--preview-width': previewWidth + 'fr', '--lesson-width': (100 - previewWidth) + 'fr' } as CSSProperties}>
          <motion.article className="lesson-card" key={lesson.id} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div className="card-top"><span className="badge green">{levels.find(l => l.id === lesson.level)?.name}</span><span className="muted">CHALLENGE {String(lessons.indexOf(lesson) + 1).padStart(2, '0')}</span></div>
            <h2>{lesson.title}</h2><p className="lesson-summary">{lesson.summary}</p><div className="tags">{lesson.hooks.map(h => <span key={h}>{h}</span>)}</div>
            {lesson.id === 'basic-06' && <p><button onClick={() => setSelected('express-tutorial')}>Expressチュートリアルを開く →</button></p>}
            {['basic-07', 'basic-08'].includes(lesson.id) && <p><button onClick={() => setSelected('prisma-tutorial')}>Prismaチュートリアルを開く →</button></p>}
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
            {next ? <button className="primary next-button" disabled={!lesson.optional && current !== 4} onClick={() => setSelected(next.id)}>{lesson.optional ? 'API連携へ進む（この課題は任意）' : '次の課題へ'} <span>→</span></button> : current === 4 && <p role="status">最終課題を完了しました。学んだことを振り返りましょう。</p>}
          </motion.article>
          <div className="workspace-divider" role="separator" aria-label="実装画面の幅" aria-orientation="vertical" aria-controls="task-preview" aria-valuemin={35} aria-valuemax={70} aria-valuenow={previewWidth} tabIndex={0}
            onPointerDown={event => {
              if (event.button !== 0) return
              dragging.current = true
              event.currentTarget.setPointerCapture(event.pointerId)
              event.currentTarget.focus()
              event.preventDefault()
            }}
            onPointerMove={event => {
              if (!dragging.current || !workspace.current) return
              const rect = workspace.current.getBoundingClientRect()
              const usableWidth = rect.width - 20
              if (usableWidth <= 0) return
              setPreviewWidth(Math.min(70, Math.max(35, Math.round((rect.right - event.clientX - 10) / usableWidth * 100))))
            }}
            onPointerUp={event => {
              dragging.current = false
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onPointerCancel={() => { dragging.current = false }}
            onLostPointerCapture={() => { dragging.current = false }}
            onDoubleClick={() => setPreviewWidth(50)}
            onKeyDown={event => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              setPreviewWidth(value => event.key === 'Home' ? 35 : event.key === 'End' ? 70 : Math.min(70, Math.max(35, value + (event.key === 'ArrowLeft' ? 1 : -1))))
            }}
            title="左右にドラッグして幅を調整（矢印キーでも操作可能・ダブルクリックでリセット）" />
          <aside id="task-preview" className="preview-column" aria-label="実装と学習ガイド"><div className="preview-header"><span><i />LIVE PREVIEW</span><small>あなたのコードが動く場所</small></div><Chapters /><TestResultsPanel lessonId={lesson.id} /><TestChallenge lessonId={lesson.id} /><details className="setup-guide"><summary>起動とテストのガイド</summary><p><code>npm run dev</code> で画面とAPIを起動します。</p><p><code>src/exercises/chapters.test.tsx</code> にコンポーネントテスト、<code>e2e/exercises/</code> にUIテストを追加します。</p><p>提供済みテストは学習基盤とチャプター0を検証します。タスク管理のテストはTODOから自分で書きます。CSSはChapters内の通常のHTMLに自動で適用されます。</p></details></aside>
        </div></>}
      </main>
    </motion.div>
  </div></MotionConfig>
}
export default App
