// zod-validations/auth.validation.ts
import { z } from 'zod';

// With no BFF route to safeParse in, these schemas are the client-side
// contract: consumed by react-hook-form and used to type each mutation input.
// The server keeps its own validation.

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password must be at most 64 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const sendOtpSchema = z.object({
  email: emailSchema,
});

export type SendOtpPayload = z.infer<typeof sendOtpSchema>;

export const accountTypeSchema = z.enum(['Student', 'Instructor']);

export const signupFormSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    accountType: accountTypeSchema,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormPayload = z.infer<typeof signupFormSchema>;

// The OTP is collected on /verify-email, so it is appended to the stored form
// payload rather than being part of the form schema.
export const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm your password'),
  accountType: accountTypeSchema,
  otp: z.string().trim().length(6, 'Enter the 6-digit OTP'),
});

export type SignupPayload = z.infer<typeof signupSchema>;

export const resetPasswordTokenSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordTokenPayload = z.infer<typeof resetPasswordTokenSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormPayload = z.infer<typeof resetPasswordFormSchema>;

// The reset token comes from the URL, not the form.
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm your password'),
  token: z.string().min(1, 'Reset token is missing'),
});

export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
