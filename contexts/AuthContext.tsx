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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const data = await authService.getMe();
                if (data) {
                    setUser(data);
                } else {
                    localStorage.removeItem('token');
                }
            }
        } catch (error) {
            console.error("Failed to load user", error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const domainUser = await authService.login(email, password);
            if (domainUser) {
                setUser(domainUser);
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
        setUser(null);
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
