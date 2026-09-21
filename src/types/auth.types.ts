// types/auth.types.ts
import type { ApiEnvelope } from '@/types/api.types';

export type AccountType = 'Admin' | 'Student' | 'Instructor';

export interface Profile {
  _id: string;
  gender: string | null;
  dateOfBirth: string | null;
  about: string | null;
  contactNumber: number | null;
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: AccountType;
  active: boolean;
  approved: boolean;
  image: string;
  additionalDetails: Profile;
  courses: string[];
  courseProgress: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SendOtpResponse extends ApiEnvelope {
  data?: unknown;
}

export interface SignupResponse extends ApiEnvelope {
  user: AuthUser;
}

export interface LoginResponse extends ApiEnvelope {
  user: AuthUser;
}

export interface GetUserDetailsResponse extends ApiEnvelope {
  data: AuthUser;
}

export interface UpdateDisplayPictureResponse extends ApiEnvelope {
  data: AuthUser;
}

/** `updateProfile` answers under `updatedUserDetails` rather than `data`. */
export interface UpdateProfileResponse extends ApiEnvelope {
  updatedUserDetails: AuthUser;
}

export type LogoutResponse = ApiEnvelope;

export type ResetPasswordTokenResponse = ApiEnvelope;

export type ResetPasswordResponse = ApiEnvelope;
