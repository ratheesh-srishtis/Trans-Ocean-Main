import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem("transocean_token"); // Check token in localStorage
  console.log(isAuthenticated, "isAuthenticated PrivateRoute");
  console.log(token, "token PrivateRoute, ");
  // If not authenticated, redirect to login page
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute;
