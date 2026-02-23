import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/src/lib/supabase';
import { User } from '@/src/types';
import { storeAuth, clearStoredAuth, getStoredUser, getStoredToken } from '@/src/lib/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, username }: { email: string; password: string; username: string }, { rejectWithValue }) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user || !authData.session) throw new Error('Signup failed');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      const user: User = {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        avatarUrl: profile.avatar_url,
        notificationDaysBefore: profile.notification_days_before,
        createdAt: profile.created_at,
      };

      storeAuth(authData.session.access_token, user);

      return { user, token: authData.session.access_token };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Signup failed');
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!authData.user || !authData.session) throw new Error('Login failed');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      const user: User = {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        avatarUrl: profile.avatar_url,
        notificationDaysBefore: profile.notification_days_before,
        createdAt: profile.created_at,
      };

      storeAuth(authData.session.access_token, user);

      return { user, token: authData.session.access_token };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Login failed');
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearStoredAuth();

      return null;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Logout failed');
    }
  }
);

export const loadSession = createAsyncThunk(
  'auth/loadSession',
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = getStoredUser();
      const storedToken = getStoredToken();

      if (storedUser && storedToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          clearStoredAuth();
          return { user: null, token: null };
        }

        return { user: storedUser, token: storedToken };
      }

      return { user: null, token: null };
    } catch (error: unknown) {
      clearStoredAuth();
      return rejectWithValue((error as Error).message || 'Session load failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loadSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
