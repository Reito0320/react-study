/**
 * ここがReactの実装場所です。チャプター1から機能を追加していきましょう。
 * 通常のinput・button・ul・liには共通CSSが適用されます。
 * 保存して右側のUIを確認したら、chapters.test.tsxにテストを書きます。
 */
export default function Chapters() {
  return (
    <section className="task-workspace" aria-label="タスク管理プレビュー">
      <header className="workspace-toolbar">
        <strong>My tasks</strong>
        <span className="badge">学習者の実装エリア</span>
      </header>
      {/* TODO: タスク名の入力欄、追加ボタン、タスク一覧をここに実装する。 */}
      <p role="status">まだ機能はありません。チャプター1の要件から作ってみましょう。</p>
    </section>
  );
}
