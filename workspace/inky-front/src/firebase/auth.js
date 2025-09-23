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
export const signIn = async (email, password) => {
  /*return signInWithEmailAndPassword(auth, email, password).catch((error) => {
    console.error("Sign-in error:", error);
    throw error;
  });*/
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Sign-in error:", error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async () => {
  const uid = auth.currentUser?.uid;
  await signOut(auth);
  if (uid) localStorage.removeItem(`user_role_${uid}`);
};
