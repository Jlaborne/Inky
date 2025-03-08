// AuthProvider.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

// Create a Context for Authentication
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user role from your backend
        const role = await fetchUserRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserRole = async (uid) => {
    const response = await fetch(`http://localhost:5000/api/users/${uid}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user role");
    }
    const data = await response.json();
    return data.role;
  };

  useEffect(() => {
    // Redirect to login if unauthenticated and auth check is complete
    if (!currentUser && !authLoading) {
      navigate("/");
    }
  }, [currentUser, authLoading, navigate]);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, authLoading }}>
      {authLoading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
