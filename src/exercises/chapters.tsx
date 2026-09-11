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

export default function Chapters() {
  const [userInputTask, setUserInputTask] = useState<string>('');
  const [userEditInput, setUserEditInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [targetId, setTargetId] = useState<string>();
  const [taskList, setTaskList] = useState<TaskList[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [category, setCategory] = useState<'all' | 'done' | 'notDone'>('all');
  // 優先度の入力UIを実装するときに有効にする。
  // const [priority, setPriority] = useState<string>();
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
  const handleAddButton = async () => {
    const trimText = userInputTask.trim();
    if (!trimText)
      return setErrorMessage(
        'タスク名を入力してください。空白だけでは追加できません。',
      );

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        title: trimText,
        isDone: false,
        createdAt: new Date(),
      }),
    });

    if (!res.ok) throw new Error('task追加の通信に失敗しています。');
    const { newTask } = await res.json();
    if (newTask === null) throw new Error('データが追加されていません。');

    setTaskList((currentTasks) => [...currentTasks, newTask]);
    setUserInputTask('');
    setErrorMessage('');
  };
  const handelSaveButton = async () => {
    if (!userEditInput.trim())
      return setErrorMessage(
        '新しいタスク名を入力してください。空白だけでは編集できません。',
      );

    const targetExists = taskList.some((task) => task.id === targetId);
    if (!targetExists) return setErrorMessage('該当するデータが存在しません。');

    const targetDataIsDone = taskList.find(
      (task) => task.id === targetId,
    )?.isDone;

    const res = await fetch('/api/tasks/' + targetId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: userEditInput.trim(),
        isDone: targetDataIsDone,
      }),
    });

    if (!res.ok) throw new Error('task更新処理に失敗しています。');
    const { newTaskList } = await res.json();

    setTaskList(newTaskList);
    setTargetId('');
    setUserEditInput('');
    setErrorMessage('');
  };
  const handelDeleteButton = async () => {
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

    const res = await fetch('/api/tasks/' + targetId, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('task削除の通信に失敗しています。');
    const { newTaskList } = await res.json();
    setTaskList(newTaskList);
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
    const getTaskList = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) throw new Error('tasks全件取得の通信に失敗しています。');
        const { taskList } = await res.json();
        console.log(taskList);
        setTaskList(taskList);
      } catch (error) {
        console.error(error);
      }
    };
    getTaskList();
  }, []);

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
        <p role="status" aria-label="initInfo">
          タスクはまだありません。名前を入力して追加してみましょう。
        </p>
      )}

      {taskList.length > 0 && visibleTasks.length === 0 && (
        <p role="status" aria-label="notFoundInfo">
          該当するデータが存在しません。
        </p>
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
              {/* <select onChange={(e) => setPriority(e.target.value)}>
                <option value="low">優先度:低い</option>
                <option value="medium">優先度:普通</option>
                <option value="high">優先度:高い</option>
              </select> */}
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
