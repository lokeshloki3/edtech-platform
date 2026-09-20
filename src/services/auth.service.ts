// services/auth.service.ts
import axiosClient from '@/lib/axiosClient';
import { handleClientAxiosError } from '@/lib/handleClientAxiosError';
import type {
  AuthUser,
  GetUserDetailsResponse,
  LoginResponse,
  LogoutResponse,
  ResetPasswordResponse,
  ResetPasswordTokenResponse,
  SendOtpResponse,
  SignupResponse,
} from '@/types/auth.types';
import type {
  LoginPayload,
  ResetPasswordPayload,
  ResetPasswordTokenPayload,
  SendOtpPayload,
  SignupPayload,
} from '@/zod-validations/auth.validation';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await axiosClient.post<LoginResponse>('/auth/login', payload);

    if (!response.data.success || !response.data.token) {
      throw new Error(response.data.message || 'Login failed');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Login failed, please try again');
  }
}

export async function sendOtp(payload: SendOtpPayload): Promise<SendOtpResponse> {
  try {
    const response = await axiosClient.post<SendOtpResponse>('/auth/sendotp', {
      ...payload,
      checkUserPresent: true,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not send OTP');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not send OTP');
  }
}

export async function signup(payload: SignupPayload): Promise<AuthUser> {
  try {
    const response = await axiosClient.post<SignupResponse>('/auth/signup', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Signup failed');
    }

    return response.data.user;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Signup failed, please try again');
  }
}

// The session's source of truth: with the JWT in an httpOnly cookie the client
// cannot inspect it, so who is logged in is answered by asking the server.
export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const response = await axiosClient.get<GetUserDetailsResponse>('/profile/getUserDetails');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not fetch user details');
    }

    return response.data.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not fetch user details');
  }
}

export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await axiosClient.post<LogoutResponse>('/auth/logout');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Logout failed');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Logout failed');
  }
}

export async function requestPasswordResetToken(
  payload: ResetPasswordTokenPayload
): Promise<ResetPasswordTokenResponse> {
  try {
    const response = await axiosClient.post<ResetPasswordTokenResponse>(
      '/auth/reset-password-token',
      payload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send reset email');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Failed to send reset email');
  }
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
  try {
    const response = await axiosClient.post<ResetPasswordResponse>('/auth/reset-password', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reset password');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Failed to reset password');
  }
}
