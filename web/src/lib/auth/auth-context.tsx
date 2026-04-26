"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase/client";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendSignInLinkToEmail,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ hasHandle: boolean }>;
  signInWithApple: () => Promise<{ hasHandle: boolean }>;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function createSession(user: User): Promise<{ hasHandle: boolean }> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Session creation failed");
  const data = (await res.json()) as { ok: boolean; hasHandle: boolean };
  return { hasHandle: data.hasHandle ?? false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async (): Promise<{ hasHandle: boolean }> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return createSession(result.user);
  };

  const signInWithApple = async (): Promise<{ hasHandle: boolean }> => {
    const provider = new OAuthProvider("apple.com");
    const result = await signInWithPopup(auth, provider);
    return createSession(result.user);
  };

  const sendMagicLink = async (email: string): Promise<void> => {
    await sendSignInLinkToEmail(auth, email, {
      url: `${window.location.origin}/auth/finish`,
      handleCodeInApp: true,
    });
    localStorage.setItem("toatre_email_for_link", email);
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithApple, sendMagicLink, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
