
export interface User {
    id: string;
    name: string;
    username: string;
    role: string;
}

const MOCK_USER: User = {
    id: '1',
    name: 'John Doe',
    username: 'jdoe',
    role: 'Receiving Officer',
};

export const AuthService = {
    login: async (username: string, password: string): Promise<User> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (username === 'admin' && password === 'password') {
            return MOCK_USER;
        }
        // For demo purposes, allow any non-empty credentials
        if (username && password) {
            return { ...MOCK_USER, username };
        }
        throw new Error('Invalid credentials');
    },

    logout: async () => {
        // Clear stored tokens
        // await SecureStore.deleteItemAsync('user_token');
    },
};
