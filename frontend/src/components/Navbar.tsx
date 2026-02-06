import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Screen } from '../App';

interface NavbarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentScreen }) => {
  const { user, logout } = useAuth();
  const { attemptNavigate } = useNavigation();
  const isActive = (screen: Screen) => currentScreen === screen;

  const [is_menu_open, set_is_menu_open] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Click Outside Listener
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        set_is_menu_open(false);
      }
    };

    if (is_menu_open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [is_menu_open]);

  const navItems: { screen: Screen; label: string; icon: string }[] = [
    { screen: 'dashboard', label: 'Home', icon: 'home' },
    { screen: 'events', label: 'Eventos', icon: 'sports_mma' },
    { screen: 'leagues', label: 'Ligas', icon: 'groups' },
    { screen: 'ranking', label: 'Ranking', icon: 'trophy' },
  ];


  return (
    <>
      {/* Top Navbar - Compact on Mobile */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0f0f11]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center gap-2 md:gap-3 cursor-pointer"
            onClick={() => attemptNavigate('dashboard')}
          >
            <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded bg-primary text-white shadow-neon-sm">
              <span className="material-symbols-outlined text-[18px] md:text-[20px]">sports_mma</span>
            </div>
            <h2 className="text-white text-lg md:text-xl font-condensed font-bold tracking-tight uppercase">ARENA MMA</h2>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            {navItems.map((item) => (
              <button
                key={item.screen}
                onClick={() => attemptNavigate(item.screen)}
                className={`text-sm font-bold uppercase tracking-wide transition-colors h-full border-b-2 flex items-center px-1 ${isActive(item.screen) ? 'text-white border-primary' : 'text-gray-400 border-transparent hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-surface-dark hover:bg-white/10 text-white transition-colors">
              <span className="material-symbols-outlined text-[18px] md:text-[20px]">notifications</span>
            </button>
            {/* User Avatar with Dropdown */}
            <div className="relative" ref={menuRef}>
              <div
                className={`h-8 w-8 md:h-9 md:w-9 overflow-hidden rounded-full border bg-white/5 hover:border-primary/50 transition-colors cursor-pointer ${is_menu_open ? 'border-primary ring-2 ring-primary/20' : 'border-white/10'}`}
                onClick={() => set_is_menu_open(!is_menu_open)}
              >
                <img
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                  src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.name || "User") + "&background=random"}
                />
              </div>

              {/* Dropdown Menu */}
              {is_menu_open && (
                <>
                  {/* Mobile Overlay (Click Outside / Focus Trap) */}
                  <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden" onClick={() => set_is_menu_open(false)} />

                  {/* Menu Container */}
                  <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-white/10 bg-[#0f0f11] shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right overflow-hidden flex flex-col">

                    {/* Header */}
                    <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                      <p className="text-sm font-bold text-white truncate">{user?.name || "Usuário"}</p>
                      <p className="text-xs text-gray-400 truncate font-mono mt-0.5">{user?.email}</p>
                    </div>

                    {/* Actions */}
                    <div className="p-1.5 flex flex-col gap-0.5">
                      <button
                        onClick={() => {
                          attemptNavigate('profile');
                          set_is_menu_open(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/5 hover:text-white transition-colors group"
                      >
                        <span className="material-symbols-outlined text-[20px] text-gray-500 group-hover:text-primary transition-colors">person</span>
                        Meu Perfil
                      </button>

                      <div className="h-px bg-white/5 my-1 mx-2" />

                      <button
                        onClick={() => {
                          logout();
                          set_is_menu_open(false);
                          attemptNavigate('login');
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors group"
                      >
                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">logout</span>
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Portrait Focus */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f11]/95 backdrop-blur-lg border-t border-white/5 px-2 pb-safe-offset-1">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <button
              key={item.screen}
              onClick={() => attemptNavigate(item.screen)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${isActive(item.screen) ? 'text-primary' : 'text-gray-500'}`}
            >
              <div className={`flex items-center justify-center rounded-xl transition-all duration-300 ${isActive(item.screen) ? 'bg-primary/10 w-12 h-8' : 'w-10 h-8'}`}>
                <span className={`material-symbols-outlined text-[24px] ${isActive(item.screen) ? 'font-bold' : ''}`}>
                  {item.icon}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;