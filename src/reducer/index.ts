import { combineReducers } from '@reduxjs/toolkit';

import cartReducer from '../slices/cartSlice';
import courseReducer from '../slices/courseSlice';
import viewCourseReducer from '../slices/viewCourseSlice';

// Auth and profile now live in the zustand auth store; what remains here is the
// editor and cart state that has not been migrated yet.
const rootReducer = combineReducers({
  cart: cartReducer,
  course: courseReducer,
  viewCourse: viewCourseReducer,
});

export default rootReducer;
