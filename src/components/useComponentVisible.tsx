// Adapted from https://stackoverflow.com/a/45323523

import { useEffect, useRef } from 'react';

export default function useComponentVisible<T extends HTMLElement>(customBehavior: () => void) {
    const ref = useRef<T>(null);
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (ref.current && !ref.current.contains(target)) {
        customBehavior();
      }
    };

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }, []);

    return ref;
}