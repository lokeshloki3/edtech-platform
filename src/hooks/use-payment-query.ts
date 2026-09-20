// hooks/use-payment-query.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import rzpLogo from '@/assets/Logo/rzp_Logo.png';
import { showCustomSuccessToast } from '@/lib/customToastHelper';
import { handleMutationError } from '@/lib/handleMutationError';
import { loadRazorpayScript } from '@/lib/razorpay';
import { profileKeys } from '@/hooks/use-profile-query';
import { capturePayment, sendPaymentSuccessEmail, verifyPayment } from '@/services/payment.service';
import { resetCart } from '@/slices/cartSlice';
import { useAuthStore } from '@/store/auth.store';
import type { RazorpayHandlerResponse } from '@/types/payment.types';

/**
 * Drives the whole Razorpay purchase: order, checkout, verification, receipt.
 * Checkout is a callback API rather than a promise, so the mutation resolves
 * once the popup is open and the verification runs from the handler.
 */
export function useBuyCourse() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation<void, Error, string[]>({
    mutationFn: async (courses) => {
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      const order = await capturePayment(courses);

      const checkout = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY,
        currency: order.currency,
        amount: String(order.amount),
        order_id: order.id,
        name: 'StudySphere',
        description: 'Thank you for Purchasing the Course',
        image: rzpLogo,
        prefill: {
          name: user?.firstName ?? '',
          email: user?.email ?? '',
        },
        handler: async (response: RazorpayHandlerResponse) => {
          void sendPaymentSuccessEmail({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount: order.amount,
          });

          try {
            await verifyPayment({ ...response, courses });

            showCustomSuccessToast({
              message: 'Payment successful, you are added to the course',
            });
            dispatch(resetCart());
            queryClient.invalidateQueries({ queryKey: profileKeys.enrolledCourses() });
            navigate('/dashboard/enrolled-courses');
          } catch (err) {
            handleMutationError(err, 'Could not verify payment');
          }
        },
      });

      checkout.on('payment.failed', () => {
        handleMutationError(new Error('Payment failed'), 'Payment failed');
      });

      checkout.open();
    },
    onError: (err) => handleMutationError(err, 'Could not make payment'),
  });
}
