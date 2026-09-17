import { useEffect, useReducer } from 'react';
import { INITIAL, reducer, type Initial, type TaskList } from './reducer';

export const useTasks = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const {
    userInputTask,
    userEditInput,
    searchInput,
    targetId,
    taskList,
    category,
    sortStatus,
  }: Initial = state;

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
  const handleCategoryButton = (inputCategory: 'all' | 'done' | 'notDone') => {
    dispatch({ type: 'CATEGORYCHANGE', payload: inputCategory });
  };
  const handleSortButton = (inputSort: 'default' | 'title' | 'new' | 'old') => {
    dispatch({ type: 'CAHNGESORTSTATUS', payload: inputSort });
  };
  const changeSearchInput = (content: string) => {
    dispatch({ type: 'SEARCHINPUT', payload: content });
  };
  const changeTaskInput = (content: string) => {
    dispatch({
      type: 'USERINPUTTASK',
      payload: content,
    });
  };
  const changeEditInput = (content: string) => {
    dispatch({
      type: 'EDITUSERINPUT',
      payload: content,
    });
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

  const notIsDoneTaskLength = taskList.filter((obj) => !obj.isDone).length;
  const visibleTasks = getSearchTaskList();

  return {
    state,
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
  };
};
