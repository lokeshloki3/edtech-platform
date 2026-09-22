// lib/handleMutationError.ts
import { toast } from 'sonner';

export function handleMutationError(err: unknown, fallbackMessage: string) {
  const message = err instanceof Error ? err.message : fallbackMessage;
  toast.error(message);
  return message;
}
