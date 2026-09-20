// services/contact.service.ts
import axiosClient from '@/lib/axiosClient';
import { handleClientAxiosError } from '@/lib/handleClientAxiosError';
import type { ApiEnvelope } from '@/types/auth.types';
import type { ContactUsPayload } from '@/zod-validations/contact.validation';

export async function submitContactForm(payload: ContactUsPayload): Promise<ApiEnvelope> {
  try {
    const response = await axiosClient.post<ApiEnvelope>('/reach/contact', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not send your message');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not send your message');
  }
}
