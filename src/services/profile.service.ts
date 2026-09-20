// services/profile.service.ts
import axiosClient from '@/lib/axiosClient';
import { handleClientAxiosError } from '@/lib/handleClientAxiosError';
import type {
  EnrolledCourse,
  EnrolledCoursesResponse,
  InstructorCourseStat,
  InstructorDashboardResponse,
} from '@/types/course.types';

export async function getEnrolledCourses(): Promise<EnrolledCourse[]> {
  try {
    const response = await axiosClient.get<EnrolledCoursesResponse>('/profile/getEnrolledCourses');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch enrolled courses');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch enrolled courses');
  }
}

// instructorDashboard answers with a bare { courses } and no success flag.
export async function getInstructorData(): Promise<InstructorCourseStat[]> {
  try {
    const response = await axiosClient.get<InstructorDashboardResponse>(
      '/profile/instructorDashboard'
    );

    return response.data?.courses ?? [];
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch instructor data');
  }
}
