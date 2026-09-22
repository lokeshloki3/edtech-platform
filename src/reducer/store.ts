import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './index';

// No RootState/AppDispatch exports: rootReducer is still assembled from untyped
// .js slices, so getState() infers `course: null` and `never[]`. The two .tsx
// consumers declare the slice shape they need until the slices become .ts.
export const store = configureStore({
  reducer: rootReducer,
});
