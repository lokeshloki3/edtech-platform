// services/course.service.ts
import axiosClient from '@/lib/axiosClient';
import { handleClientAxiosError } from '@/lib/handleClientAxiosError';
import type { ApiEnvelope } from '@/types/api.types';
import type {
  CatalogPageData,
  CatalogPageResponse,
  Category,
  CategoryListResponse,
  CategoryResponse,
  Course,
  CourseCard,
  CourseCardListResponse,
  CourseDetailsData,
  CourseDetailsResponse,
  CourseResponse,
  FullCourseDetailsData,
  FullCourseDetailsResponse,
  InstructorCourse,
  InstructorCourseListResponse,
  InstructorCourseResponse,
  RatingAndReview,
  ReviewsResponse,
  Section,
  SectionResponse,
  SubSectionResponse,
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

/* -------------------------------------------------------------------------- */
/* Catalog / public                                                            */
/* -------------------------------------------------------------------------- */

export async function getAllCourses(): Promise<CourseCard[]> {
  try {
    const response = await axiosClient.get<CourseCardListResponse>('/course/getAllCourses');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch courses');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch courses');
  }
}

export async function getCourseCategories(): Promise<Category[]> {
  try {
    const response = await axiosClient.get<CategoryListResponse>('/course/showAllCategories');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch categories');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch categories');
  }
}

export async function getCatalogPageData(categoryId: string): Promise<CatalogPageData> {
  try {
    const response = await axiosClient.post<CatalogPageResponse>('/course/getCategoryPageDetails', {
      categoryId,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch catalog page');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch catalog page');
  }
}

export async function getCourseDetails(courseId: string): Promise<CourseDetailsData> {
  try {
    const response = await axiosClient.post<CourseDetailsResponse>('/course/getCourseDetails', {
      courseId,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch course details');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch course details');
  }
}

export async function getCourseReviews(): Promise<RatingAndReview[]> {
  try {
    const response = await axiosClient.get<ReviewsResponse>('/course/getReviews');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch reviews');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch reviews');
  }
}

/* -------------------------------------------------------------------------- */
/* Enrolled student                                                            */
/* -------------------------------------------------------------------------- */

export async function getFullCourseDetails(courseId: string): Promise<FullCourseDetailsData> {
  try {
    const response = await axiosClient.post<FullCourseDetailsResponse>(
      '/course/getFullCourseDetails',
      { courseId }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch course content');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch course content');
  }
}

export async function markLectureAsComplete(payload: LectureCompletionPayload): Promise<boolean> {
  try {
    const response = await axiosClient.post<ApiEnvelope>('/course/updateCourseProgress', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not mark lecture complete');
    }

    return true;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not mark lecture complete');
  }
}

export async function createRating(payload: CreateRatingPayload): Promise<ApiEnvelope> {
  try {
    const response = await axiosClient.post<ApiEnvelope>('/course/createRating', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not create rating');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not create rating');
  }
}

/* -------------------------------------------------------------------------- */
/* Instructor                                                                  */
/* -------------------------------------------------------------------------- */

export async function getInstructorCourses(): Promise<InstructorCourse[]> {
  try {
    const response = await axiosClient.get<InstructorCourseListResponse>(
      '/course/getInstructorCourses'
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch instructor courses');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch instructor courses');
  }
}

// Course create/edit send a FormData because of the thumbnail upload, so the
// zod schema validates the form before it is packed rather than the body here.
export async function createCourse(payload: FormData): Promise<InstructorCourse> {
  try {
    const response = await axiosClient.post<InstructorCourseResponse>(
      '/course/createCourse',
      payload,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not create course');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not create course');
  }
}

export async function editCourse(payload: FormData): Promise<Course> {
  try {
    const response = await axiosClient.post<CourseResponse>('/course/editCourse', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not update course');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not update course');
  }
}

export async function deleteCourse(courseId: string): Promise<ApiEnvelope> {
  try {
    const response = await axiosClient.delete<ApiEnvelope>('/course/deleteCourse', {
      data: { courseId },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete course');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not delete course');
  }
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  try {
    const response = await axiosClient.post<CategoryResponse>('/course/createCategory', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not create category');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not create category');
  }
}

/* -------------------------------------------------------------------------- */
/* Course builder - sections and lectures                                      */
/* -------------------------------------------------------------------------- */

export async function createSection(payload: CreateSectionPayload): Promise<InstructorCourse> {
  try {
    const response = await axiosClient.post<SectionResponse>('/course/addSection', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not create section');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not create section');
  }
}

export async function updateSection(payload: UpdateSectionPayload): Promise<InstructorCourse> {
  try {
    const response = await axiosClient.post<SectionResponse>('/course/updateSection', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not update section');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not update section');
  }
}

export async function deleteSection(payload: DeleteSectionPayload): Promise<InstructorCourse> {
  try {
    const response = await axiosClient.post<SectionResponse>('/course/deleteSection', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete section');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not delete section');
  }
}

// Lectures carry a video upload, so these two also travel as FormData. All
// three answer with the changed section, not the course.
export async function createSubSection(payload: FormData): Promise<Section> {
  try {
    const response = await axiosClient.post<SubSectionResponse>('/course/addSubSection', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not create lecture');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not create lecture');
  }
}

export async function updateSubSection(payload: FormData): Promise<Section> {
  try {
    const response = await axiosClient.post<SubSectionResponse>(
      '/course/updateSubSection',
      payload,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not update lecture');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not update lecture');
  }
}

export async function deleteSubSection(payload: DeleteSubSectionPayload): Promise<Section> {
  try {
    const response = await axiosClient.post<SubSectionResponse>(
      '/course/deleteSubSection',
      payload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete lecture');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not delete lecture');
  }
}
