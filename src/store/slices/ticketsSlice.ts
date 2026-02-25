import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Ticket, Category } from '@/src/types';
import {
  getTickets,
  createTicket,
  updateTicket as apiUpdateTicket,
  deleteTicket as apiDeleteTicket,
  batchUpdateTicketPositions,
} from '@/src/lib/api/tickets';
import { createHistoryEntry } from '@/src/lib/api/history';

interface TicketsState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

type StateShape = {
  auth: { user: { id: string } | null };
  tickets: TicketsState;
  board: { categories: Category[] };
};

const initialState: TicketsState = {
  tickets: [],
  loading: false,
  error: null,
};

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');
      return await getTickets(userId);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const addTicket = createAsyncThunk(
  'tickets/addTicket',
  async (
    payload: {
      title: string;
      description: string;
      expiryDate: string;
      priorityLabel: string;
      priorityColor: string;
      priorityOrder: number;
      categoryId: string;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const position = state.tickets.tickets.filter(
        (t) => t.categoryId === payload.categoryId
      ).length;

      const ticket = await createTicket({ ...payload, userId, position });

      await createHistoryEntry(
        'card',
        'ticket_created',
        { ticketId: ticket.id, title: ticket.title },
        ticket.id,
        userId
      );

      return ticket;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async (
    payload: Partial<{
      title: string;
      description: string;
      expiryDate: string;
      priorityLabel: string;
      priorityColor: string;
      priorityOrder: number;
    }> & { id: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const before = state.tickets.tickets.find((t) => t.id === payload.id);
      const { id, ...fields } = payload;

      const ticket = await apiUpdateTicket(id, fields);

      await createHistoryEntry(
        'card',
        'ticket_updated',
        { before, after: ticket },
        id,
        userId
      );

      return ticket;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteTicket = createAsyncThunk(
  'tickets/deleteTicket',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const ticket = state.tickets.tickets.find((t) => t.id === id);
      if (!ticket) throw new Error('Ticket not found');

      await apiDeleteTicket(id);

      const remaining = state.tickets.tickets
        .filter((t) => t.categoryId === ticket.categoryId && t.id !== id)
        .sort((a, b) => a.position - b.position)
        .map((t, i) => ({ ...t, position: i }));

      if (remaining.length > 0) {
        await batchUpdateTicketPositions(remaining.map(({ id: tid, position }) => ({ id: tid, position })));
      }

      await createHistoryEntry(
        'card',
        'ticket_deleted',
        { ticketId: id, title: ticket.title },
        id,
        userId
      );

      return { id, categoryId: ticket.categoryId, remaining };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const moveTicket = createAsyncThunk(
  'tickets/moveTicket',
  async (
    { ticketId, targetCategoryId, targetPosition }: { ticketId: string; targetCategoryId: string; targetPosition: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as StateShape;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const ticket = state.tickets.tickets.find((t) => t.id === ticketId);
      if (!ticket) throw new Error('Ticket not found');

      const sourceCategoryId = ticket.categoryId;

      const sourceRemaining = state.tickets.tickets
        .filter((t) => t.categoryId === sourceCategoryId && t.id !== ticketId)
        .sort((a, b) => a.position - b.position)
        .map((t, i) => ({ ...t, position: i }));

      const targetTickets = state.tickets.tickets
        .filter((t) => t.categoryId === targetCategoryId && t.id !== ticketId)
        .sort((a, b) => a.position - b.position);

      targetTickets.splice(targetPosition, 0, { ...ticket, categoryId: targetCategoryId, position: targetPosition });

      const targetReindexed = targetTickets.map((t, i) => ({ ...t, position: i }));

      await apiUpdateTicket(ticketId, { categoryId: targetCategoryId, position: targetPosition });

      const allUpdates = [
        ...sourceRemaining.map(({ id, position }) => ({ id, position })),
        ...targetReindexed.filter((t) => t.id !== ticketId).map(({ id, position }) => ({ id, position })),
      ];

      if (allUpdates.length > 0) {
        await batchUpdateTicketPositions(allUpdates);
      }

      const sourceCategory = state.board.categories.find((c) => c.id === sourceCategoryId);
      const targetCategory = state.board.categories.find((c) => c.id === targetCategoryId);

      await createHistoryEntry(
        'card',
        'ticket_moved',
        {
          ticketId,
          from: sourceCategory?.name ?? sourceCategoryId,
          to: targetCategory?.name ?? targetCategoryId,
          message: `Moved from ${sourceCategory?.name ?? sourceCategoryId} to ${targetCategory?.name ?? targetCategoryId}`,
        },
        ticketId,
        userId
      );

      return { ticketId, sourceCategoryId, targetCategoryId, targetPosition, sourceRemaining, targetReindexed };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const reorderTickets = createAsyncThunk(
  'tickets/reorderTickets',
  async ({ categoryId, tickets }: { categoryId: string; tickets: Ticket[] }, { rejectWithValue }) => {
    try {
      await batchUpdateTicketPositions(tickets.map(({ id, position }) => ({ id, position })));
      return { categoryId, tickets };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTicket.fulfilled, (state, action) => {
        state.tickets.push(action.payload);
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        const index = state.tickets.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.tickets[index] = action.payload;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.tickets = state.tickets
          .filter((t) => t.id !== action.payload.id)
          .map((t) => {
            if (t.categoryId !== action.payload.categoryId) return t;
            const updated = action.payload.remaining.find((r) => r.id === t.id);
            return updated ?? t;
          });
      })
      .addCase(moveTicket.fulfilled, (state, action) => {
        const { ticketId, targetCategoryId, targetReindexed, sourceRemaining } = action.payload;

        state.tickets = state.tickets.filter((t) => t.id !== ticketId);

        sourceRemaining.forEach((updated) => {
          const idx = state.tickets.findIndex((t) => t.id === updated.id);
          if (idx !== -1) state.tickets[idx] = updated;
        });

        const movedTicket = targetReindexed.find((t) => t.id === ticketId);
        if (movedTicket) {
          state.tickets.push({ ...movedTicket, categoryId: targetCategoryId });
        }

        targetReindexed.forEach((updated) => {
          if (updated.id === ticketId) return;
          const idx = state.tickets.findIndex((t) => t.id === updated.id);
          if (idx !== -1) state.tickets[idx] = updated;
        });
      })
      .addCase(reorderTickets.fulfilled, (state, action) => {
        action.payload.tickets.forEach((updated) => {
          const idx = state.tickets.findIndex((t) => t.id === updated.id);
          if (idx !== -1) state.tickets[idx] = updated;
        });
      });
  },
});

export default ticketsSlice.reducer;
