import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { ApiDataService } from '../services/ApiDataService';
import { IDataService } from '../services/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use ApiDataService as the default provider for auth
const authService: IDataService = new ApiDataService();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, set_user] = useState<User | null>(null);
    const [loading, set_loading] = useState(true);

    const load_user = useCallback(async () => {
        set_loading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const data = await authService.get_me();
                if (data) {
                    set_user(data);
                } else {
                    localStorage.removeItem('token');
                }
            }
        } catch (error) {
            console.error("Failed to load user", error);
            localStorage.removeItem('token');
        } finally {
            set_loading(false);
        }
    }, []);

    useEffect(() => {
        load_user();
    }, [load_user]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const domain_user = await authService.login(email, password);
            if (domain_user) {
                set_user(domain_user);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        set_user(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
