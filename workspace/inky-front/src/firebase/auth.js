import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState, useEffect } from "react";

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user role from your backend
        const role = await fetchUserRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserRole = async (uid) => {
    const response = await fetch(`http://localhost:5000/api/users/${uid}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user role");
    }
    const data = await response.json();
    return data.role;
  };

  return { currentUser, userRole };
};

// Sign up new user
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign in user
export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      console.error("Sign-in error:", error);
      throw error;
    });
};

// Sign out user
export const signOutUser = () => {
  return signOut(auth);
};
