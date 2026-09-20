// lib/handleClientAxiosError.ts
import axios from 'axios';

/** Carries the HTTP status so retry predicates can still see it after unwrapping. */
export class ClientRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ClientRequestError';
    this.status = status;
  }
}

export function handleClientAxiosError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    throw new ClientRequestError(
      error.response?.data?.message || fallbackMessage,
      error.response?.status
    );
  }

  if (error instanceof Error) {
    throw new ClientRequestError(error.message || fallbackMessage);
  }

  throw new ClientRequestError(fallbackMessage);
}
