// @vitest-environment node
import { afterAll, beforeAll, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from './app.ts';

let server: Server;
let url: string;
beforeAll(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/tutorial/tasks`;
});
afterAll(async () => {
  if (server?.listening)
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
});
function send(path: string, method: string, body?: unknown) {
  return fetch(url + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
it('追加→編集・完了→再取得→削除を保存する', async () => {
  expect(await (await fetch(url)).json()).toEqual([]);
  const created = await send('', 'POST', { title: ' APIを学ぶ ' });
  expect(created.status).toBe(201);
  const task = (await created.json()) as { id: string };
  const edited = await send(`/${task.id}`, 'PATCH', {
    title: 'APIを復習する',
    completed: true,
  });
  expect(edited.status).toBe(200);
  expect(await (await fetch(url)).json()).toEqual([
    { id: task.id, title: 'APIを復習する', completed: true },
  ]);
  const deleted = await send(`/${task.id}`, 'DELETE');
  expect(deleted.status).toBe(204);
  expect(await deleted.text()).toBe('');
  expect(await (await fetch(url)).json()).toEqual([]);
});
it('存在しないIDの編集・削除は404になる', async () => {
  for (const method of ['PATCH', 'DELETE']) {
    expect(
      (await send('/missing-demo-id', method, { completed: true })).status,
    ).toBe(404);
  }
});
it('空のタイトルは400になり保存されない', async () => {
  expect((await send('', 'POST', { title: '   ' })).status).toBe(400);
  expect(await (await fetch(url)).json()).toEqual([]);
});
