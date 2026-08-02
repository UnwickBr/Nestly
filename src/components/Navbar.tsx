import { type FC } from 'react';
import { Menu, Sun, Moon, Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Page = 'dashboard' | 'shopping' | 'wishlist' | 'stats' | 'profile';

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  shopping: 'Lista de Compras',
  wishlist: 'Lista de Desejos',
  stats: 'Estatísticas',
  profile: 'Perfil',
};

interface NavbarProps {
  currentPage: Page;
  darkMode: boolean;
  onToggleDark: () => void;
  onOpenMobile: () => void;
  onAddItem: () => void;
  onNavigate: (page: Page) => void;
}

const Navbar: FC<NavbarProps> = ({ currentPage, darkMode, onToggleDark, onOpenMobile, onAddItem, onNavigate }) => {
  const { receivedInvites } = useAuth();
  const hasInvites = receivedInvites.length > 0;
  return (
    <header className={`h-16 flex items-center justify-between px-4 lg:px-8 border-b backdrop-blur-2xl sticky top-0 z-30 transition-colors duration-300 ${darkMode ? 'bg-[#08080b]/40 border-white/10' : 'bg-white/40 border-white/60'}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className={`lg:hidden p-2 rounded-lg border transition-colors ${darkMode ? 'bg-white/10 border-white/10 hover:bg-white/20 text-gray-200' : 'bg-white/60 border-white/70 hover:bg-white/90 text-gray-700'}`}
        >
          <Menu size={20} />
        </button>
        <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {pageTitles[currentPage]}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDark}
          className={`p-2 rounded-lg border transition-colors ${darkMode ? 'bg-white/10 border-white/10 hover:bg-white/20 text-gray-200' : 'bg-white/60 border-white/70 hover:bg-white/90 text-gray-700'}`}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => onNavigate('profile')}
          className={`relative p-2 rounded-lg border transition-colors ${darkMode ? 'bg-white/10 border-white/10 hover:bg-white/20 text-gray-200' : 'bg-white/60 border-white/70 hover:bg-white/90 text-gray-700'}`}
        >
          <Bell size={18} />
          {hasInvites && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
        </button>
        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
