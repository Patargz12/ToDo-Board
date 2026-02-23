import { createSlice } from '@reduxjs/toolkit';

interface BoardState {
  categories: unknown[];
  loading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  categories: [],
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {},
});

export default boardSlice.reducer;
