import React from 'react';
import { Screen } from '../App';

interface NavbarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate }) => {
  const isActive = (screen: Screen) => currentScreen === screen;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0f0f11]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
            <span className="material-symbols-outlined text-[20px]">sports_mma</span>
          </div>
          <h2 className="text-white text-xl font-condensed font-bold tracking-tight uppercase">ARENA MMA</h2>
        </div>

        <nav className="hidden md:flex items-center gap-8 h-full">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors h-full border-b-2 ${isActive('dashboard') ? 'text-white border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('events')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors h-full border-b-2 ${isActive('events') ? 'text-white border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}
          >
            Eventos
          </button>
          <button
            onClick={() => onNavigate('summary')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors h-full border-b-2 ${isActive('summary') ? 'text-white border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}
          >
            Meus Torneios
          </button>
          <button
            onClick={() => onNavigate('ranking')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors h-full border-b-2 ${isActive('ranking') ? 'text-white border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}
          >
            Ranking
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors h-full border-b-2 ${isActive('profile') ? 'text-white border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}
          >
            Perfil
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-dark hover:bg-white/10 text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <div
            className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/5 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onNavigate('profile')}
          >
            <img
              alt="User Avatar"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdv6fnH2aUkUnStYycJnEKhaBICr74VmX4NnJNWQeAiTlNYjfRaYYdIaoUwqoIEjja3cV-obJrnb8Gr2KiHkzQz-DeJP1i1-21wlLJCmCXKcRBgb6F2m-uUznPWRZzMhZNCqAZa6eSt2I623-0Z_DFPK5NPmKdViNtogczjn5ZtJ-ArZKYBj2bztA5emkHyNyEy2LqUPyIDFtazLxIRtXY1YTN904jPv1NkVDpSRAx_bnPSnUrqaadV4tkE7fo8AizW2OjfaNetD1y"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;