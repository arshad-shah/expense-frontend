import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types';
import { HttpClient } from '@/api/restClient/HttpClient';
import { ApiError } from '@/api/common/ApiError';

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency: string;
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

export const register = createAsyncThunk(
    'auth/register',
    async (registerData: RegisterData, { rejectWithValue }) => {
        try {
            const csrfResponse = await restClient.get('/csrf-token',);
            
            const csrfToken = (csrfResponse as { data: { csrfToken: string } }).data.csrfToken;
            console.log(csrfToken);
            
            
            const response = await restClient.post('/auth/register', registerData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
            });
        
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof ApiError ? "Registration failed. Please try again later." : 'An unknown error occurred');
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
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout, setUser, setToken, clearError } = authSlice.actions;
export default authSlice.reducer;