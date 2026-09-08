import { useState } from 'react';

/**
 * あなたの実装場所。課題を一つずつ、このコンポーネントに追加してください。
 * 機能の実装はこのファイル。CSSは外側のtask-workspaceに適用済みです。buttonやliをここに直接追加できます。
 * 各課題の要件に沿って、このコンポーネントに機能を積み重ねます。
 * このファイルを保存すると、右側のプレビューに反映されます。
 * UIで確認した後、課題で指定されたテストファイルのit.todoに本文を追記します。
 */

type TaskList = {
  id: string;
  title: string;
};
export default function Chapters() {
  const handleAddButton = () => {
    const trimText = userInputTask.trim();
    if (!trimText)
      return setErrorMessage(
        'タスク名を入力してください。空白だけでは追加できません。',
      );
    const newTask = { id: crypto.randomUUID(), title: trimText };
    setTaskList((currentTasks) => [...currentTasks, newTask]);
    setUserInputTask('');
    setErrorMessage('');
  };
  const [userInputTask, setUserInputTask] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [targetIndex, setTargetIndex] = useState<number>();
  const [taskList, setTaskList] = useState<TaskList[]>([]);

  return (
    <section className="task-workspace" aria-label="タスク管理プレビュー">
      <header className="workspace-toolbar">
        <strong>My tasks</strong>
        <span className="badge">学習者の実装エリア</span>
      </header>
      {errorMessage && (
        <p id="task-error" role="alert">
          {errorMessage}
        </p>
      )}
      <div>
        <label htmlFor="task-title">タスク名</label>
        <div className="task-ui-actions">
          <input
            id="task-title"
            role="textbox"
            placeholder="ここから、最初の機能をつくろう"
            onChange={(e) => setUserInputTask(e.target.value)}
            value={userInputTask}
            aria-invalid={Boolean(errorMessage)}
            aria-label="input"
            aria-describedby={errorMessage ? 'task-error' : undefined}
          />
          <button role="button" aria-label="add" onClick={handleAddButton}>
            追加
          </button>
        </div>
      </div>
      {taskList.length === 0 ? (
        <p role="status">
          タスクはまだありません。名前を入力して追加してみましょう。
        </p>
      ) : (
        <ul>
          {taskList.map((obj, index) => (
            <li
              role="listitem"
              aria-current={targetIndex === index ? true : undefined}
              data-test-id={obj.id}
              onClick={() => setTargetIndex(index)}
              key={obj.id}
            >
              {obj.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
