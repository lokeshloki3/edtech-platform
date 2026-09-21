// hooks/use-course-query.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { showCustomSuccessToast } from '@/lib/customToastHelper';
import { handleMutationError } from '@/lib/handleMutationError';
import { retryUnlessAuth } from '@/lib/queryRetry';
import { profileKeys } from '@/hooks/use-profile-query';
import {
  createCategory,
  createCourse,
  createRating,
  createSection,
  createSubSection,
  deleteCourse,
  deleteSection,
  deleteSubSection,
  editCourse,
  getAllCourses,
  getCatalogPageData,
  getCourseCategories,
  getCourseDetails,
  getCourseReviews,
  getFullCourseDetails,
  getInstructorCourses,
  markLectureAsComplete,
  updateSection,
  updateSubSection,
} from '@/services/course.service';
import type { ApiEnvelope } from '@/types/api.types';
import type {
  CatalogPageData,
  Category,
  Course,
  CourseCard,
  CourseDetailsData,
  FullCourseDetailsData,
  InstructorCourse,
  RatingAndReview,
  Section,
} from '@/types/course.types';
import type {
  CreateCategoryPayload,
  CreateRatingPayload,
  CreateSectionPayload,
  DeleteSectionPayload,
  DeleteSubSectionPayload,
  LectureCompletionPayload,
  UpdateSectionPayload,
} from '@/zod-validations/course.validation';

export const courseKeys = {
  all: ['courses'] as const,
  list: () => [...courseKeys.all, 'list'] as const,
  categories: () => [...courseKeys.all, 'categories'] as const,
  catalog: (categoryId: string) => [...courseKeys.all, 'catalog', categoryId] as const,
  details: (courseId: string) => [...courseKeys.all, 'details', courseId] as const,
  fullDetails: (courseId: string) => [...courseKeys.all, 'full-details', courseId] as const,
  instructor: () => [...courseKeys.all, 'instructor'] as const,
  reviews: () => [...courseKeys.all, 'reviews'] as const,
};

/* -------------------------------------------------------------------------- */
/* Queries                                                                     */
/* -------------------------------------------------------------------------- */

export function useAllCourses(enabled = true) {
  return useQuery<CourseCard[]>({
    queryKey: courseKeys.list(),
    queryFn: getAllCourses,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCourseCategories(enabled = true) {
  return useQuery<Category[]>({
    queryKey: courseKeys.categories(),
    queryFn: getCourseCategories,
    enabled,
    // Categories change rarely and drive the navbar on every page.
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}

export function useCatalogPageData(categoryId: string) {
  return useQuery<CatalogPageData>({
    queryKey: courseKeys.catalog(categoryId),
    queryFn: () => getCatalogPageData(categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCourseDetails(courseId: string) {
  return useQuery<CourseDetailsData>({
    queryKey: courseKeys.details(courseId),
    queryFn: () => getCourseDetails(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFullCourseDetails(courseId: string) {
  return useQuery<FullCourseDetailsData>({
    queryKey: courseKeys.fullDetails(courseId),
    queryFn: () => getFullCourseDetails(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
    retry: retryUnlessAuth(1),
  });
}

export function useInstructorCourses(enabled = true) {
  return useQuery<InstructorCourse[]>({
    queryKey: courseKeys.instructor(),
    queryFn: getInstructorCourses,
    enabled,
    staleTime: 1000 * 60 * 2,
    retry: retryUnlessAuth(1),
  });
}

export function useCourseReviews(enabled = true) {
  return useQuery<RatingAndReview[]>({
    queryKey: courseKeys.reviews(),
    queryFn: getCourseReviews,
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

/* -------------------------------------------------------------------------- */
/* Mutations                                                                   */
/* -------------------------------------------------------------------------- */

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryPayload>({
    mutationFn: (payload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.categories() });
      showCustomSuccessToast({ message: 'Category created successfully' });
    },
    onError: (err) => handleMutationError(err, 'Could not create category'),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation<InstructorCourse, Error, FormData>({
    mutationFn: (payload) => createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.instructor() });
      showCustomSuccessToast({ message: 'Course details added successfully' });
    },
    onError: (err) => handleMutationError(err, 'Could not create course'),
  });
}

export function useEditCourse() {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, FormData>({
    mutationFn: (payload) => editCourse(payload),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.instructor() });
      queryClient.invalidateQueries({ queryKey: courseKeys.details(course._id) });
      showCustomSuccessToast({ message: 'Course details updated successfully' });
    },
    onError: (err) => handleMutationError(err, 'Could not update course'),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation<ApiEnvelope, Error, string>({
    mutationFn: (courseId) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.instructor() });
      queryClient.invalidateQueries({ queryKey: profileKeys.instructorData() });
      showCustomSuccessToast({ message: 'Course deleted successfully' });
    },
    onError: (err) => handleMutationError(err, 'Could not delete course'),
  });
}

// The section mutations answer with the course, the sub-section ones with just
// the changed section, which the AddCourse/EditCourse screens rebuild around.
export function useCreateSection() {
  return useMutation<InstructorCourse, Error, CreateSectionPayload>({
    mutationFn: (payload) => createSection(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'Course section created' }),
    onError: (err) => handleMutationError(err, 'Could not create section'),
  });
}

export function useUpdateSection() {
  return useMutation<InstructorCourse, Error, UpdateSectionPayload>({
    mutationFn: (payload) => updateSection(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'Course section updated' }),
    onError: (err) => handleMutationError(err, 'Could not update section'),
  });
}

export function useDeleteSection() {
  return useMutation<InstructorCourse, Error, DeleteSectionPayload>({
    mutationFn: (payload) => deleteSection(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'Course section deleted' }),
    onError: (err) => handleMutationError(err, 'Could not delete section'),
  });
}

export function useCreateSubSection() {
  return useMutation<Section, Error, FormData>({
    mutationFn: (payload) => createSubSection(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'Lecture added' }),
    onError: (err) => handleMutationError(err, 'Could not add lecture'),
  });
}

export function useUpdateSubSection() {
  return useMutation<Section, Error, FormData>({
    mutationFn: (payload) => updateSubSection(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'Lecture updated' }),
    onError: (err) => handleMutationError(err, 'Could not update lecture'),
  });
}

export function useDeleteSubSection() {
  return useMutation<Section, Error, DeleteSubSectionPayload>({
    mutationFn: (payload) => deleteSubSection(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'Lecture deleted' }),
    onError: (err) => handleMutationError(err, 'Could not delete lecture'),
  });
}

export function useMarkLectureAsComplete() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, LectureCompletionPayload>({
    mutationFn: (payload) => markLectureAsComplete(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.fullDetails(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.enrolledCourses() });
      showCustomSuccessToast({ message: 'Lecture completed' });
    },
    onError: (err) => handleMutationError(err, 'Could not mark lecture complete'),
  });
}

export function useCreateRating() {
  const queryClient = useQueryClient();

  return useMutation<ApiEnvelope, Error, CreateRatingPayload>({
    mutationFn: (payload) => createRating(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.reviews() });
      queryClient.invalidateQueries({ queryKey: courseKeys.details(variables.courseId) });
      showCustomSuccessToast({ message: 'Thanks for your review' });
    },
    onError: (err) => handleMutationError(err, 'Could not create rating'),
  });
}
