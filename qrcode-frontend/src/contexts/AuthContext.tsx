// filepath: c:\Users\Kunal\Downloads\Q-R\frontend\src\contexts\AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AUTH_API,
  TokenService,
  UserService,
  ApiClient,
} from "../config/authConfig";

// Define our User type for JWT authentication
interface User {
  userId: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage on startup
    const storedUser = UserService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const signup = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await ApiClient.post(AUTH_API.REGISTER, { email, password });

      // Save auth data
      TokenService.setToken(data.token);
      UserService.setUser(data.userId, data.email);

      // Set user state
      setUser({ userId: data.userId, email: data.email });
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await ApiClient.post(AUTH_API.LOGIN, { email, password });

      // Save auth data
      TokenService.setToken(data.token);
      UserService.setUser(data.userId, data.email);

      // Set user state
      setUser({ userId: data.userId, email: data.email });
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Remove auth data
    TokenService.removeToken();
    UserService.removeUser();

    // Clear user state
    setUser(null);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
