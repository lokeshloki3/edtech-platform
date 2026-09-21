// types/payment.types.ts
export interface RazorpayOrder {
  id: string;
  currency: string;
  amount: number;
}

/** What the Razorpay checkout handler hands back on a successful payment. */
export interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentPayload extends RazorpayHandlerResponse {
  courses: string[];
}

export interface RazorpayOptions {
  key: string;
  currency: string;
  amount: string;
  order_id: string;
  name: string;
  description: string;
  image: string;
  prefill: { name: string; email: string };
  handler: (response: RazorpayHandlerResponse) => void;
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
