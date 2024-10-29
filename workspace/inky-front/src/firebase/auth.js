import { auth } from "./firebase";

// Sign up new user
export const signUp = (email, password) => {
  return auth.createUserWithEmailAndPassword(email, password);
};

// Sign in user
export const signIn = (email, password) => {
  return auth.signInWithEmailAndPassword(email, password);
};

// Sign out user
export const signOut = () => {
  return auth.signOut();
};
