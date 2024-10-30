import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Sign up new user
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password); // Correct usage for Firebase 9+
};

// Sign in user
export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password) // Correct usage for Firebase 9+
    .catch((error) => {
      console.error("Sign-in error:", error);
      throw error; // Re-throw if you want to handle it elsewhere
    });
};

// Sign out user
export const signOutUser = () => {
  return signOut(auth); // Correct usage for Firebase 9+
};