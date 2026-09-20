// store/auth.store.ts
import { create } from 'zustand';

import type { AuthUser } from '@/types/auth.types';
import type { SignupFormPayload } from '@/zod-validations/auth.validation';

// Not persisted: the session is the httpOnly cookie, and useCurrentUser()
// rehydrates the user from the server on load. signupData holds a plaintext
// password on its way to /verify-email, so it stays in memory only.

export type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  signupData: SignupFormPayload | null;

  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  setSignupData: (data: SignupFormPayload | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'pending',
  signupData: null,

  setUser: (user) =>
    set({
      user,
      status: user ? 'authenticated' : 'unauthenticated',
    }),

  setStatus: (status) => set({ status }),

  setSignupData: (signupData) => set({ signupData }),

  logout: () => set({ user: null, status: 'unauthenticated', signupData: null }),
}));

export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.status === 'authenticated';
export const selectAuthStatus = (s: AuthState) => s.status;
