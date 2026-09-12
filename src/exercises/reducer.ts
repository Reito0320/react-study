export type TaskList = {
  id: string;
  title: string;
  isDone: boolean;
  createdAt: Date;
};

export type Initial = {
  userInputTask: string;
  userEditInput: string;
  searchInput: string;
  errorMessage: string;
  targetId: string;
  taskList: TaskList[];
  category: 'all' | 'done' | 'notDone';
  sortStatus: 'default' | 'title' | 'new' | 'old';
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
};

export type Action =
  | { type: 'ADD'; payload: TaskList }
  | { type: 'SAVE'; payload: TaskList[] }
  | { type: 'DELETE'; payload: TaskList[] }
  | {
      type: 'CARDCLICK';
      payload: {
        title: string;
        targetId: string;
      };
    }
  | { type: 'CANCEL'; payload: TaskList[] }
  | { type: 'CHANGETASKLIST'; payload: TaskList[] }
  | { type: 'SEARCHINPUT'; payload: string }
  | { type: 'CATEGORYCHANGE'; payload: Initial['category'] }
  | { type: 'CAHNGESORTSTATUS'; payload: Initial['sortStatus'] }
  | { type: 'USERINPUTTASK'; payload: string }
  | { type: 'EDITUSERINPUT'; payload: string }
  | { type: 'ERROR'; payload: string };

export const reducer = (state: Initial, action: Action): Initial => {
  switch (action.type) {
    case 'ADD':
      return {
        ...state,
        taskList: [...state.taskList, action.payload],
        userInputTask: '',
        errorMessage: '',
      };
    case 'SAVE':
      return {
        ...state,
        taskList: action.payload,
        targetId: '',
        userEditInput: '',
        errorMessage: '',
      };
    case 'DELETE':
      return {
        ...state,
        taskList: action.payload,
        targetId: '',
      };
    case 'CARDCLICK':
      return {
        ...state,
        userEditInput: action.payload.title,
        targetId: action.payload.targetId,
      };
    case 'CANCEL':
      return {
        ...state,
        taskList: action.payload,
        targetId: '',
        userEditInput: '',
      };
    case 'CHANGETASKLIST':
      return {
        ...state,
        taskList: action.payload,
      };

    case 'SEARCHINPUT':
      return {
        ...state,
        searchInput: action.payload,
      };
    case 'CATEGORYCHANGE':
      return {
        ...state,
        category: action.payload,
      };
    case 'CAHNGESORTSTATUS':
      return {
        ...state,
        sortStatus: action.payload,
      };
    case 'USERINPUTTASK':
      return {
        ...state,
        userInputTask: action.payload,
      };
    case 'EDITUSERINPUT':
      return {
        ...state,
        userEditInput: action.payload,
      };
    case 'ERROR':
      return {
        ...state,
        errorMessage: action.payload,
      };
    default:
      return state;
  }
};
