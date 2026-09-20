// hooks/use-auth-query.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { showCustomSuccessToast } from '@/lib/customToastHelper';
import { handleMutationError } from '@/lib/handleMutationError';
import { retryUnlessAuth } from '@/lib/queryRetry';
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
import { clearLegacyAuth, syncLegacyAuth } from '@/store/legacy-auth-bridge';
import type {
  AuthUser,
  LoginResponse,
  LogoutResponse,
  ResetPasswordResponse,
  ResetPasswordTokenResponse,
  SendOtpResponse,
} from '@/types/auth.types';
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

// A 401 here just means not logged in, so it is never retried or toasted.
export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery<AuthUser>({
    queryKey: authKeys.currentUser(),
    queryFn: async () => {
      const user = await getCurrentUser();
      setUser(user);
      syncLegacyAuth({ user });
      return user;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: retryUnlessAuth(1),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload) => login(payload),
    onSuccess: (data) => {
      setUser(data.user);
      syncLegacyAuth({ token: data.token, user: data.user });
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      showCustomSuccessToast({ message: data.message || 'Logged in successfully' });
    },
    onError: (err) => handleMutationError(err, 'Login failed, please try again'),
  });
}

export function useSendOtp() {
  return useMutation<SendOtpResponse, Error, SendOtpPayload>({
    mutationFn: (payload) => sendOtp(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'OTP sent successfully' }),
    onError: (err) => handleMutationError(err, 'Could not send OTP'),
  });
}

export function useSignup() {
  const setSignupData = useAuthStore((s) => s.setSignupData);

  return useMutation<AuthUser, Error, SignupPayload>({
    mutationFn: (payload) => signup(payload),
    onSuccess: () => {
      setSignupData(null);
      showCustomSuccessToast({ message: 'Signup successful' });
    },
    onError: (err) => handleMutationError(err, 'Signup failed, please try again'),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.logout);

  return useMutation<LogoutResponse, Error, void>({
    mutationFn: () => logout(),
    onSuccess: (data) => {
      showCustomSuccessToast({ message: data.message || 'Logged out' });
    },
    onError: (err) => handleMutationError(err, 'Logout failed'),
    // A failed logout call must not strand the user in a half-authenticated UI.
    onSettled: () => {
      clearAuth();
      clearLegacyAuth();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

export function useRequestPasswordResetToken() {
  return useMutation<ResetPasswordTokenResponse, Error, ResetPasswordTokenPayload>({
    mutationFn: (payload) => requestPasswordResetToken(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'Reset email sent, check your inbox' }),
    onError: (err) => handleMutationError(err, 'Failed to send reset email'),
  });
}

export function useResetPassword() {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordPayload>({
    mutationFn: (payload) => resetPassword(payload),
    onSuccess: () => showCustomSuccessToast({ message: 'Password reset successfully' }),
    onError: (err) => handleMutationError(err, 'Failed to reset password'),
  });
}
