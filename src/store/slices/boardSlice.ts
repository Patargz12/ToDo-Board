import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category } from '@/types';
import {
  getCategories,
  createCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  batchUpdateCategoryPositions,
} from '@/lib/api/categories';
import { createHistoryEntry } from '@/lib/api/history';

interface BoardState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

type StateShape = {
  auth: { user: { id: string } | null };
  board: BoardState;
};

const initialState: BoardState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'board/fetchCategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');
      return await getCategories(userId);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as StateShape;
      return !state.board.loading;
    },
  }
);

export const addCategory = createAsyncThunk(
  'board/addCategory',
  async ({ name, color }: { name: string; color: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');
      const position = state.board.categories.length;
      const category = await createCategory({ name, color, position, userId });
      await createHistoryEntry(
        'board',
        'category_created',
        `Created column "${name}"`,
        null,
        userId
      );
      return category;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'board/updateCategory',
  async (
    { id, name, color }: { id: string; name?: string; color?: string },
    { rejectWithValue }
  ) => {
    try {
      const updates: { name?: string; color?: string } = {};
      if (name !== undefined) updates.name = name;
      if (color !== undefined) updates.color = color;
      return await apiUpdateCategory(id, updates);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'board/deleteCategory',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');
      const deletedCategory = state.board.categories.find((c) => c.id === id);
      await apiDeleteCategory(id);
      const remaining = state.board.categories
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, position: i }));
      if (remaining.length > 0) {
        await batchUpdateCategoryPositions(remaining.map(({ id, position }) => ({ id, position })));
      }
      await createHistoryEntry('board', 'category_deleted', `Deleted column "${deletedCategory?.name ?? id}"`, null, userId);
      return { id, remaining };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const reorderCategories = createAsyncThunk(
  'board/reorderCategories',
  async (categories: Category[], { getState, rejectWithValue }) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');
      await batchUpdateCategoryPositions(categories.map(({ id, position }) => ({ id, position })));
      await createHistoryEntry(
        'board',
        'categories_reordered',
        'Reordered columns',
        null,
        userId
      );
      return categories;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = action.payload.remaining;
      })
      .addCase(reorderCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default boardSlice.reducer;
