import {useEffect, useState} from 'react';

const getBasePath = (): string => {
  const pathname = new URL(document.baseURI).pathname.replace(/\/$/, '');
  return pathname === '/' ? '' : pathname;
};

// Routes stay application-relative (/lessons, /lessons/<id>) while the
// browser URL stays inside the GitHub Pages project path (/LogicLabs/).
export const getPath = (): string => {
  const basePath = getBasePath();
  const pathname = window.location.pathname;
  if (!basePath || !pathname.startsWith(basePath)) {
    return pathname;
  }
  return pathname.slice(basePath.length) || '/';
};

export const navigate = (path: string): void => {
  const basePath = getBasePath();
  const route = path.startsWith('/') ? path : `/${path}`;
  window.history.pushState({}, '', `${basePath}${route}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const usePath = (): string => {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onChange = () => setPath(getPath());
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  return path;
};

export const matchLessonPath = (path: string): string | null => {
  const match = path.match(/^\/lessons\/([a-z0-9-]+)\/?$/);
  return match ? match[1] : null;
};
