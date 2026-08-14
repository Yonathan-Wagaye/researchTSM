"use client"
import { createContext, useState, useContext, useEffect } from "react";
import {
    AuthContextType,
    SessionStatus,
    User,
    UserLogin,
    UserRegister,
} from "../types/authTypes";
import {
    login as loginApi,
    logout as logoutApi,
    register as registerApi,
    refresh as refreshApi,
    getMe as getMeApi,
} from "../api/auth";
import { ApiError } from "../lib/api-client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EXPIRED_SESSION_CODES = new Set([
    "expired_refresh_token",
    "invalid_refresh_token",
]);

const sessionStatusFromError = (error: unknown): SessionStatus => {
    if (error instanceof ApiError && EXPIRED_SESSION_CODES.has(error.code)) {
        return "expired";
    }

    return "anonymous";
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>("loading");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const refreshSession = async () => {
            try {
                const response = await refreshApi();
                setAccessToken(response.access_token);
                const me = await getMeApi(response.access_token);
                setUser(me);
                setIsAuthenticated(true);
                setSessionStatus("authenticated");
            } catch (error) {
                setUser(null);
                setAccessToken(null);
                setIsAuthenticated(false);
                setSessionStatus(sessionStatusFromError(error));
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
            const me = await getMeApi(response.access_token);
            setUser(me);
            setIsAuthenticated(true);
            setSessionStatus("authenticated");
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
            setSessionStatus("anonymous");
            setError(null);
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            isAuthenticated,
            sessionStatus,
            isLoading,
            error,
            login,
            register,
            logout,
            clearError,
        }}>
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
