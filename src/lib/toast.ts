import { store } from '@/store/store';
import { addToast } from '@/store/slices/notificationSlice';

function dispatch(message: string, type: 'info' | 'warning' | 'error' | 'success') {
  store.dispatch(addToast({ message, type }));
}

export const toast = {
  info: (message: string) => dispatch(message, 'info'),
  warning: (message: string) => dispatch(message, 'warning'),
  error: (message: string) => dispatch(message, 'error'),
  success: (message: string) => dispatch(message, 'success'),
};
