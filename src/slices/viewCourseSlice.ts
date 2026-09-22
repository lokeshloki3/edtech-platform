import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Course, Section } from '@/types/course.types';

interface ViewCourseState {
  courseSectionData: Section[];
  courseEntireData: Course | null;
  /** Subsection ids. */
  completedLectures: string[];
  totalNoOfLectures: number;
}

const initialState: ViewCourseState = {
  courseSectionData: [],
  courseEntireData: null,
  completedLectures: [],
  totalNoOfLectures: 0,
};

const viewCourseSlice = createSlice({
  name: 'viewCourse',
  initialState,
  reducers: {
    setCourseSectionData: (state, action: PayloadAction<Section[]>) => {
      state.courseSectionData = action.payload;
    },
    setEntireCourseData: (state, action: PayloadAction<Course | null>) => {
      state.courseEntireData = action.payload;
    },
    setTotalNoOfLectures: (state, action: PayloadAction<number>) => {
      state.totalNoOfLectures = action.payload;
    },
    setCompletedLectures: (state, action: PayloadAction<string[]>) => {
      state.completedLectures = action.payload;
    },
    updateCompletedLectures: (state, action: PayloadAction<string>) => {
      state.completedLectures = [...state.completedLectures, action.payload];
    },
  },
});

export const {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
  updateCompletedLectures,
} = viewCourseSlice.actions;

export default viewCourseSlice.reducer;
