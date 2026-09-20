import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './index';

// Exported (rather than created inline in main.tsx) so the legacy auth bridge
// can dispatch into it from outside React.
export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
