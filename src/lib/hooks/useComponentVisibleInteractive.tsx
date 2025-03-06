// Adapted from https://stackoverflow.com/a/45323523

import { useEffect, useRef, useCallback } from "react";

export default function useComponentVisibleInteractive<T extends HTMLElement>(
  customBehavior: () => void,
) {
  const ref = useRef<T>(null);
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (ref.current && !ref.current.contains(target)) {
        customBehavior();
      }
    },
    [customBehavior],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [handleClickOutside]);

  return ref;
}
