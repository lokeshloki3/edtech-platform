import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/store/auth.store';

// Waits for the session like PrivateRoute, so the form does not flash for
// a logged-in user landing on /login directly.
const OpenRoute = ({ children }: { children: ReactNode }) => {
  const status = useAuthStore((s) => s.status);

  if (status === 'pending') {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard/my-profile" replace />;
  }

  return children;
};

export default OpenRoute;
