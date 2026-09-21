// services/payment.service.ts
import axiosClient from '@/lib/axiosClient';
import { handleClientAxiosError } from '@/lib/handleClientAxiosError';
import type { ApiEnvelope } from '@/types/api.types';
import type {
  CapturePaymentResponse,
  RazorpayOrder,
  VerifyPaymentPayload,
} from '@/types/payment.types';

export async function capturePayment(courses: string[]): Promise<RazorpayOrder> {
  try {
    const response = await axiosClient.post<CapturePaymentResponse>('/payment/capturePayment', {
      courses,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not start payment');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not start payment');
  }
}

export async function verifyPayment(payload: VerifyPaymentPayload): Promise<ApiEnvelope> {
  try {
    const response = await axiosClient.post<ApiEnvelope>('/payment/verifyPayment', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not verify payment');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not verify payment');
  }
}

// Best-effort: a failed receipt email must not surface as a failed purchase,
// since the payment has already been verified by the time this runs.
export async function sendPaymentSuccessEmail(payload: {
  orderId: string;
  paymentId: string;
  amount: number;
}): Promise<void> {
  try {
    await axiosClient.post('/payment/sendPaymentSuccessEmail', payload);
  } catch {
    // intentionally ignored
  }
}
