"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

export interface TimerRegistry {
  /**
   * Schedule a timeout under a named key. If a timer with the same key
   * is already pending, it is cancelled before scheduling the new one.
   */
  schedule: (key: string, fn: () => void, ms: number) => void;
  /**
   * Cancel a pending timer by key if one exists.
   */
  clear: (key: string) => void;
  /**
   * Cancel all pending timers registered with this instance.
   */
  clearAll: () => void;
  /**
   * Check whether a timer with the given key is currently pending.
   */
  isPending: (key: string) => boolean;
}

/**
 * Centralized keyed timeout registry that automatically cancels overwritten keys
 * and cleans up all active timers when the owning component unmounts.
 */
export function useTimerRegistry(): TimerRegistry {
  const timersRef = useRef<Map<string, number>>(new Map());
  const mountedRef = useRef(true);

  const clear = useCallback((key: string) => {
    const existing = timersRef.current.get(key);
    if (existing !== undefined) {
      window.clearTimeout(existing);
      timersRef.current.delete(key);
    }
  }, []);

  const clearAll = useCallback(() => {
    timersRef.current.forEach((id) => {
      window.clearTimeout(id);
    });
    timersRef.current.clear();
  }, []);

  const schedule = useCallback(
    (key: string, fn: () => void, ms: number) => {
      clear(key);
      const id = window.setTimeout(() => {
        timersRef.current.delete(key);
        if (!mountedRef.current) return;
        fn();
      }, ms);
      timersRef.current.set(key, id);
    },
    [clear],
  );

  const isPending = useCallback((key: string) => {
    return timersRef.current.has(key);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const map = timersRef.current;
    return () => {
      mountedRef.current = false;
      map.forEach((id) => {
        window.clearTimeout(id);
      });
      map.clear();
    };
  }, []);

  return useMemo(
    () => ({
      schedule,
      clear,
      clearAll,
      isPending,
    }),
    [schedule, clear, clearAll, isPending],
  );
}
