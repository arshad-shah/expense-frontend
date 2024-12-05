import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '@/api/apolloclient/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import RegisterForm from '@/components/auth/RegisterForm';

const App: React.FC = () => {
    const client = createApolloClient({
        uri: 'expense-api.arshadshah.com',
        getToken: () => localStorage.getItem('token'),
        onTokenRefresh: (token) => localStorage.setItem('token', token),
        onError: (error) => {
            console.error('Apollo Client Error:', error);
        },
    });
    
    return (
        <ApolloProvider client={client}>
            <Provider store={store}>
                <RegisterForm/>
            </Provider>
        </ApolloProvider>
    );
};

export default App;