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
    console.log("🔄 Checking Firebase authentication...");
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("🔥 Firebase Auth Change: ", user);
      setCurrentUser(user);
      if (user) {
        console.log("✅ User is logged in:", user.uid);
        // Fetch user role from your backend
        const role = await fetchUserRole(user.uid);
        setUserRole(role);
      } else {
        console.log("❌ No user detected, logging out.");
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserRole = async (uid) => {
    const cachedRole = localStorage.getItem(`user_role_${uid}`);
    if (cachedRole) return cachedRole;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${uid}`);
      if (!response.ok) throw new Error("Failed to fetch user role");

      const data = await response.json();
      localStorage.setItem(`user_role_${uid}`, data.role);
      return data.role;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  useEffect(() => {
    const publicRoutes = ["/", "/artists"]; // Routes accessibles sans connexion
    if (!currentUser && !authLoading && !publicRoutes.includes(window.location.pathname)) {
      navigate("/");
    }
  }, [currentUser, authLoading, navigate]);

  return <AuthContext.Provider value={{ currentUser, userRole, authLoading }}>{authLoading ? <p>Loading...</p> : children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
