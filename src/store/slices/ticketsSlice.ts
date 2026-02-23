import { createSlice } from '@reduxjs/toolkit';

interface TicketsState {
  tickets: unknown[];
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  loading: false,
  error: null,
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
});

export default ticketsSlice.reducer;
