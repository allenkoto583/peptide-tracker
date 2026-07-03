import { useEffect, useState } from "react";

// A drop-in replacement for React's useState that ALSO saves the value to the
// browser's localStorage, so your stack survives closing and reopening the app.
//
// `key` names the storage slot; everything in this app is namespaced with a
// "peptide:" prefix so it can't collide with other sites' data.
export function useLocalStorageState(key, initialValue) {
  const storageKey = `peptide:${key}`;

  // On first render, try to load a previously saved value.
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue; // storage unavailable or corrupt — fall back
    }
  });

  // Whenever the value changes, write it back to storage.
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // storage full or blocked — ignore for now
    }
  }, [storageKey, value]);

  return [value, setValue];
}
