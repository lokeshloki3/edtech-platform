// lib/customToastHelper.ts
import { toast } from 'sonner';

export function showCustomSuccessToast({ message }: { message: string }) {
  toast.success(message);
}

export function showCustomErrorToast({ message }: { message: string }) {
  toast.error(message);
}
