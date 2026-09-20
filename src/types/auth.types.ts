// types/auth.types.ts

// The Express API wraps responses as { success, message, ...payload } rather
// than the { status, message, data } envelope the BFF-backed apps return.
// Services check this shape and unwrap to a plain domain object.
export interface ApiEnvelope {
  success: boolean;
  message: string;
}

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
  // Echoed alongside the httpOnly cookie only for the legacy auth bridge.
  // Drop from the server response once the last Bearer call site is migrated.
  token: string;
  user: AuthUser;
}

export interface GetUserDetailsResponse extends ApiEnvelope {
  data: AuthUser;
}

export type LogoutResponse = ApiEnvelope;

export type ResetPasswordTokenResponse = ApiEnvelope;

export type ResetPasswordResponse = ApiEnvelope;
