import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  idToken: string | null;
  refreshToken: string | null;
  tokenExpiresIn: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  idToken: null,
  refreshToken: null,
  tokenExpiresIn: null,
};

interface LoginSuccessPayload {
  user: User;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.idToken = action.payload.idToken;
      state.refreshToken = action.payload.refreshToken;
      state.tokenExpiresIn = action.payload.expiresIn;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.idToken = null;
      state.refreshToken = null;
      state.tokenExpiresIn = null;
      state.error = action.payload;
    },
    logout: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.idToken = null;
      state.refreshToken = null;
      state.tokenExpiresIn = null;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateTokens: (
      state,
      action: PayloadAction<{
        idToken: string;
        refreshToken: string;
        expiresIn: string;
      }>,
    ) => {
      state.idToken = action.payload.idToken;
      state.refreshToken = action.payload.refreshToken;
      state.tokenExpiresIn = action.payload.expiresIn;
    },
    clearError: state => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updateTokens,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
