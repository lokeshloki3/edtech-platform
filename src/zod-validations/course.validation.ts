// zod-validations/course.validation.ts
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
  description: z.string().trim().min(1, 'Description is required'),
});

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;

// Course create/edit are multipart because of the thumbnail, so this schema
// validates the form fields and the FormData is packed from its output.
export const courseFormSchema = z.object({
  courseTitle: z.string().trim().min(1, 'Course title is required'),
  courseShortDesc: z.string().trim().min(1, 'Course description is required'),
  coursePrice: z.coerce.number().min(0, 'Price cannot be negative'),
  courseCategory: z.string().min(1, 'Select a category'),
  courseBenefits: z.string().trim().min(1, 'Benefits of the course are required'),
  courseRequirements: z.array(z.string()).min(1, 'Add at least one requirement'),
  courseTags: z.array(z.string()).min(1, 'Add at least one tag'),
});

export type CourseFormPayload = z.infer<typeof courseFormSchema>;

export const createSectionSchema = z.object({
  sectionName: z.string().trim().min(1, 'Section name is required'),
  courseId: z.string().min(1, 'Course id is missing'),
});

export type CreateSectionPayload = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = createSectionSchema.extend({
  sectionId: z.string().min(1, 'Section id is missing'),
});

export type UpdateSectionPayload = z.infer<typeof updateSectionSchema>;

export const deleteSectionSchema = z.object({
  sectionId: z.string().min(1, 'Section id is missing'),
  courseId: z.string().min(1, 'Course id is missing'),
});

export type DeleteSectionPayload = z.infer<typeof deleteSectionSchema>;

export const deleteSubSectionSchema = z.object({
  subSectionId: z.string().min(1, 'Lecture id is missing'),
  sectionId: z.string().min(1, 'Section id is missing'),
});

export type DeleteSubSectionPayload = z.infer<typeof deleteSubSectionSchema>;

// Lecture create/edit are multipart because of the video file.
export const subSectionFormSchema = z.object({
  lectureTitle: z.string().trim().min(1, 'Lecture title is required'),
  lectureDesc: z.string().trim().min(1, 'Lecture description is required'),
});

export type SubSectionFormPayload = z.infer<typeof subSectionFormSchema>;

export const lectureCompletionSchema = z.object({
  courseId: z.string().min(1, 'Course id is missing'),
  subSectionId: z.string().min(1, 'Lecture id is missing'),
});

export type LectureCompletionPayload = z.infer<typeof lectureCompletionSchema>;

export const createRatingSchema = z.object({
  courseId: z.string().min(1, 'Course id is missing'),
  rating: z.number().min(1, 'Pick a rating').max(5),
  review: z.string().trim().min(1, 'Write a short review'),
});

export type CreateRatingPayload = z.infer<typeof createRatingSchema>;
