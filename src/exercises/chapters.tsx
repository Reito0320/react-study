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
  isDone: boolean;
  createdAt: Date;
};

const data = localStorage.getItem('taskList');
const localTaskList = data ? JSON.parse(data) : [];

export default function Chapters() {
  const [userInputTask, setUserInputTask] = useState<string>('');
  const [userEditInput, setUserEditInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [targetId, setTargetId] = useState<string>();
  const [taskList, setTaskList] = useState<TaskList[]>(localTaskList);
  const [searchInput, setSearchInput] = useState<string>('');
  const [category, setCategory] = useState<'all' | 'done' | 'notDone'>('all');
  const [sortStatus, setSortStatus] = useState<
    'default' | 'title' | 'new' | 'old'
  >('default');
  const prevEditInputRef = useRef<string>('');
  const notIsDoneTaskLength = taskList.filter((obj) => !obj.isDone).length;

  const getSortStatusList = (data: TaskList[]) => {
    if (sortStatus === 'new') {
      return data.toSorted(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    if (sortStatus === 'old')
      return data.toSorted(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    if (sortStatus === 'title')
      return data.toSorted((a, b) => a.title.localeCompare(b.title, 'ja'));
    return data;
  };
  const getSearchTaskList = () => {
    if (taskList.length === 0) return [];

    const searchTaskList = searchInput
      ? taskList.filter((obj) => obj.title.includes(searchInput))
      : taskList;

    if (category === 'all') {
      return getSortStatusList(searchTaskList);
    } else if (category === 'done') {
      const doneSortList = searchTaskList.filter((obj) => obj.isDone);
      return getSortStatusList(doneSortList);
    } else {
      const notDoneSortList = searchTaskList.filter((obj) => !obj.isDone);
      return getSortStatusList(notDoneSortList);
    }
  };
  const handleAddButton = () => {
    const trimText = userInputTask.trim();
    if (!trimText)
      return setErrorMessage(
        'タスク名を入力してください。空白だけでは追加できません。',
      );
    const newTask = {
      id: crypto.randomUUID(),
      title: trimText,
      isDone: false,
      createdAt: new Date(),
    };
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

    setTaskList(taskList.filter((obj) => obj.id !== targetId));
    setTargetId('');
  };
  // 9/8 未実装
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
  const handleCancelButton = () => {
    const data = localStorage.getItem('taskList');
    const localData = data ? JSON.parse(data) : null;
    if (!localData) return;

    setTaskList(localData);
    setTargetId('');
    setUserEditInput('');
  };
  const handleToggleButton = (selectedId: string) => {
    setTaskList((prev) =>
      prev.map((obj) =>
        selectedId === obj.id ? { ...obj, isDone: !obj.isDone } : obj,
      ),
    );
  };

  useEffect(() => {
    localStorage.setItem('taskList', JSON.stringify(taskList));
  }, [taskList, setTaskList]);

  const visibleTasks = getSearchTaskList();

  return (
    <section className="task-workspace" aria-label="タスク管理プレビュー">
      <header className="workspace-toolbar">
        <strong>My tasks</strong>
        <small
          role="status"
          className="badge"
          aria-label="isDoneInfo"
        >{`未完了のタスクは${notIsDoneTaskLength}件です。`}</small>
        <span className="badge">学習者の実装エリア</span>
      </header>
      {errorMessage && (
        <p id="task-error" role="alert">
          {errorMessage}
        </p>
      )}
      <div>
        <div style={{ marginBottom: 3 }}>
          <label htmlFor="task-search">タスク検索</label>
          <input
            type="text"
            id="task-search"
            role="textbox"
            aria-label="searchInput"
            placeholder="検索したいタスク名を入力してください。"
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <label>種類別表示</label>
        <div className="task-ui-actions">
          <button
            onClick={() => setCategory('all')}
            role="button"
            aria-label="all"
          >
            全
          </button>
          <button
            onClick={() => setCategory('done')}
            role="button"
            aria-label="done"
          >
            完
          </button>
          <button
            onClick={() => setCategory('notDone')}
            role="button"
            aria-label="notDone"
          >
            未
          </button>
        </div>
      </div>
      <div>
        <div>
          <label>並べ替え</label>
          <div className="task-ui-actions">
            <button
              onClick={() => setSortStatus('default')}
              role="button"
              aria-label="sortDefault"
            >
              追加順
            </button>
            <button
              onClick={() => setSortStatus('title')}
              role="button"
              aria-label="sortTitle"
            >
              タイトル
            </button>
            <button
              onClick={() => setSortStatus('new')}
              role="button"
              aria-label="sortNew"
            >
              new
            </button>
            <button
              onClick={() => setSortStatus('old')}
              role="button"
              aria-label="sortOld"
            >
              old
            </button>
          </div>
        </div>
      </div>

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

      {taskList.length === 0 && (
        <p role="status">
          タスクはまだありません。名前を入力して追加してみましょう。
        </p>
      )}

      {taskList.length > 0 && visibleTasks.length === 0 && (
        <p role="status">該当するデータが存在しません。</p>
      )}

      <ul>
        {visibleTasks.map((obj) =>
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
                  🙅
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
            <div className="task-list-row" key={obj.id}>
              <button
                onClick={() => handleToggleButton(obj.id)}
                type="button"
                role="button"
                aria-label="checkBoxButton"
              >
                {obj.isDone ? '✅' : '🔲'}
              </button>
              <li
                role="listitem"
                data-test-id={obj.id}
                onClick={() => handleCardClick(obj.id)}
                key={obj.id}
                style={obj.isDone ? { textDecoration: 'line-through' } : {}}
              >
                {obj.title}
              </li>
            </div>
          ),
        )}
      </ul>
    </section>
  );
}
