import { Router } from 'express';
import type { RequestHandler } from 'express';
import { createLocalPrisma } from './db/client';

// TODO: 課題の要件に従って各ハンドラーを実装し、UI で確認した後にテストを追加します。
// 初期状態ではデータを保存しません。完成済みデモは reference.ts にあります。
export function createExerciseRouter() {
  const router = Router();
  const prisma = createLocalPrisma();

  const getAllTaskList: RequestHandler = async (_, response) => {
    try {
      const taskList = await prisma.task.findMany();
      return response.json({
        message: 'taskの全件取得に成功しています。',
        taskList,
      });
    } catch (error) {
      console.error(error);
      return response.status(501).json({
        message: 'taskの全件取得に失敗しています。',
        taskList: [],
      });
    }
  };
  const getTargetIdTask: RequestHandler = async (request, response) => {
    try {
      const targetId = request.params.id as string;
      const targetTask = await prisma.task.findUnique({
        where: {
          id: targetId,
        },
      });
      if (!targetTask) {
        return response.status(404).json({
          message: 'idからtaskを一件取得できませんでした。',
          targetTask: null,
        });
      }
      return response.json({
        message: 'idからtaskを一件取得できました。',
        targetTask,
      });
    } catch (error) {
      console.error(error);
      return response.status(501).json({
        message: 'taskを一件取得に失敗しました。',
        targetTask: null,
      });
    }
  };
  const postTask: RequestHandler = async (request, response) => {
    try {
      const { title } = request.body;
      const res = await prisma.task.create({
        data: {
          title,
        },
      });
      return response.json({
        message: 'taskListを追加することに成功しています。',
        newTask: res,
      });
    } catch (error) {
      console.error(error);
      return response.json({
        message: 'taskListの追加に失敗しました。',
        newTask: null,
      });
    }
  };
  const patchTask: RequestHandler = async (request, response) => {
    try {
      const { title, isDone } = request.body;
      const targetId = request.params.id as string;
      const targetTask = await prisma.task.findUnique({
        where: { id: targetId },
      });

      if (!targetTask)
        return response.status(404).json({
          message: '該当するtaskが存在しませんでした。',
          newTaskList: [],
        });

      await prisma.task.update({
        where: {
          id: targetId,
        },
        data: {
          title,
          isDone,
        },
      });
      const newTaskList = await prisma.task.findMany();

      return response.json({
        message: 'taskの更新が完了しました。',
        newTaskList,
      });
    } catch (error) {
      console.error(error);
      return response.json({
        message: 'taskの更新に失敗しました。',
        newTaskList: [],
      });
    }
  };
  const deleteTask: RequestHandler = async (request, response) => {
    try {
      const targetId = request.params.id as string;
      const targetTask = await prisma.task.findUnique({
        where: { id: targetId },
      });
      if (!targetTask)
        return response.status(404).json({
          message:
            '対象のtaskが見つらなかったのでtaskの削除ができませんでした。',
          newTaskList: [],
        });

      await prisma.task.delete({ where: { id: targetId } });

      const newTaskList = await prisma.task.findMany();
      return response.json({
        message: '対象のtaskの削除が完了しました。',
        newTaskList,
      });
    } catch (error) {
      console.error(error);
      return response.json({
        message: 'taskの削除に失敗しています。',
        newTaskList: [],
      });
    }
  };

  router.get('/', getAllTaskList);
  router.get('/:id', getTargetIdTask);
  router.post('/', postTask);
  router.patch('/:id', patchTask);
  router.delete('/:id', deleteTask);
  return router;
}
