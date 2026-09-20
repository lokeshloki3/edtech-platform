// zod-validations/contact.validation.ts
import { z } from 'zod';

export const contactUsSchema = z.object({
  firstname: z.string().trim().min(1, 'First name is required'),
  lastname: z.string().trim().optional(),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  countrycode: z.string().min(1, 'Select a country code'),
  phoneNo: z
    .string()
    .trim()
    .min(10, 'Enter a valid phone number')
    .max(12, 'Enter a valid phone number'),
  message: z.string().trim().min(1, 'Message is required'),
});

export type ContactUsPayload = z.infer<typeof contactUsSchema>;
