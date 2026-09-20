// zod-validations/settings.validation.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  dateOfBirth: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  contactNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{8,12}$/, 'Enter a valid contact number')
    .optional()
    .or(z.literal('')),
  about: z.string().trim().max(500, 'Keep it under 500 characters').optional(),
});

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be at most 64 characters'),
    confirmNewPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;
