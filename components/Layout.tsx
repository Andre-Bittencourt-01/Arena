import React from 'react';
import Navbar from './Navbar';
import { Screen } from '../App';

interface LayoutProps {
    children: React.ReactNode;
    currentScreen: Screen;
    onNavigate: (screen: Screen) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, onNavigate }) => {
    return (
        <div className="flex flex-col h-[100dvh] font-display bg-background-dark text-white selection:bg-primary selection:text-white overflow-hidden">
            <Navbar currentScreen={currentScreen} onNavigate={onNavigate} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                {children}
            </main>
        </div>
    );
};

export default Layout;
