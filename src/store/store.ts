import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authslice';
import logger from 'redux-logger';

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(logger),
});

export type AppDispatch = typeof store.dispatch;