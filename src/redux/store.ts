import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import { apiClient } from '../api/apiClient';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

apiClient.setStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
