'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from './client';

type FirebaseCtx = {
  auth: typeof auth;
  firestore: typeof firestore;
  user: User | null;
  isUserLoading: boolean;
};

const FirebaseContext = createContext<FirebaseCtx | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsUserLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({ auth, firestore, user, isUserLoading }),
    [user, isUserLoading],
  );

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useFirebase must be used within a FirebaseProvider.');
  return ctx;
}

export function useUser() {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
}
