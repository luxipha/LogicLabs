import {useEffect, useState} from 'react';

export const getPath = (): string => window.location.pathname;

export const navigate = (path: string): void => {
  window.history.pushState({}, '', path);
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
