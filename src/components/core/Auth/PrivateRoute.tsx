import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/auth.store';

// On a hard refresh the client does not know yet whether there is a session:
// the JWT is httpOnly, so status stays pending until useCurrentUser() answers.
// Redirecting during that window would bounce every logged-in user to /login.
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'pending') {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    const from = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?from=${from}`} replace />;
  }

  return children;
};

export default PrivateRoute;
