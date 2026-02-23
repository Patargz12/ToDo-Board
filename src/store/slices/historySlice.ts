import { createSlice } from '@reduxjs/toolkit';

interface HistoryState {
  entries: unknown[];
  loading: boolean;
  error: string | null;
}

const initialState: HistoryState = {
  entries: [],
  loading: false,
  error: null,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {},
});

export default historySlice.reducer;
