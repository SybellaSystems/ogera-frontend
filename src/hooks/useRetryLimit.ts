import { useState, useEffect, useCallback } from "react";

interface RetryLimitState {
  attempts: number;
  lockedUntil: number | null;
}

interface UseRetryLimitReturn {
  attempts: number;
  maxAttempts: number;
  isLocked: boolean;
  lockRemainingSeconds: number;
  recordAttempt: () => boolean;
  resetAttempts: () => void;
}

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 3;

const getStorageKey = (key: string) => `retry_limit_${key}`;

const loadState = (key: string): RetryLimitState => {
  try {
    const raw = localStorage.getItem(getStorageKey(key));
    if (!raw) return { attempts: 0, lockedUntil: null };
    const parsed = JSON.parse(raw) as RetryLimitState;

    // Self-heal: clear expired lockouts
    if (parsed.lockedUntil && parsed.lockedUntil <= Date.now()) {
      localStorage.removeItem(getStorageKey(key));
      return { attempts: 0, lockedUntil: null };
    }

    return parsed;
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
};

const saveState = (key: string, state: RetryLimitState) => {
  localStorage.setItem(getStorageKey(key), JSON.stringify(state));
};

export const useRetryLimit = (key: string): UseRetryLimitReturn => {
  const [state, setState] = useState<RetryLimitState>(() => loadState(key));
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);

  const isLocked = state.lockedUntil !== null && state.lockedUntil > Date.now();

  // Countdown timer while locked
  useEffect(() => {
    if (!state.lockedUntil) {
      setLockRemainingSeconds(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((state.lockedUntil! - Date.now()) / 1000));
      setLockRemainingSeconds(remaining);

      if (remaining <= 0) {
        // Lockout expired — reset
        const newState = { attempts: 0, lockedUntil: null };
        setState(newState);
        saveState(key, newState);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [state.lockedUntil, key]);

  const recordAttempt = useCallback((): boolean => {
    if (isLocked) return false;

    const newAttempts = state.attempts + 1;
    const newLockedUntil =
      newAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;

    const newState: RetryLimitState = {
      attempts: newAttempts,
      lockedUntil: newLockedUntil,
    };

    setState(newState);
    saveState(key, newState);
    return true;
  }, [isLocked, state.attempts, key]);

  const resetAttempts = useCallback(() => {
    const newState: RetryLimitState = { attempts: 0, lockedUntil: null };
    setState(newState);
    localStorage.removeItem(getStorageKey(key));
  }, [key]);

  return {
    attempts: state.attempts,
    maxAttempts: MAX_ATTEMPTS,
    isLocked,
    lockRemainingSeconds,
    recordAttempt,
    resetAttempts,
  };
};
