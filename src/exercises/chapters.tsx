import { useEffect, useReducer } from 'react';
import { INITIAL, reducer, type Initial, type TaskList } from './reducer';

/**
 * あなたの実装場所。課題を一つずつ、このコンポーネントに追加してください。
 * 機能の実装はこのファイル。CSSは外側のtask-workspaceに適用済みです。buttonやliをここに直接追加できます。
 * 各課題の要件に沿って、このコンポーネントに機能を積み重ねます。
 * このファイルを保存すると、右側のプレビューに反映されます。
 * UIで確認した後、課題で指定されたテストファイルのit.todoに本文を追記します。
 */

export default function Chapters() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const {
    userInputTask,
    userEditInput,
    searchInput,
    errorMessage,
    targetId,
    taskList,
    category,
    sortStatus,
  }: Initial = state;

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
      return dispatch({
        type: 'ERROR',
        payload: 'タスク名を入力してください。空白だけでは追加できません。',
      });

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: trimText,
      }),
    });

    if (!res.ok) throw new Error('task追加の通信に失敗しています。');
    const { newTask } = await res.json();
    if (newTask === null) throw new Error('データが追加されていません。');
    dispatch({ type: 'ADD', payload: newTask });
  };
  const handelSaveButton = async () => {
    if (!userEditInput.trim())
      return dispatch({
        type: 'ERROR',
        payload:
          '新しいタスク名を入力してください。空白だけでは編集できません。',
      });

    const targetExists = taskList.some((task) => task.id === targetId);
    if (!targetExists)
      return dispatch({
        type: 'ERROR',
        payload: '該当するデータが存在しません。',
      });

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

    dispatch({ type: 'SAVE', payload: newTaskList });
  };
  const handelDeleteButton = async () => {
    const targetDataExists = taskList.some((obj) => obj.id === targetId);
    if (!targetDataExists)
      return dispatch({
        type: 'ERROR',
        payload: '該当するデータが存在しません。',
      });

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
    dispatch({ type: 'DELETE', payload: newTaskList });
  };
  // 9/8 未実装
  const handleCardClick = (currenttargetId: string) => {
    const targetDataTitle = taskList.find(
      (obj) => obj.id === currenttargetId,
    )?.title;
    if (!targetDataTitle) return;
    dispatch({
      type: 'CARDCLICK',
      payload: {
        title: targetDataTitle,
        targetId: currenttargetId,
      },
    });
  };
  const handleCancelButton = async () => {
    const res = await fetch('api/tasks');
    if (!res.ok) throw new Error('編集をキャンセルできませんでした。');
    const { taskList } = await res.json();

    if (!taskList) return;
    dispatch({ type: 'CANCEL', payload: taskList });
  };
  const handleToggleButton = async (selectedId: string) => {
    const targetTask = taskList.find((task) => task.id === selectedId);
    if (!targetTask) return;

    const res = await fetch('/api/tasks/' + selectedId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: targetTask.title,
        isDone: !targetTask.isDone,
      }),
    });
    if (!res.ok) throw new Error('完了状態の保存に失敗しました。');
    const { newTaskList } = await res.json();
    dispatch({ type: 'CHANGETASKLIST', payload: newTaskList });
  };

  useEffect(() => {
    const getTaskList = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) throw new Error('tasks全件取得の通信に失敗しています。');
        const { taskList } = await res.json();
        dispatch({ type: 'CHANGETASKLIST', payload: taskList });
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
            onChange={(e) =>
              dispatch({ type: 'SEARCHINPUT', payload: e.target.value })
            }
          />
        </div>
        <label>種類別表示</label>
        <div className="task-ui-actions">
          <button
            onClick={() => dispatch({ type: 'CATEGORYCHANGE', payload: 'all' })}
            role="button"
            aria-label="all"
          >
            全
          </button>
          <button
            onClick={() =>
              dispatch({ type: 'CATEGORYCHANGE', payload: 'done' })
            }
            role="button"
            aria-label="done"
          >
            完
          </button>
          <button
            onClick={() =>
              dispatch({ type: 'CATEGORYCHANGE', payload: 'notDone' })
            }
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
              onClick={() =>
                dispatch({ type: 'CAHNGESORTSTATUS', payload: 'default' })
              }
              role="button"
              aria-label="sortDefault"
            >
              追加順
            </button>
            <button
              onClick={() =>
                dispatch({ type: 'CAHNGESORTSTATUS', payload: 'title' })
              }
              role="button"
              aria-label="sortTitle"
            >
              タイトル
            </button>
            <button
              onClick={() =>
                dispatch({ type: 'CAHNGESORTSTATUS', payload: 'new' })
              }
              role="button"
              aria-label="sortNew"
            >
              new
            </button>
            <button
              onClick={() =>
                dispatch({ type: 'CAHNGESORTSTATUS', payload: 'old' })
              }
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
            onChange={(e) =>
              dispatch({
                type: 'USERINPUTTASK',
                payload: e.target.value.trim(),
              })
            }
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
                onChange={(e) =>
                  dispatch({
                    type: 'EDITUSERINPUT',
                    payload: e.target.value.trim(),
                  })
                }
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
