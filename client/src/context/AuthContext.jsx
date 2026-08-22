import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getToken, saveToken, removeToken } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getToken().then((storedToken) => {
      if (!isMounted) {
        return;
      }

      setToken(storedToken);
      setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (newToken) => {
    await saveToken(newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setToken(null);
  }, []);

  const value = {
    token,
    isAuthenticated: Boolean(token),
    isCheckingAuth,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
