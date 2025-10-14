import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../services/apiService";
// Create the AuthContext
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopUp from "../pages/PopUp";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [loginResponse, setLoginResponse] = useState(
    JSON.parse(localStorage.getItem("loginResponse")) || null
  ); // Initialize with saved loginResponse
  const [error, setError] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  // Check for token in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem("transocean_token");
    if (token) {
      setIsAuthenticated(true); // Set authentication to true if token is found
    }
  }, []);

  const login = async (username, password, rememberMe) => {
    console.log(rememberMe, "rememberMe");
    setLoading(true);
    try {
      try {
        let loginData = {
          username: username,
          password: password,
        };
        const response = await loginApi(loginData);
        console.log(response, "login_response");
        if (response?.status == true) {
          setLoginResponse(response);
          localStorage.setItem("transocean_token", response.token);
          localStorage.setItem("loginResponse", JSON.stringify(response)); // Save response to localStorage
          const sidemenu = response?.permission || [];
          console.log(sidemenu, "sidemenu");
          setMessage("Logged in successfully!");
          setOpenPopUp(true);
          setIsAuthenticated(true);
          // Convert menu item to URL-friendly format (lowercase with hyphens)
          const firstMenuItem = sidemenu[0]?.toLowerCase().replace(/\s+/g, "-");
          navigate("/" + firstMenuItem);
        } else {
          setMessage("Login failed. Please try again");
          setOpenPopUp(true);
        }
      } catch (error) {
        setMessage("Login failed. Please try again");
        setOpenPopUp(true);
      } finally {
      }
    } catch (error) {
      console.error("Login failed:", error);

      setMessage("Login failed. Please try again");
      setOpenPopUp(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("transocean_token");
    localStorage.removeItem("loginResponse"); // Clear login response on logout
    navigate("/login");
    setMessage("Logout sucessfully");
  };

  useEffect(() => {
    console.log(isAuthenticated, "isAuthenticated");
  }, [isAuthenticated]);

  return (
    <>
      <AuthContext.Provider
        value={{ isAuthenticated, login, logout, loading, loginResponse }}
      >
        {children}
      </AuthContext.Provider>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export const useAuth = () => useContext(AuthContext);
