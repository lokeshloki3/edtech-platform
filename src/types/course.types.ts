// types/course.types.ts
import type { AuthUser, Profile } from '@/types/auth.types';

export type CourseStatus = 'Draft' | 'Published';

/** An instructor as getAllCourses sends it, with additionalDetails still an id. */
export type InstructorSummary = Pick<
  AuthUser,
  '_id' | 'firstName' | 'lastName' | 'email' | 'image'
>;

/** An instructor with the profile populated, as the detail endpoints send it. */
export interface InstructorDetail extends InstructorSummary {
  additionalDetails: Profile;
}

export type ReviewAuthor = Pick<AuthUser, '_id' | 'firstName' | 'lastName' | 'image'>;

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

/** A review nested in a course, populated one level only: it carries the star
 *  average and the count, but the author and course are still ids. */
export interface CourseReview {
  _id: string;
  user: string;
  rating: number;
  review: string;
  course: string;
}

/** A review from getReviews, which populates the author and the course name. */
export interface RatingAndReview {
  _id: string;
  user: ReviewAuthor;
  rating: number;
  review: string;
  course: Pick<Course, '_id' | 'courseName'>;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  /** Populated by getCategoryPageDetails; an id list everywhere else. */
  courses?: CatalogCourse[];
}

// getAllCourses answers with a six-field projection, and most endpoints leave
// instructor and category as ids, so each endpoint family gets the shape it
// really returns rather than one Course that over-promises on all of them.

export interface CourseBase {
  _id: string;
  courseName: string;
  price: number;
  thumbnail: string;
  studentsEnrolled: string[];
}

/** The fields getAllCourses' projection leaves out. */
export interface CourseDetailFields {
  courseDescription: string;
  whatYouWillLearn: string;
  tag: string[];
  instructions: string[];
  status: CourseStatus;
  createdAt: string;
}

/** getAllCourses. */
export interface CourseCard extends CourseBase {
  instructor: InstructorSummary;
  ratingAndReviews: string[];
}

/** Nested under a category by getCategoryPageDetails. */
export interface CatalogCourse extends CourseBase, CourseDetailFields {
  instructor: string;
  category: string;
  courseContent: string[];
  ratingAndReviews: CourseReview[];
}

/** Sections populated, instructor and category still ids. */
export interface CourseWithSections extends CourseBase, CourseDetailFields {
  instructor: string;
  category: string;
  courseContent: Section[];
  ratingAndReviews: string[];
}

/** getInstructorCourses, createCourse and the section mutations. */
export interface InstructorCourse extends CourseWithSections {
  /** getInstructorCourses adds it; the mutations do not. */
  totalDuration?: string;
}

/** A course on the student dashboard, decorated by the server with progress. */
export interface EnrolledCourse extends CourseWithSections {
  totalDuration: string;
  progressPercentage: number;
}

/** Fully populated: getCourseDetails, getFullCourseDetails and editCourse. */
export interface Course extends CourseBase, CourseDetailFields {
  instructor: InstructorDetail;
  category: Category;
  courseContent: Section[];
  ratingAndReviews: CourseReview[];
}

/** What courseSlice holds while editing: seeded fully populated, then replaced
 *  by the section mutations' less populated answer. */
export type BuilderCourse = Course | InstructorCourse;

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

export interface CatalogPageData {
  selectedCategory: Category;
  differentCategory: Category;
  mostSellingCourses: CatalogCourse[];
}
