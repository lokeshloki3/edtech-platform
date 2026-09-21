// hooks/use-contact-query.ts
import { useMutation } from '@tanstack/react-query';

import { showCustomSuccessToast } from '@/lib/customToastHelper';
import { handleMutationError } from '@/lib/handleMutationError';
import { submitContactForm } from '@/services/contact.service';
import type { ApiEnvelope } from '@/types/api.types';
import type { ContactUsPayload } from '@/zod-validations/contact.validation';

export function useSubmitContactForm() {
  return useMutation<ApiEnvelope, Error, ContactUsPayload>({
    mutationFn: (payload) => submitContactForm(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'Message sent successfully' }),
    onError: (err) => handleMutationError(err, 'Could not send your message'),
  });
}
