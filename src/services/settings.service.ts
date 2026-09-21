// services/settings.service.ts
import axiosClient from '@/lib/axiosClient';
import { handleClientAxiosError } from '@/lib/handleClientAxiosError';
import type { ApiEnvelope } from '@/types/api.types';
import type {
  AuthUser,
  UpdateDisplayPictureResponse,
  UpdateProfileResponse,
} from '@/types/auth.types';
import { withAvatarFallback } from '@/lib/avatar';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from '@/zod-validations/settings.validation';

export async function updateDisplayPicture(file: File): Promise<AuthUser> {
  try {
    const formData = new FormData();
    formData.append('displayPicture', file);

    const response = await axiosClient.put<UpdateDisplayPictureResponse>(
      '/profile/updateDisplayPicture',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not update display picture');
    }

    return withAvatarFallback(response.data.data);
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not update display picture');
  }
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  try {
    const response = await axiosClient.put<UpdateProfileResponse>(
      '/profile/updateProfile',
      payload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not update profile');
    }

    return withAvatarFallback(response.data.updatedUserDetails);
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not update profile');
  }
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ApiEnvelope> {
  try {
    const response = await axiosClient.post<ApiEnvelope>('/auth/changepassword', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not change password');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not change password');
  }
}

export async function deleteProfile(): Promise<ApiEnvelope> {
  try {
    const response = await axiosClient.delete<ApiEnvelope>('/profile/deleteProfile');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete profile');
    }

    return response.data;
  } catch (err: unknown) {
    return handleClientAxiosError(err, 'Could not delete profile');
  }
}
