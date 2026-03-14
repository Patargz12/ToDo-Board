import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface NotificationState {
  toasts: Toast[];
  notificationSettings: {
    daysBefore: number;
    pushEnabled: boolean;
  };
}

const initialState: NotificationState = {
  toasts: [],
  notificationSettings: {
    daysBefore: 3,
    pushEnabled: false,
  },
};

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateNotificationSettings',
  async (
    { daysBefore, userId }: { daysBefore: number; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_days_before: daysBefore })
        .eq('id', userId);
      if (error) throw error;
      return daysBefore;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updatePushNotificationSettings = createAsyncThunk(
  'notifications/updatePushNotificationSettings',
  async (
    { pushEnabled, userId }: { pushEnabled: boolean; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ push_enabled: pushEnabled })
        .eq('id', userId);
      if (error) throw error;
      return pushEnabled;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      state.toasts.push({ ...action.payload, id });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setPushEnabled(state, action: PayloadAction<boolean>) {
      state.notificationSettings.pushEnabled = action.payload;
    },
    setDaysBefore(state, action: PayloadAction<number>) {
      state.notificationSettings.daysBefore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateNotificationSettings.fulfilled, (state, action) => {
      state.notificationSettings.daysBefore = action.payload;
    });
    builder.addCase(updatePushNotificationSettings.fulfilled, (state, action) => {
      state.notificationSettings.pushEnabled = action.payload;
    });
  },
});

export const { addToast, removeToast, setPushEnabled, setDaysBefore } = notificationSlice.actions;
export default notificationSlice.reducer;
