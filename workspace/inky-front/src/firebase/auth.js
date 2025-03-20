import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Sign up new user
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign in user
export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password).catch((error) => {
    console.error("Sign-in error:", error);
    throw error;
  });
};

// Sign out user
export const signOutUser = () => {
  return signOut(auth);
};
