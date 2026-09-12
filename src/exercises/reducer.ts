import type { TaskList } from './chapters';

type Initial = {
  userInputTask: string;
  userEditInput: string;
  searchInput: string;
  errorMessage: string;
  targetId: string;
  taskList: TaskList[];
  category: 'all' | 'done' | 'notDone';
  sortStatus: 'default' | 'title' | 'new' | 'old';
  prevEditInputRef: string;
};

export const INITIAL: Initial = {
  userInputTask: '',
  userEditInput: '',
  searchInput: '',
  errorMessage: '',
  targetId: '',
  taskList: [],
  category: 'all',
  sortStatus: 'default',
  prevEditInputRef: '',
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return {
        taskList: action.payload,
        userInputTask: '',
        errorMessage: '',
      };
    case 'SAVE':
      return {
        taskList: action.payload,
        targetId: '',
        userEditInput: '',
        errorMessage: '',
      };
    case 'DELETE':
      return {
        taskList: action.payload,
        targetId: '',
      };
    case 'CARDCLICK':
      return {
        userEditInput: action.payload.title,
        targetId: action.payload.targetId,
      };
    case 'CANCEL':
      return {
        taskList: action.payload,
        targetId: '',
        userEditInput: '',
      };
    case 'TOGGLE':
      return {
        taskList: action.payload,
      };
    case 'GETTASKLIST':
      return {
        taskList: action.payload,
      };
    case 'SEARCHINPUT':
      return {
        searchInput: action.payload,
      };
    case 'CATEGORYCHANGE':
      return {
        category: action.payload,
      };
    case 'CAHNGESORTSTATUS':
      return {
        sortStatus: action.payload,
      };
    case 'USERINPUTTASK':
      return {
        userInputTask: action.payload,
      };
    case 'NOTFOUND':
      return {
        errorMessage: '該当するデータが存在しません。',
      };
    default:
      return state;
  }
};
