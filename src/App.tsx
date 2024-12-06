import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '@/api/apolloclient/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import RegisterForm from '@/components/auth/RegisterForm';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/components/dashboard/dashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import NotFound from '@/components/NotFound';

const App: React.FC = () => {
    const client = createApolloClient({
        uri: '/graphql',
        getToken: () => sessionStorage.getItem('token'),
        onTokenRefresh: (token) => sessionStorage.setItem('token', token),
        onError: (error) => {
            console.error('Apollo Client Error:', error);
        },
    });
    
    return (
        <ApolloProvider client={client}>
            <Provider store={store}>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route 
                            path="/" 
                            element={<Navigate to="/dashboard" replace />} 
                        />
                        <Route 
                            path="/register" 
                            element={<RegisterForm />} 
                        />
                        <Route 
                            path="/login" 
                            element={<LoginForm />} 
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* Catch all route - 404 */}
                        <Route 
                            path="*" 
                            element={
                                <NotFound />
                            } 
                        />
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ApolloProvider>
    );
};

export default App;