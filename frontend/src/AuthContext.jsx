// src/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { saveAuth, getToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);





  
  useEffect(() => {
    const token = getToken();
    const userId = localStorage.getItem("userId");
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const email = localStorage.getItem("userEmail") || "";

    if (token && userId) {
      setUser({
        id: userId,
        isAdmin,
        email,
      });
    }
  }, []);

  function login(data) {
    saveAuth(data);
    setUser(data.user);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
