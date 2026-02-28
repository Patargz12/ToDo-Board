import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getTicketIdsWithDrafts } from '@/src/lib/api/drafts';

interface DraftsState {
  draftedTicketIds: string[];
}

const initialState: DraftsState = {
  draftedTicketIds: [],
};

export const fetchDraftedTicketIds = createAsyncThunk(
  'drafts/fetchDraftedTicketIds',
  async (userId: string) => {
    return getTicketIdsWithDrafts(userId);
  }
);

const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    markDrafted(state, action: PayloadAction<string>) {
      if (!state.draftedTicketIds.includes(action.payload)) {
        state.draftedTicketIds.push(action.payload);
      }
    },
    unmarkDrafted(state, action: PayloadAction<string>) {
      state.draftedTicketIds = state.draftedTicketIds.filter((id) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDraftedTicketIds.fulfilled, (state, action) => {
      state.draftedTicketIds = action.payload;
    });
  },
});

export const { markDrafted, unmarkDrafted } = draftsSlice.actions;
export default draftsSlice.reducer;
