import { useState } from 'react';
import { HttpClient } from '@/api/restClient/HttpClient';

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency: string;
}

interface RegisterResponse {
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        currency: string;
    };
}




const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<RegisterResponse | null>(null);

    const restClient = new HttpClient('https://expense-api.arshadshah.com/api');

    const register = async (registerData: RegisterData) => {
        setLoading(true);
        setError(null);

        try {
            const csrfResponse = restClient.get('csrf-token', {
                headers: {
                    'Origin': 'https://expense.arshadshah.com/',
                },
            });
            const csrfToken = (await csrfResponse as { data: { csrfToken: string } }).data.csrfToken;
            const response = restClient.post<RegisterResponse>('/auth/register', registerData, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken,
                        'Origin': 'https://expense.arshadshah.com/',
                    },
                })
            
            await fetch('https://expense-api.arshadshah.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': 'uVIu48cI-DiMmSWF4lSEk3md1As9aFdGFH1I',
                    'Origin': 'https://expense.arshadshah.com/',
                },
                body: JSON.stringify(registerData),
                credentials: 'include',
            });

            if ((await response).error) {
                throw new Error('Failed to register');
            }

            const result: RegisterResponse = (await response).data as RegisterResponse;
            setData(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return { register, loading, error, data };
};

export default useRegister;