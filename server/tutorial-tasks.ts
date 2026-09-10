import { randomUUID } from 'node:crypto';
import { Router } from 'express';

// このRouterのメモリだけに保存。サーバー再起動で空になります。
export function createTutorialTasksRouter() {
  const router = Router();
  const tasks: { id: string; title: string; completed: boolean }[] = [];
  router.get('/', (_req, res) => {
    res.json(tasks);
  });
  router.post('/', (req, res) => {
    const title = req.body?.title;
    if (typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ message: 'タイトルを入力してください。' });
      return;
    }
    const task = { id: randomUUID(), title: title.trim(), completed: false };
    tasks.push(task);
    res.status(201).json(task);
  });
  router.patch('/:id', (req, res) => {
    const task = tasks.find((task) => task.id === req.params.id);
    if (!task) {
      res.status(404).json({ message: 'タスクが見つかりません。' });
      return;
    }
    const { title, completed } = req.body ?? {};
    if (
      (title !== undefined && (typeof title !== 'string' || !title.trim())) ||
      (completed !== undefined && typeof completed !== 'boolean') ||
      (title === undefined && completed === undefined)
    ) {
      res
        .status(400)
        .json({ message: 'タイトルまたは完了状態を確認してください。' });
      return;
    }
    if (typeof title === 'string') task.title = title.trim();
    if (typeof completed === 'boolean') task.completed = completed;
    res.json(task);
  });
  router.delete('/:id', (req, res) => {
    const index = tasks.findIndex((task) => task.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ message: 'タスクが見つかりません。' });
      return;
    }
    tasks.splice(index, 1);
    res.status(204).end();
  });
  return router;
}
