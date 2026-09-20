// store/legacy-auth-bridge.ts
import { store } from '@/reducer/store';
import { setToken } from '@/slices/authSlice';
import { setUser } from '@/slices/profileSlice';
import type { AuthUser } from '@/types/auth.types';

// TRANSITIONAL - delete when no screen reads state.auth.token or
// state.profile.user from Redux any more. Until then the auth domain mirrors
// every transition into Redux + localStorage so the ~40 unmigrated components
// that send a Bearer header keep working. The server accepts either credential
// (see server/middlewares/auth.js), which is what makes running both safe.

export function syncLegacyAuth({ token, user }: { token?: string; user?: AuthUser | null }) {
  if (token) {
    localStorage.setItem('token', JSON.stringify(token));
    store.dispatch(setToken(token));
  }

  if (user !== undefined) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    store.dispatch(setUser(user));
  }
}

export function clearLegacyAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  store.dispatch(setToken(null));
  store.dispatch(setUser(null));
}
