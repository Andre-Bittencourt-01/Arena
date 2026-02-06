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

// Broadcast Channel for syncing tabs (Defined outside component to match Global Lifecycle)
const authChannel = new BroadcastChannel('auth_channel');

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

    const logout = useCallback((emitBroadcast = true) => {
        localStorage.removeItem('token');
        set_user(null);
        if (emitBroadcast) {
            try {
                authChannel.postMessage({ type: 'LOGOUT' });
            } catch (e) {
                console.warn('[Auth] Channel Sync Skipped (Logout)', e);
            }
        }
    }, []);

    useEffect(() => {
        // 1. Broadcast Channel Listener (Tab-to-Tab communication)
        const handleAuthMessage = (event: MessageEvent) => {
            if (event.data.type === 'LOGOUT') {
                console.log('[Auth] Received LOGOUT from another tab');
                logout(false); // Do not emit back (avoid loop)
                window.location.href = '/login';
            } else if (event.data.type === 'LOGIN') {
                console.log('[Auth] Received LOGIN from another tab');
                // Force reload to sync latest state/token
                window.location.reload();
            }
        };

        authChannel.addEventListener('message', handleAuthMessage);

        // 2. Storage Event Listener (Manual Token Manipulation Guard)
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'token') {
                if (!event.newValue) {
                    console.warn('[Auth] Token removed in another tab/window');
                    logout(false);
                } else if (event.newValue !== event.oldValue) {
                    console.warn('[Auth] Token changed in another tab/window');
                    window.location.reload(); // Sync new token
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            // DO NOT close the channel here, just remove listener
            authChannel.removeEventListener('message', handleAuthMessage);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [logout]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const domain_user = await authService.login(email, password);
            if (domain_user) {
                set_user(domain_user);
                try {
                    authChannel.postMessage({ type: 'LOGIN', user_id: domain_user.id });
                } catch (e) {
                    console.warn('[Auth] Channel Sync Skipped (Login)', e);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    }, []);

    // Helper to safe parse JWT Payload
    const parseJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    // Session Integrity & Focus Guards
    useEffect(() => {
        // 1. Sanity Check on Focus
        const handleFocus = () => {
            const token = localStorage.getItem('token');
            if (token && user) {
                const payload = parseJwt(token);
                // Check if token sub matches current user id
                // Note: user.id might be int or string, payload.sub is usually string
                if (payload && String(payload.sub) !== String(user.id)) {
                    console.warn('[Auth] Session Mismatch Detected on Focus. Reloading...');
                    window.location.reload();
                }
            } else if (!token && user) {
                // User thinks they are logged in, but token is gone
                console.warn('[Auth] Token missing on Focus. Logging out...');
                logout(true);
            }
        };

        // 2. 401 Global Handler
        const handleSessionExpired = () => {
            console.warn('[Auth] Session Expired (401). Logging out...');
            logout(true); // Emit to other tabs too
            // Optional: Redirect to login if not already
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('auth:session_expired', handleSessionExpired);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('auth:session_expired', handleSessionExpired);
        };
    }, [user, logout]);

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
