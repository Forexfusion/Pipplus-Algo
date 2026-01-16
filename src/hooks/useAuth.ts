// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth"; // Import functions
import type { User } from "firebase/auth"; // Import User type only
import { auth } from "../config/firebaseConfig"; // Adjust path if needed

export interface AuthState {
  currentUser: User | null;
  loading: boolean;
  manualSetCurrentUser?: (user: User | null) => void; // Keep this for profile updates
}

export const useAuth = (): AuthState => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to manually update user state (e.g., after profile update in ProfileSection)
  const manualSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    // If you need to refresh token or claims, you might do it here,
    // but for basic profile updates, just setting the user might be enough.
  };

  return { currentUser, loading, manualSetCurrentUser };
};
