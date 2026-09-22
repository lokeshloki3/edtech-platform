// hooks/use-auth-query.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { showCustomSuccessToast } from '@/lib/customToastHelper';
import { handleMutationError } from '@/lib/handleMutationError';
import {
  getCurrentUser,
  login,
  logout,
  requestPasswordResetToken,
  resetPassword,
  sendOtp,
  signup,
} from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type { ApiEnvelope } from '@/types/api.types';
import type { AuthUser } from '@/types/auth.types';
import type {
  LoginPayload,
  ResetPasswordPayload,
  ResetPasswordTokenPayload,
  SendOtpPayload,
  SignupPayload,
} from '@/zod-validations/auth.validation';

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'current-user'] as const,
};

export const authToasts = {
  loginSuccess: () => showCustomSuccessToast({ message: 'Logged in successfully' }),
  logoutSuccess: (message?: string) => showCustomSuccessToast({ message: message || 'Logged out' }),
  sendOtpSuccess: () => showCustomSuccessToast({ message: 'OTP sent successfully' }),
  resendOtpSuccess: () => showCustomSuccessToast({ message: 'OTP resent, check your inbox' }),
  signupSuccess: () => showCustomSuccessToast({ message: 'Signup successful' }),
  resetEmailSuccess: () =>
    showCustomSuccessToast({ message: 'Reset email sent, check your inbox' }),
  resetPasswordSuccess: () => showCustomSuccessToast({ message: 'Password reset successfully' }),
};

// The session is checked once on load and outlives an ordinary query, so it is
// held longer than the global default. Not retrying or toasting a 401 already
// comes from that default, so it is not repeated here.
export function useCurrentUser() {
  return useQuery<AuthUser>({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<AuthUser, Error, LoginPayload>({
    mutationFn: (payload) => login(payload),
    onSuccess: (user) => {
      // Set here, not left to AuthInitializer's effect: callers navigate to a
      // private route from their own onSuccess, which runs after this one.
      setUser(user);
      queryClient.setQueryData(authKeys.currentUser(), user);
      authToasts.loginSuccess();
    },
    onError: (err) => handleMutationError(err, 'Login failed, please try again'),
  });
}

export function useSendOtp() {
  return useMutation<ApiEnvelope, Error, SendOtpPayload>({
    mutationFn: (payload) => sendOtp(payload),
    onSuccess: () => authToasts.sendOtpSuccess(),
    onError: (err) => handleMutationError(err, 'Could not send OTP'),
  });
}

export function useResendOtp() {
  return useMutation<ApiEnvelope, Error, SendOtpPayload>({
    mutationFn: (payload) => sendOtp(payload),
    onSuccess: () => authToasts.resendOtpSuccess(),
    onError: (err) => handleMutationError(err, 'Could not resend OTP'),
  });
}

export function useSignup() {
  const setSignupData = useAuthStore((s) => s.setSignupData);

  return useMutation<AuthUser, Error, SignupPayload>({
    mutationFn: (payload) => signup(payload),
    onSuccess: () => {
      setSignupData(null);
      authToasts.signupSuccess();
    },
    onError: (err) => handleMutationError(err, 'Signup failed, please try again'),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.logout);

  return useMutation<ApiEnvelope, Error, void>({
    mutationFn: () => logout(),
    onSuccess: (data) => authToasts.logoutSuccess(data.message),
    onError: (err) => handleMutationError(err, 'Logout failed'),
    // A failed logout call must not strand the user in a half-authenticated UI.
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

export function useRequestPasswordResetToken() {
  return useMutation<ApiEnvelope, Error, ResetPasswordTokenPayload>({
    mutationFn: (payload) => requestPasswordResetToken(payload),
    onSuccess: () => authToasts.resetEmailSuccess(),
    onError: (err) => handleMutationError(err, 'Failed to send reset email'),
  });
}

export function useResetPassword() {
  return useMutation<ApiEnvelope, Error, ResetPasswordPayload>({
    mutationFn: (payload) => resetPassword(payload),
    onSuccess: () => authToasts.resetPasswordSuccess(),
    onError: (err) => handleMutationError(err, 'Failed to reset password'),
  });
}
