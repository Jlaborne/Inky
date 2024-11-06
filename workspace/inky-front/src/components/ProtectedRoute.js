import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthProvider";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { currentUser } = useAuth();

  return currentUser ? <Component {...rest} /> : <Navigate to="/" />;
};

export default ProtectedRoute;