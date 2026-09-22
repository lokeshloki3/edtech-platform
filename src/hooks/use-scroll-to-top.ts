import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** React Router keeps the scroll offset across navigations; reset it, but leave #hash links alone. */
export const useScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;

    window.scrollTo(0, 0);
  }, [pathname, hash]);
};
