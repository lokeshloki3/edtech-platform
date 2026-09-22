// hooks/use-profile-query.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { showCustomSuccessToast } from '@/lib/customToastHelper';
import { handleMutationError } from '@/lib/handleMutationError';
import {
  changePassword,
  deleteProfile,
  updateDisplayPicture,
  updateProfile,
} from '@/services/settings.service';
import { getEnrolledCourses, getInstructorData } from '@/services/profile.service';
import { authKeys } from '@/hooks/use-auth-query';
import { useAuthStore } from '@/store/auth.store';
import type { ApiEnvelope } from '@/types/api.types';
import type { AuthUser } from '@/types/auth.types';
import type { EnrolledCourse, InstructorCourseStat } from '@/types/course.types';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from '@/zod-validations/settings.validation';

export const profileKeys = {
  all: ['profile'] as const,
  enrolledCourses: () => [...profileKeys.all, 'enrolled-courses'] as const,
  instructorData: () => [...profileKeys.all, 'instructor-data'] as const,
};

export const profileToasts = {
  updateDisplayPictureSuccess: () =>
    showCustomSuccessToast({ message: 'Display picture updated successfully' }),
  updateProfileSuccess: () => showCustomSuccessToast({ message: 'Profile updated successfully' }),
  changePasswordSuccess: () => showCustomSuccessToast({ message: 'Password changed successfully' }),
  deleteProfileSuccess: (message?: string) =>
    showCustomSuccessToast({ message: message || 'Profile deleted' }),
};

export function useEnrolledCourses(enabled = true) {
  return useQuery<EnrolledCourse[]>({
    queryKey: profileKeys.enrolledCourses(),
    queryFn: getEnrolledCourses,
    enabled,
  });
}

export function useInstructorData(enabled = true) {
  return useQuery<InstructorCourseStat[]>({
    queryKey: profileKeys.instructorData(),
    queryFn: getInstructorData,
    enabled,
  });
}

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
      profileToasts.updateDisplayPictureSuccess();
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
      profileToasts.updateProfileSuccess();
    },
    onError: (err) => handleMutationError(err, 'Could not update profile'),
  });
}

export function useChangePassword() {
  return useMutation<ApiEnvelope, Error, ChangePasswordPayload>({
    mutationFn: (payload) => changePassword(payload),
    onSuccess: () => profileToasts.changePasswordSuccess(),
    onError: (err) => handleMutationError(err, 'Could not change password'),
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.logout);

  return useMutation<ApiEnvelope, Error, void>({
    mutationFn: () => deleteProfile(),
    onSuccess: (data) => {
      profileToasts.deleteProfileSuccess(data.message);
      clearAuth();
      queryClient.clear();
    },
    onError: (err) => handleMutationError(err, 'Could not delete profile'),
  });
}
