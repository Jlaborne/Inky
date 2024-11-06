import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

// Create a Context for Authentication
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Redirect to login if unauthenticated and auth check is complete
    if (!currentUser && !authLoading) {
      navigate("/");
    }
  }, [currentUser, authLoading, navigate]);

  return (
    <AuthContext.Provider value={{ currentUser, authLoading }}>
      {authLoading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
