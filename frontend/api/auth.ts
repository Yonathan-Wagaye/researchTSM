import {
    AuthResponse,
    User,
    UserRegister,
    UserLogin,
} from "../types/authTypes";
import apiClient from "../lib/api-client";

export const register = async (userData: UserRegister) => {
      return await apiClient<User>("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
}

export const login = async (userData: UserLogin) => {
    return await apiClient<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(userData),
    });
}

export const refresh = async () => {
    return await apiClient<AuthResponse>("/auth/refresh", {
        method: "POST",
    });
}

export const logout = async () => {
    await apiClient<void>("/auth/logout", {
        method: "POST",
    });
}

export const getMe = async (accessToken: string) => {
    return await apiClient<User>("/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}