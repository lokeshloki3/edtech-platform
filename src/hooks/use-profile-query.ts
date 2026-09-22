// hooks/use-profile-query.ts
import { useQuery } from '@tanstack/react-query';

import { getEnrolledCourses, getInstructorData } from '@/services/profile.service';
import type { EnrolledCourse, InstructorCourseStat } from '@/types/course.types';

export const profileKeys = {
  all: ['profile'] as const,
  enrolledCourses: () => [...profileKeys.all, 'enrolled-courses'] as const,
  instructorData: () => [...profileKeys.all, 'instructor-data'] as const,
};

export function useEnrolledCourses(enabled = true) {
  return useQuery<EnrolledCourse[]>({
    queryKey: profileKeys.enrolledCourses(),
    queryFn: getEnrolledCourses,
    enabled,
  });
}

export function useInstructorData(enabled = true) {
  return useQuery<InstructorCourseStat[]>({
    queryKey: profileKeys.instructorData(),
    queryFn: getInstructorData,
    enabled,
  });
}
