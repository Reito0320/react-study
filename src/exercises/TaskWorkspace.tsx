/**
 * あなたの実装場所。課題を一つずつ、このコンポーネントに追加してください。
 * TODO: 基礎の追加・一覧 → 完了 → 編集・削除 → 検索 → 期限 → API連携。
 * このファイルを保存すると、右側のプレビューに反映されます。
 * UIで確認した後、同じフォルダに TaskWorkspace.test.tsx を作成してください。
 */
export default function TaskWorkspace() {
  return <section className="task-workspace" aria-label="タスク管理プレビュー">
    <div className="workspace-toolbar"><strong>My tasks</strong><span className="badge">学習者の実装エリア</span></div>
    <label htmlFor="task-title">タスク名</label>
    <div className="input-row"><input id="task-title" placeholder="ここから、最初の機能をつくろう" disabled /><button disabled>追加</button></div>
    <div className="empty-state"><span className="empty-icon" aria-hidden="true">＋</span><h3>まだ、何もない。それがスタート。</h3><p>要件を読み、タスクを追加する機能から<br />実装してみましょう。</p><span className="badge">未実装</span></div>
  </section>
}
