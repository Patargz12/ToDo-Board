import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { HistoryEntry } from '@/src/types';
import { supabase } from '@/src/lib/supabase';

interface HistoryState {
  boardHistory: HistoryEntry[];
  cardHistory: Record<string, HistoryEntry[]>;
  loading: boolean;
  error: string | null;
}

type StateShape = {
  auth: { user: { id: string } | null };
};

const initialState: HistoryState = {
  boardHistory: [],
  cardHistory: {},
  loading: false,
  error: null,
};

function mapRow(row: Record<string, unknown>): HistoryEntry {
  return {
    id: row.id as string,
    type: row.type as 'board' | 'card',
    action: row.action as string,
    details: row.details as Record<string, unknown>,
    ticketId: row.ticket_id as string | null,
    userId: row.user_id as string,
    createdAt: row.created_at as string,
  };
}

export const fetchBoardHistory = createAsyncThunk(
  'history/fetchBoardHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'board')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapRow);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchCardHistory = createAsyncThunk(
  'history/fetchCardHistory',
  async (ticketId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'card')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { ticketId, entries: data.map(mapRow) };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoardHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.boardHistory = action.payload;
      })
      .addCase(fetchBoardHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCardHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.cardHistory[action.payload.ticketId] = action.payload.entries;
      })
      .addCase(fetchCardHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default historySlice.reducer;
