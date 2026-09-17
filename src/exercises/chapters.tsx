import { useContext } from 'react';
import { TaskContext } from './TaskContext';

export default function Chapters() {
  const task = useContext(TaskContext);
  if (task === null) throw new Error('TaskProviderの内側で使ってください。');
  const {
    handleAddButton,
    handelSaveButton,
    handleCardClick,
    handleCancelButton,
    handelDeleteButton,
    handleToggleButton,
    handleCategoryButton,
    handleSortButton,
    changeSearchInput,
    changeTaskInput,
    changeEditInput,
    notIsDoneTaskLength,
    visibleTasks,
    state,
  } = task;

  const { userInputTask, userEditInput, errorMessage, targetId, taskList } =
    state;

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
            onChange={(e) => changeSearchInput(e.target.value)}
          />
        </div>
        <label>種類別表示</label>
        <div className="task-ui-actions">
          <button
            onClick={() => handleCategoryButton('all')}
            role="button"
            aria-label="all"
          >
            全
          </button>
          <button
            onClick={() => handleCategoryButton('done')}
            role="button"
            aria-label="done"
          >
            完
          </button>
          <button
            onClick={() => handleCategoryButton('notDone')}
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
              onClick={() => handleSortButton('default')}
              role="button"
              aria-label="sortDefault"
            >
              追加順
            </button>
            <button
              onClick={() => handleSortButton('title')}
              role="button"
              aria-label="sortTitle"
            >
              タイトル
            </button>
            <button
              onClick={() => handleSortButton('new')}
              role="button"
              aria-label="sortNew"
            >
              new
            </button>
            <button
              onClick={() => handleSortButton('old')}
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
            onChange={(e) => changeTaskInput(e.target.value)}
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
                onChange={(e) => changeEditInput(e.target.value)}
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
