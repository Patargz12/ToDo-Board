import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import boardReducer from './slices/boardSlice';
import ticketsReducer from './slices/ticketsSlice';
import historyReducer from './slices/historySlice';
import draftsReducer from './slices/draftsSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    tickets: ticketsReducer,
    history: historyReducer,
    drafts: draftsReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
