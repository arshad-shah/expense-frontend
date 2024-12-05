export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    currency: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export interface RootState {
    auth: AuthState;
}