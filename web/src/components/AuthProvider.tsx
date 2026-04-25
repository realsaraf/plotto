"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onIdTokenChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
      try {
        const idToken = await firebaseUser.getIdToken();
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      } catch {
        // Non-fatal — cookie sync failed, but user is still signed in client-side.
      }
    } else {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // Non-fatal.
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await syncSession(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [syncSession]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    // syncSession(null) is called automatically via onIdTokenChanged
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access the current auth state anywhere in the client tree. */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
