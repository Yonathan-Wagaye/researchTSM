"use client"
import { createContext, useState, useContext, useEffect } from "react";
import { AuthContextType, User, UserLogin, UserRegister } from "../types/authTypes";
import {
    login as loginApi,
    logout as logoutApi,
    register as registerApi,
    refresh as refreshApi,
} from "../api/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const refreshSession = async () => {
            try {
                const response = await refreshApi();
                setAccessToken(response.access_token);
                setIsAuthenticated(true);
            } catch {
                setAccessToken(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        refreshSession();
    }, []);

    const login  = async (credentials: UserLogin) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await loginApi(credentials);
            setAccessToken(response.access_token);
            setIsAuthenticated(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: UserRegister) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await registerApi(userData);
            setUser(response);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const logout = async () => {
        try {
            await logoutApi();
        } catch {
            // Still clear local auth state even if the request fails.
        } finally {
            setUser(null);
            setAccessToken(null);
            setIsAuthenticated(false);
            setError(null);
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{ user, accessToken, isAuthenticated, isLoading, error, login, register, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    )

}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
  }
