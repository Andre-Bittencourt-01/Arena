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
        <div className="flex flex-col min-h-screen font-display bg-background-dark text-white selection:bg-primary selection:text-white">
            <Navbar currentScreen={currentScreen} onNavigate={onNavigate} />
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
};

export default Layout;
