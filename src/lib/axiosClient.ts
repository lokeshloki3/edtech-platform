// lib/axiosClient.ts
import axios from 'axios';

import { useAuthStore } from '@/store/auth.store';

// No /api BFF hop: the Express server in server/ is this app's own backend.
// withCredentials carries the httpOnly `token` cookie, which is the session.
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

const PROTECTED_PATHS = ['/dashboard', '/view-course'];

// Sign-in is the one place a 401 means "wrong credentials" rather than "the
// session ended" - there is no session to tear down yet.
const CREDENTIAL_CHECK_PATHS = ['/auth/login'];

const isCredentialCheck = (url?: string) =>
  !!url && CREDENTIAL_CHECK_PATHS.some((p) => url.startsWith(p));

// There is no refresh endpoint on this API, so a 401 is terminal: clear local
// auth state, and only bounce to /login if the user is on a protected page.
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !isCredentialCheck(error.config?.url)) {
      useAuthStore.getState().logout();

      if (typeof window !== 'undefined') {
        const { pathname, search } = window.location;
        const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

        if (isProtected) {
          const from = encodeURIComponent(pathname + search);
          window.location.href = '/login?from=' + from;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
