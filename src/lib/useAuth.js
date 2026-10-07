// src/lib/useAuth.js
// Minimal auth hook. v1 = single admin account (you), created once in the
// Firebase console under Authentication > Users. No public sign-up form.

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return {
    user,
    loading: user === undefined,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
  };
}
