interface UserLogin {
    email: string;
    password: string;
}

interface UserRegister extends UserLogin {
  first_name: string;
  last_name: string;
}

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
    updated_at: string;
}

interface AuthResponse {
    access_token: string;
    token_type: string;
}

type SessionStatus = "loading" | "authenticated" | "expired" | "anonymous";

type AuthContextType = {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    sessionStatus: SessionStatus;
    isLoading: boolean;
    error: string | null;
    login: (credentials: UserLogin) => Promise<void>;
    register: (userData: UserRegister) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export type {
    UserLogin,
    UserRegister,
    AuthContextType,
    AuthResponse,
    User,
    SessionStatus,
};