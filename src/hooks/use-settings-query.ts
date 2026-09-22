// hooks/use-settings-query.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showCustomSuccessToast } from '@/lib/customToastHelper';
import { handleMutationError } from '@/lib/handleMutationError';
import {
  changePassword,
  deleteProfile,
  updateDisplayPicture,
  updateProfile,
} from '@/services/settings.service';
import { authKeys } from '@/hooks/use-auth-query';
import { useAuthStore } from '@/store/auth.store';
import type { ApiEnvelope } from '@/types/api.types';
import type { AuthUser } from '@/types/auth.types';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from '@/zod-validations/settings.validation';

export const settingsToasts = {
  updateDisplayPictureSuccess: () =>
    showCustomSuccessToast({ message: 'Display picture updated successfully' }),
  updateProfileSuccess: () => showCustomSuccessToast({ message: 'Profile updated successfully' }),
  changePasswordSuccess: () => showCustomSuccessToast({ message: 'Password changed successfully' }),
  deleteProfileSuccess: (message?: string) =>
    showCustomSuccessToast({ message: message || 'Profile deleted' }),
};

// The updated user comes back on the response, so the cached current user is
// written directly rather than invalidated and refetched.
function useApplyUpdatedUser() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return (user: AuthUser) => {
    setUser(user);
    queryClient.setQueryData(authKeys.currentUser(), user);
  };
}

export function useUpdateDisplayPicture() {
  const applyUpdatedUser = useApplyUpdatedUser();

  return useMutation<AuthUser, Error, File>({
    mutationFn: (file) => updateDisplayPicture(file),
    onSuccess: (user) => {
      applyUpdatedUser(user);
      settingsToasts.updateDisplayPictureSuccess();
    },
    onError: (err) => handleMutationError(err, 'Could not update display picture'),
  });
}

export function useUpdateProfile() {
  const applyUpdatedUser = useApplyUpdatedUser();

  return useMutation<AuthUser, Error, UpdateProfilePayload>({
    mutationFn: (payload) => updateProfile(payload),
    onSuccess: (user) => {
      applyUpdatedUser(user);
      settingsToasts.updateProfileSuccess();
    },
    onError: (err) => handleMutationError(err, 'Could not update profile'),
  });
}

export function useChangePassword() {
  return useMutation<ApiEnvelope, Error, ChangePasswordPayload>({
    mutationFn: (payload) => changePassword(payload),
    onSuccess: () => settingsToasts.changePasswordSuccess(),
    onError: (err) => handleMutationError(err, 'Could not change password'),
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.logout);

  return useMutation<ApiEnvelope, Error, void>({
    mutationFn: () => deleteProfile(),
    onSuccess: (data) => {
      settingsToasts.deleteProfileSuccess(data.message);
      clearAuth();
      queryClient.clear();
    },
    onError: (err) => handleMutationError(err, 'Could not delete profile'),
  });
}
