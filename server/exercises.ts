import { Router } from 'express';
import type { RequestHandler } from 'express';

type TaskList = {
  id: string;
  title: string;
  isDone: boolean;
  createdAt: Date;
};
// TODO: 課題の要件に従って各ハンドラーを実装し、UI で確認した後にテストを追加します。
// 初期状態ではデータを保存しません。完成済みデモは reference.ts にあります。
export function createExerciseRouter() {
  const router = Router();
  let taskList: TaskList[] = [];

  const getAllTaskList: RequestHandler = (_, response) => {
    return response.status(200).json({
      taskList,
    });
  };
  const getTargetIdTask: RequestHandler = (request, response) => {
    const targetId = request.params.id;
    const targetTask = taskList.find((task) => task.id === targetId);
    if (targetTask) {
      return response.json({
        message: 'idからlistを一件取得する通信に成功しています。',
        targetTask,
      });
    } else {
      return response.json({
        message: 'idからlistを一件取得する通信に失敗しています。',
        targetTask: null,
      });
    }
  };
  const postTask: RequestHandler = (request, response) => {
    const newTask = request.body;

    const prevTaskListLength = taskList.length;
    const newTaskListLength = taskList.push(newTask);
    if (prevTaskListLength + 1 === newTaskListLength) {
      return response.json({
        message: 'taskListを追加することに成功しています。',
        newTask,
      });
    } else {
      return response.json({
        message: 'taskListの追加に失敗しました。',
        newTask: null,
      });
    }
  };
  const patchTask: RequestHandler = (request, response) => {
    const newTask = request.body;
    const targetId = request.params.id;
    const isExists = taskList.some((task) => task.id === targetId);
    if (!isExists)
      return response.status(401).json({
        message: '該当するtaskが存在しませんでした。',
        newTaskList: taskList,
      });

    const newTaskList = taskList.map((task) =>
      task.id === targetId
        ? { ...task, title: newTask.title, isDone: newTask.isDone }
        : task,
    );
    taskList = newTaskList;
    return response.json({
      message: 'taskの更新が完了しました。',
      newTaskList,
    });
  };
  const deleteTask: RequestHandler = (request, response) => {
    const targetId = request.params.id;
    const isExists = taskList.some((task) => task.id === targetId);
    if (!isExists)
      return response.status(401).json({
        message: '対象のtaskが見つらなかったのでtaskの削除ができませんでした。',
        newTaskList: taskList,
      });

    const newTaskList = taskList.filter((task) => task.id !== targetId);
    taskList = newTaskList;
    return response.json({
      message: '対象のtaskの削除が完了しました。',
      newTaskList,
    });
  };
  router.get('/', getAllTaskList);
  router.get('/:id', getTargetIdTask);
  router.post('/', postTask);
  router.patch('/:id', patchTask);
  router.delete('/:id', deleteTask);
  return router;
}
