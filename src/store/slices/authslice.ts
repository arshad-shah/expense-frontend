import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types';
import { HttpClient } from '@/api/restClient/HttpClient';

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

const restClient = new HttpClient('expense-api.arshadshah.com/api');

export const register = createAsyncThunk(
    'auth/register',
    async (registerData: RegisterData, { rejectWithValue }) => {
        try {
            console.log('registerData', registerData);
            
            const csrfResponse = await restClient.get('/csrf-token', {
                headers: {
                    'Origin': 'https://expense.arshadshah.com/',
                },
            });
            console.log('csrfResponse', csrfResponse);
            
            const csrfToken = (csrfResponse as { data: { csrfToken: string } }).data.csrfToken;
            
            const response = await restClient.post('/auth/register', registerData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                    'Origin': 'https://expense.arshadshah.com/',
                },
            });

            if (response.error) {
                throw new Error('Failed to register');
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
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