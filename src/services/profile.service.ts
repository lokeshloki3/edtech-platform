// services/profile.service.ts
import axiosClient from '@/lib/axiosClient';
import { handleClientAxiosError } from '@/lib/handleClientAxiosError';
import type { ApiResponse } from '@/types/api.types';
import type { EnrolledCourse, InstructorCourseStat } from '@/types/course.types';

export async function getEnrolledCourses(): Promise<EnrolledCourse[]> {
  try {
    const response = await axiosClient.get<ApiResponse<EnrolledCourse[]>>(
      '/profile/getEnrolledCourses'
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch enrolled courses');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch enrolled courses');
  }
}

export async function getInstructorData(): Promise<InstructorCourseStat[]> {
  try {
    const response = await axiosClient.get<ApiResponse<InstructorCourseStat[]>>(
      '/profile/instructorDashboard'
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch instructor data');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch instructor data');
  }
}
