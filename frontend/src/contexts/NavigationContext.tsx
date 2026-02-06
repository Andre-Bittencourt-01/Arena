import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Screen } from '../App';

interface NavigationContextType {
    setBlocker: (blocker: (target: Screen) => boolean) => void;
    removeBlocker: () => void;
    attemptNavigate: (target: Screen) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{
    children: React.ReactNode;
    onNavigate: (screen: Screen) => void;
}> = ({ children, onNavigate }) => {
    const [blocker, setBlockerState] = useState<((target: Screen) => boolean) | null>(null);

    const setBlocker = useCallback((fn: (target: Screen) => boolean) => {
        setBlockerState(() => fn);
    }, []);

    const removeBlocker = useCallback(() => {
        setBlockerState(null);
    }, []);

    const attemptNavigate = useCallback((target: Screen) => {
        if (blocker) {
            // If blocker returns true, navigation is BLOCKED (handled internally by the blocker component)
            // If blocker returns false, navigation proceeds
            const shouldBlock = blocker(target);
            if (!shouldBlock) {
                onNavigate(target);
            }
        } else {
            onNavigate(target);
        }
    }, [blocker, onNavigate]);

    const value = useMemo(() => ({
        setBlocker,
        removeBlocker,
        attemptNavigate
    }), [setBlocker, removeBlocker, attemptNavigate]);

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
