// authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types';
import { HttpClient } from '@/api/restClient/HttpClient';
import { ApiError } from '@/api/common/ApiError';
import { SHA256 } from 'crypto-js';

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency: string;
}

interface LoginData {
    email: string;
    password: string;
}

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};

const BASE_URL = import.meta.env.PROD 
  ? 'http://expense-api.arshadshah.com/api'
  : '/api';

const restClient = new HttpClient(BASE_URL);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await restClient.post('/auth/refresh-token');
            const data = response.data as { token: string };
            return data.token;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof ApiError ? "Session expired. Please sign in again." : "An unknown error occurred");
        }
    }
);


export const register = createAsyncThunk(
    'auth/register',
    async (registerData: RegisterData, { rejectWithValue }) => {
        try {
            const csrfResponse = await restClient.get('/csrf-token');
            const csrfToken = (csrfResponse as { data: { csrfToken: string } }).data.csrfToken;
            
            // Hash password before sending
            const dataWithHashedPassword = {
                ...registerData,
                password: registerData.password
            };
            
            const response = await restClient.post('/auth/register', dataWithHashedPassword, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
            });

            const data = response.data as { error?: string; user?: User; token?: string };
            if (data.error) {
                return rejectWithValue(data.error);
            }
            
            return data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof ApiError ? "Registration failed. Please try again later." : 'An unknown error occurred');
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (loginData: LoginData, { rejectWithValue }) => {
        try {
            const csrfResponse = await restClient.get('/csrf-token');
            const csrfToken = (csrfResponse as { data: { csrfToken: string } }).data.csrfToken;
            
            // Hash password before sending
            const dataWithHashedPassword = {
                ...loginData,
                password: loginData.password
            };
            
            const response = await restClient.post('/auth/login', dataWithHashedPassword, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
            });

            console.log(response);
            

            const data = response.data as { error?: string; user?: User; token?: string };
            if (data.error) {
                return rejectWithValue(data.error);
            }
            
            return data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof ApiError ? "Login failed. Please check your email and password." : 'An unknown error occurred');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.token = action.payload;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.error = action.payload as string;
                state.token = null;
                state.user = null; // Logout user if refresh fails
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                sessionStorage.setItem('token', action.payload.token!);
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                sessionStorage.setItem('token', action.payload.token!);
            });

    },
});

export const { logout, setUser, setToken, clearError } = authSlice.actions;
export default authSlice.reducer;