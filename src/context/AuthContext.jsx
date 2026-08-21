import { createContext, useContext, useEffect, useState } from "react";
import { onAuthChange, getUserProfile } from "../utils/auth";

const AuthContext = createContext(null);

/**
 * Wraps the entire app. Provides { user, profile, loading } to all children.
 * user   — Firebase Auth User object (null if signed out)
 * profile — Firestore /users/{uid} document (null if signed out)
 * loading — true while initial auth state is being determined
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
