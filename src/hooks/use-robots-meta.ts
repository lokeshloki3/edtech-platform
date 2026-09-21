import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { INDEXABLE, isDisallowedPath, isStaging, NOT_INDEXABLE } from '@/lib/seo/robots';

export const useRobotsMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const blocked = isStaging(import.meta.env.VITE_STAGING) || isDisallowedPath(pathname);

    let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');

    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'robots';
      document.head.appendChild(tag);
    }

    tag.content = blocked ? NOT_INDEXABLE : INDEXABLE;
  }, [pathname]);
};
