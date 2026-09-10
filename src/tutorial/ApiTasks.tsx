import { useEffect, useState } from 'react';
import './ApiTasks.css';

type Task = { id: string; title: string; completed: boolean };
const endpoint = '/api/tutorial/tasks';

async function request(
  path = '',
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
) {
  const response = await fetch(endpoint + path, {
    method,
    signal,
    headers:
      body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(`HTTP ${response.status}：通信に失敗しました。`);
  // DELETEの204応答にはJSONがありません。
  return response.status === 204 ? undefined : response.json();
}

export default function ApiTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('初回取得中…');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    // Effect自体はasyncにせず、中で非同期関数を定義して呼びます。
    async function loadTasks() {
      try {
        const data: Task[] = await request('', 'GET', undefined, controller.signal);
        if (controller.signal.aborted) return;
        setTasks(data);
        setMessage('取得しました。');
      } catch {
        if (!controller.signal.aborted) {
          setError('取得できません。APIの起動を確認して再取得してください。');
        }
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }

    void loadTasks();
    return () => controller.abort();
  }, []);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError('');
    setMessage('通信中…');
    try {
      await action();
      setTasks((await request()) as Task[]);
      setMessage(success);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `${cause.message} APIの起動を確認して再取得してください。`
          : '通信に失敗しました。',
      );
      setMessage('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="api-demo" aria-label="API実演">
      <p>
        実演用メモリ保存：ページの再読込では残り、APIサーバーの再起動で消えます。
      </p>
      <form className="api-demo-add"
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            await request('', 'POST', { title });
            setTitle('');
          }, '追加しました。');
        }}
      >
        <label className="api-demo-field">
          実演のタスク名
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={busy}
          />
        </label>
        <button type="submit" disabled={busy || !title.trim()}>追加</button>
      </form>
      <div className="api-demo-actions">
      <button
        disabled={busy}
        onClick={() => void run(async () => {}, '再取得しました。')}
      >
        再取得
      </button>
      <button
        disabled={busy}
        onClick={() =>
          void run(
            () => request('/missing-demo-id', 'PATCH', { completed: true }),
            '',
          )
        }
      >
        404エラーを試す
      </button>
      </div>
      <p role="status">
        {busy ? '通信中…' : error ? '通信が終了しました。' : message}
      </p>
      {error && <p role="alert">{error}</p>}
      {!busy && !error && tasks.length === 0 && (
        <p>タスクは0件です。1件追加してみましょう。</p>
      )}
      <ul className="api-demo-list">
        {tasks.map((task) => (
          <li key={task.id}>
            <label className="api-demo-completion">
              <input
                type="checkbox"
                checked={task.completed}
                disabled={busy}
                onChange={() =>
                  void run(
                    () =>
                      request(`/${task.id}`, 'PATCH', {
                        completed: !task.completed,
                      }),
                    '完了状態を保存しました。',
                  )
                }
              />
              <span>{task.title}</span>
            </label>
            <form className="api-demo-edit"
              onSubmit={(event) => {
                event.preventDefault();
                const title = new FormData(event.currentTarget).get('title');
                void run(
                  () => request(`/${task.id}`, 'PATCH', { title }),
                  '編集しました。',
                );
              }}
            >
              <label className="api-demo-field">
              編集するタイトル
              <input
                key={task.title}
                name="title"
                aria-label={`${task.title}の編集`}
                defaultValue={task.title}
                disabled={busy}
                required
              />
              </label>
              <button type="submit" disabled={busy}>保存</button>
            </form>
            <button className="api-demo-delete"
              disabled={busy}
              onClick={() =>
                void run(
                  () => request(`/${task.id}`, 'DELETE'),
                  '削除しました。',
                )
              }
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
