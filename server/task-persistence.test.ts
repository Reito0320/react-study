// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import type { PrismaClient } from '../generated/prisma/client.ts';
import { createApp } from './app.ts';
import { createApiTestServer } from './testing/api-test-server.ts';

// 初回だけ npm run db:test:setup。その後はこのファイルに操作とexpectを書きます。
// テストごとに空の専用領域を作成し、終了時にその領域だけ片付けます。
// 学習用DBに接続するPrismaやdeleteManyは不要です。
let api: Awaited<ReturnType<typeof createApiTestServer>> | undefined;
export let origin: string;

beforeEach(async () => {
  api = await createApiTestServer();
  origin = api.origin;
}, 30000);

afterEach(async () => {
  try {
    await api?.close();
  } finally {
    api = undefined;
  }
}, 30000);

// テスト内で await restartApiServer() → 更新後のoriginにGET。
export async function restartApiServer() {
  if (!api) throw new Error('テスト用サーバーが起動していません。');
  await api.restart();
  origin = api.origin;
}

// fetch(`${origin}/api/tasks`, ...) でAPIを操作してください。
// テストの本文は async () => { ... } とし、再起動を含む場合は
// it('説明', async () => { ... }, 30000) のように制限時間を付けられます。
describe('[basic-08] 基礎8：タスクAPIをPrismaで永続化する', () => {
  it('[basic-08-01] POSTしたタスクをAPIの再起動後も同じID・タイトルでGETできる', async () => {
    const testTask = {
      title: 'テスト',
    };
    const res = await fetch(`${origin}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTask),
    });
    expect(res.ok).toBe(true);
    const { newTask } = await res.json();
    expect(newTask.title).toBe(testTask.title);

    await restartApiServer();

    const getRes = await fetch(`${origin}/api/tasks/` + newTask.id);
    expect(getRes.ok).toBe(true);
    const { targetTask } = await getRes.json();
    expect(newTask.id).toBe(targetTask.id);
    expect(newTask.title).toBe(targetTask.title);
    expect(newTask.isDone).toBe(targetTask.isDone);
    expect(newTask.createdAt).toBe(targetTask.createdAt);
  });
  it('[basic-08-02] PATCHしたタイトルと完了状態がAPI再起動後も維持される', async () => {
    const testTask = {
      title: 'テスト',
    };
    const postRes = await fetch(`${origin}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTask),
    });
    expect(postRes.ok).toBe(true);
    const { newTask } = await postRes.json();
    expect(newTask.title).toBe(testTask.title);

    const getRes = await fetch(`${origin}/api/tasks/` + newTask.id);
    expect(getRes.ok).toBe(true);
    const { targetTask } = await getRes.json();
    expect(targetTask.title).toBe(testTask.title);
    expect(targetTask.isDone).toBe(false);

    const patchRes = await fetch(`${origin}/api/tasks/` + newTask.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '新しいテスト',
        isDone: true,
      }),
    });
    expect(patchRes.ok).toBe(true);
    const { newTaskList } = await patchRes.json();
    expect(newTaskList[0].title).toBe('新しいテスト');
    expect(newTaskList[0].isDone).toBe(true);

    await restartApiServer();

    const newGetRes = await fetch(`${origin}/api/tasks/` + newTask.id);
    expect(newGetRes.ok).toBe(true);
    const newData = await newGetRes.json();
    expect(newData.targetTask.title).toBe('新しいテスト');
    expect(newData.targetTask.isDone).toBe(true);
  });
  it('[basic-08-03] DELETEしたタスクがAPI再起動後の一覧に戻らない', async () => {
    const testTask = {
      title: 'テスト',
    };
    const postRes = await fetch(`${origin}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTask),
    });
    expect(postRes.ok).toBe(true);
    const { newTask } = await postRes.json();
    expect(newTask.title).toBe(testTask.title);

    const getRes = await fetch(`${origin}/api/tasks/` + newTask.id);
    expect(getRes.ok).toBe(true);
    const { targetTask } = await getRes.json();
    expect(targetTask.title).toBe(testTask.title);
    expect(targetTask.isDone).toBe(false);

    const deleteRes = await fetch(`${origin}/api/tasks/` + newTask.id, {
      method: 'DELETE',
    });
    expect(deleteRes.ok).toBe(true);

    const newGetRes = await fetch(`${origin}/api/tasks/` + newTask.id);
    expect(newGetRes.ok).toBe(false);

    await restartApiServer();

    const lastGetRes = await fetch(`${origin}/api/tasks/` + newTask.id);
    expect(lastGetRes.ok).toBe(false);
  });
  it('[basic-08-04] 存在しないIDの更新と削除は404になり他のデータを変更しない', async () => {
    const testTask = {
      title: 'テスト',
    };
    const postRes = await fetch(`${origin}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTask),
    });
    expect(postRes.ok).toBe(true);
    const { newTask } = await postRes.json();
    expect(newTask.title).toBe(testTask.title);

    const getRes = await fetch(`${origin}/api/tasks/` + newTask.id);
    expect(getRes.ok).toBe(true);
    const { targetTask } = await getRes.json();
    expect(targetTask.title).toBe(testTask.title);
    expect(targetTask.isDone).toBe(false);

    const notFindId = crypto.randomUUID();
    const patchRes = await fetch(`${origin}/api/tasks/` + notFindId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'fail data',
        isDone: true,
      }),
    });
    expect(patchRes.ok).toBe(false);
    expect(patchRes.status).toBe(404);

    const deleteRes = await fetch(`${origin}/api/tasks/` + notFindId, {
      method: 'DELETE',
    });
    expect(deleteRes.ok).toBe(false);
    expect(deleteRes.status).toBe(404);

    const newGetRes = await fetch(`${origin}/api/tasks/` + newTask.id);
    expect(newGetRes.ok).toBe(true);
    const data = await newGetRes.json();
    expect(data.targetTask.title).toBe('テスト');
  });
  it('[basic-08-05] DB障害時は成功応答を返さずエラーを返す', async () => {
    const prismaMock = mockDeep<PrismaClient>();

    // prisma.task.create() を呼ぶと必ず失敗させる
    prismaMock.task.create.mockRejectedValue(new Error('DBに接続できません'));

    const failureApi = await createApiTestServer(() => createApp(prismaMock));

    try {
      const res = await fetch(`${failureApi.origin}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'テスト' }),
      });

      expect(prismaMock.task.create).toHaveBeenCalledOnce();
      expect(res.ok).toBe(false);
      expect(res.status).toBe(500);
    } finally {
      await failureApi.close();
    }
  });
});
