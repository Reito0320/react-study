import { useEffect, useRef, useState } from 'react';

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

const data = localStorage.getItem('taskList');
const localTaskList = data ? JSON.parse(data) : [];

export default function Chapters() {
  const [userInputTask, setUserInputTask] = useState<string>('');
  const [userEditInput, setUserEditInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [targetId, setTargetId] = useState<string>();
  const [taskList, setTaskList] = useState<TaskList[]>(localTaskList);
  const prevEditInputRef = useRef<string>('');

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
  const handelSaveButton = () => {
    if (!userEditInput.trim())
      return setErrorMessage(
        '新しいタスク名を入力してください。空白だけでは編集できません。',
      );

    const targetExists = taskList.some((task) => task.id === targetId);
    if (!targetExists) return setErrorMessage('該当するデータが存在しません。');

    setTaskList(
      taskList.map((task) =>
        task.id === targetId ? { ...task, title: userEditInput.trim() } : task,
      ),
    );
    setTargetId('');
    setUserEditInput('');
    setErrorMessage('');
  };
  const handelDeleteButton = () => {
    const targetDataExists = taskList.some((obj) => obj.id === targetId);
    if (!targetDataExists)
      return setErrorMessage('該当するデータが存在しません。');

    const targetTaskTitle = userEditInput
      ? userEditInput
      : taskList.find((obj) => obj.id === targetId)?.title;
    const confirm = window.confirm(
      targetTaskTitle + 'を削除してよろしいですか？',
    );
    if (!confirm) return;
    setTaskList(taskList.filter((obj) => obj.id !== targetId));
    setTargetId('');
  };
  const handleCardClick = (currenttargetId: string) => {
    const targetDataTitle = taskList.find(
      (obj) => obj.id === currenttargetId,
    )?.title;
    if (!targetDataTitle) return;

    setTaskList((prev) =>
      prev.map((obj) =>
        obj.id === targetId ? { ...obj, title: prevEditInputRef.current } : obj,
      ),
    );
    setUserEditInput(targetDataTitle);
    setTargetId(currenttargetId);
  };
  /* targetIndexを0にする */
  const handleCancelButton = () => {};

  useEffect(() => {
    localStorage.setItem('taskList', JSON.stringify(taskList));
  }, [taskList, setTaskList]);

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
            onChange={(e) => setUserInputTask(e.target.value.trim())}
            onFocus={() => {
              setTaskList((prev) =>
                prev.map((obj) =>
                  obj.id === targetId ? { ...obj, title: userEditInput } : obj,
                ),
              );
              setTargetId('');
            }}
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
          {taskList.map((obj) =>
            targetId === obj.id ? (
              <div
                style={{
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                key={obj.id}
              >
                <input
                  type="text"
                  role="textbox"
                  aria-label="editInput"
                  placeholder={obj.title}
                  value={userEditInput}
                  onChange={(e) => {
                    setUserEditInput(e.target.value.trim());
                    prevEditInputRef.current = userEditInput.trim();
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <button
                    role="button"
                    aria-label="editCancelButton"
                    onClick={handleCancelButton}
                  >
                    ◀️
                  </button>
                  <button
                    role="button"
                    aria-label="editSaveButton"
                    onClick={handelSaveButton}
                  >
                    💾
                  </button>
                  <button
                    role="button"
                    aria-label="editDeleteButton"
                    onClick={handelDeleteButton}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ) : (
              <li
                role="listitem"
                data-test-id={obj.id}
                onClick={() => handleCardClick(obj.id)}
                key={obj.id}
              >
                {obj.title}
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
