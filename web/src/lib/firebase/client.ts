import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPhoneNumber,
  type ApplicationVerifier,
  type UserCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const firebaseApp = app;
export const auth = getAuth(app);

/** Sign in with Google via popup. */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Send a magic-link email to the given address.
 * Stores the email in localStorage so the verify page can retrieve it.
 */
export async function sendEmailMagicLink(email: string): Promise<void> {
  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login/verify`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("toatre_magic_email", email);
  }
}

/**
 * Complete magic-link sign-in on the verify page.
 * Retrieves the stored email from localStorage.
 */
export async function verifyEmailMagicLink(): Promise<UserCredential> {
  const href = typeof window !== "undefined" ? window.location.href : "";
  if (!isSignInWithEmailLink(auth, href)) {
    throw new Error("Not a valid sign-in link.");
  }
  const email =
    (typeof window !== "undefined"
      ? window.localStorage.getItem("toatre_magic_email")
      : null) ?? "";
  if (!email) {
    throw new Error("Could not find the email address. Please sign in again.");
  }
  const result = await signInWithEmailLink(auth, email, href);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("toatre_magic_email");
  }
  return result;
}

/**
 * Start phone-number sign-in (sends OTP via Firebase + reCAPTCHA).
 * The returned ConfirmationResult is used to verify the code.
 */
export async function sendPhoneOtp(
  phone: string,
  recaptchaVerifier: ApplicationVerifier
) {
  return signInWithPhoneNumber(auth, phone, recaptchaVerifier);
}

export default app;
