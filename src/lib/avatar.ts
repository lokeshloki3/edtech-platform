import type { AuthUser } from '@/types/auth.types';

// Users created before an avatar upload have no image, so the server's value
// can be empty. The generated initials avatar is what the old profile thunks
// substituted inline; keeping it here means every caller gets it.
export function withAvatarFallback<T extends Pick<AuthUser, 'image' | 'firstName' | 'lastName'>>(
  user: T
): T {
  if (user.image) {
    return user;
  }

  const seed = encodeURIComponent(user.firstName + ' ' + user.lastName);

  return {
    ...user,
    image: 'https://api.dicebear.com/5.x/initials/svg?seed=' + seed,
  };
}
