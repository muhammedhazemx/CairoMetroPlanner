import { configureStore } from '@reduxjs/toolkit';
import plannerReducer from '../features/planner/plannerSlice';
import themeReducer from '../features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    planner: plannerReducer,
    theme: themeReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
