import { type FC } from 'react';
import { House, ShoppingCart, Heart, BarChart3, User, X, Home } from 'lucide-react';
import { mockItems } from '../data/mockData';
import type { AuthUser } from '../context/AuthContext';

type Page = 'dashboard' | 'shopping' | 'wishlist' | 'stats' | 'profile';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  darkMode: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  user: AuthUser | null;
  partner: AuthUser | null;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: House },
  { id: 'shopping' as Page, label: 'Lista de Compras', icon: ShoppingCart },
  { id: 'wishlist' as Page, label: 'Lista de Desejos', icon: Heart },
  { id: 'stats' as Page, label: 'Estatísticas', icon: BarChart3 },
  { id: 'profile' as Page, label: 'Perfil', icon: User },
];

const PARTNER_COLORS = ['bg-pink-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];
function colorForId(id: string): string {
  const sum = [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
  return PARTNER_COLORS[sum % PARTNER_COLORS.length];
}

const Sidebar: FC<SidebarProps> = ({ currentPage, onNavigate, darkMode, mobileOpen, onCloseMobile, user, partner }) => {
  const nonWishlist = mockItems.filter(i => !i.isWishlist);
  const doneCount = nonWishlist.filter(i => ['Comprado', 'Entregue', 'Montado'].includes(i.status)).length;
  const totalCount = nonWishlist.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const selfInitial = user?.name.trim().charAt(0).toUpperCase() || '?';
  const partnerInitial = partner?.name.trim().charAt(0).toUpperCase() || '';
  const sidebarBase = `flex flex-col h-full border-r backdrop-blur-2xl transition-all duration-300`;
  const sidebarColor = darkMode
    ? 'bg-white/5 border-white/10'
    : 'bg-white/40 border-white/60';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarBase} ${sidebarColor}
          fixed left-0 top-0 bottom-0 z-50 w-64
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 lg:transition-none
        `}
      >
        {/* Logo */}
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-white/10' : 'border-white/60'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Home size={18} color="white" />
            </div>
            <div>
              <span className={`font-semibold text-base tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Nestly
              </span>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Planejamento</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className={`lg:hidden p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-white/40 text-gray-500'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Users */}
        <div className={`px-4 py-4 border-b ${darkMode ? 'border-white/10' : 'border-white/60'}`}>
          <p className={`text-xs font-medium mb-3 px-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>MORADORES</p>
          <div className="flex items-center gap-3 px-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-semibold">
                {selfInitial}
              </div>
              {partner && (
                <div className={`w-8 h-8 rounded-full ${colorForId(partner.id)} border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-semibold`}>
                  {partnerInitial}
                </div>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Você{partner ? ` & ${partner.name}` : ''}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {partner ? 'Acesso compartilhado' : 'Convide seu cônjuge no Perfil'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onCloseMobile(); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? darkMode
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-blue-50 text-blue-700'
                    : darkMode
                      ? 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
                {isActive && (
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Progress footer */}
        <div className={`p-4 m-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/60'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Progresso da Casa</p>
            <span className={`text-xs font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{progress}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{doneCount} de {totalCount} itens prontos</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
