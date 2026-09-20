// types/course.types.ts
import type { ApiEnvelope, AuthUser } from '@/types/auth.types';

export type CourseStatus = 'Draft' | 'Published';

export interface Category {
  _id: string;
  name: string;
  description: string;
  courses?: Course[];
}

export interface SubSection {
  _id: string;
  title: string;
  timeDuration: string;
  description: string;
  videoUrl: string;
}

export interface Section {
  _id: string;
  sectionName: string;
  subSection: SubSection[];
}

export interface RatingAndReview {
  _id: string;
  user: Pick<AuthUser, '_id' | 'firstName' | 'lastName' | 'image'>;
  rating: number;
  review: string;
  course: string;
}

export interface Course {
  _id: string;
  courseName: string;
  courseDescription: string;
  instructor: AuthUser;
  whatYouWillLearn: string;
  courseContent: Section[];
  ratingAndReviews: RatingAndReview[];
  price: number;
  thumbnail: string;
  tag: string[];
  category: Category;
  studentsEnrolled: string[];
  instructions: string[];
  status: CourseStatus;
  createdAt: string;
}

/** A course on the student dashboard, decorated by the server with progress. */
export interface EnrolledCourse extends Course {
  totalDuration: string;
  progressPercentage: number;
}

/** A course on the instructor dashboard, reduced to its stats. */
export interface InstructorCourseStat {
  _id: string;
  courseName: string;
  courseDescription: string;
  totalStudentsEnrolled: number;
  totalAmountGenerated: number;
}

export interface CourseDetailsData {
  courseDetails: Course;
  totalDuration: string;
}

export interface FullCourseDetailsData extends CourseDetailsData {
  completedVideos: string[];
}

export interface CourseListResponse extends ApiEnvelope {
  data: Course[];
}

export interface CourseResponse extends ApiEnvelope {
  data: Course;
}

export interface CourseDetailsResponse extends ApiEnvelope {
  data: CourseDetailsData;
}

export interface FullCourseDetailsResponse extends ApiEnvelope {
  data: FullCourseDetailsData;
}

export interface CategoryListResponse extends ApiEnvelope {
  data: Category[];
}

export interface CatalogPageData {
  selectedCategory: Category;
  differentCategory: Category;
  mostSellingCourses: Course[];
}

export interface CatalogPageResponse extends ApiEnvelope {
  data: CatalogPageData;
}

export interface SectionResponse extends ApiEnvelope {
  data: Course;
  updatedCourse?: Course;
}

export interface EnrolledCoursesResponse extends ApiEnvelope {
  data: EnrolledCourse[];
}

/** instructorDashboard returns a bare { courses } with no envelope. */
export interface InstructorDashboardResponse {
  courses: InstructorCourseStat[];
}

export interface ReviewsResponse extends ApiEnvelope {
  data: RatingAndReview[];
}
