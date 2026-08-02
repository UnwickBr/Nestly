import { useState, type FC } from 'react';
import {
  Search, Filter, Grid3X3, List, LayoutGrid, Star, StarOff, Edit3, Trash2, CheckSquare, Square,
  ExternalLink, ChevronDown, X, SlidersHorizontal,
} from 'lucide-react';
import { CATEGORIES, type Item, type Category, type Priority, type Status } from '../data/mockData';
import { useItems } from '../context/ItemsContext';

interface ShoppingListProps {
  darkMode: boolean;
  onOpenDetail: (item: Item) => void;
}

type ViewMode = 'cards' | 'list' | 'grid';

const priorityColors: Record<Priority, string> = {
  Alta: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  Média: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  Baixa: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};
const statusColors: Record<Status, string> = {
  Desejado: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Pesquisando: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  Comprado: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Entregue: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  Montado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
};

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ShoppingList: FC<ShoppingListProps> = ({ darkMode, onOpenDetail }) => {
  const { items: allItems, toggleFavorite, setStatus, deleteItem } = useItems();
  const items = allItems.filter(i => !i.isWishlist);
  const [view, setView] = useState<ViewMode>('cards');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | ''>('');
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('');
  const [filterStatus, setFilterStatus] = useState<Status | ''>('');
  const [filterAdded, setFilterAdded] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addedByOptions = [...new Set(items.map(i => i.addedBy))];
  const toggleBought = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setStatus(id, item.status === 'Comprado' ? 'Pesquisando' : 'Comprado');
  };
  const handleDelete = (id: string) => { deleteItem(id); setDeleteConfirm(null); };

  const filtered = items.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterPriority && item.priority !== filterPriority) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterAdded && item.addedBy !== filterAdded) return false;
    if (filterFavorites && !item.isFavorite) return false;
    return true;
  });

  const hasFilters = filterCategory || filterPriority || filterStatus || filterAdded || filterFavorites;
  const clearFilters = () => { setFilterCategory(''); setFilterPriority(''); setFilterStatus(''); setFilterAdded(''); setFilterFavorites(false); };

  const card = `rounded-2xl border backdrop-blur-xl transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/45 border-white/60'}`;
  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const inputClass = `w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${darkMode ? 'bg-white/5 backdrop-blur-md border-white/10 text-gray-200 focus:border-blue-400/60' : 'bg-white/40 backdrop-blur-md border-white/60 text-gray-800 focus:border-blue-400'}`;

  return (
    <div className="p-4 lg:p-8 space-y-5 animate-slide-in">
      {/* Search + View toggles */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
          <input
            type="text"
            placeholder="Buscar item..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-md text-sm font-medium transition-colors ${hasFilters ? 'border-blue-400/60 text-blue-600 bg-blue-500/10 dark:text-blue-400' : darkMode ? 'border-white/10 text-gray-400 hover:bg-white/10' : 'border-white/60 text-gray-600 hover:bg-white/40'}`}
          >
            <SlidersHorizontal size={15} />
            Filtros {hasFilters && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          </button>
          <div className={`flex items-center gap-1 p-1 rounded-xl border backdrop-blur-md ${darkMode ? 'border-white/10 bg-white/5' : 'border-white/60 bg-white/40'}`}>
            {([['cards', LayoutGrid], ['list', List], ['grid', Grid3X3]] as [ViewMode, typeof List][]).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`p-1.5 rounded-lg transition-colors ${view === mode ? 'bg-blue-600 text-white' : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className={`${card} p-4 animate-slide-in`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Filtros</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Limpar tudo</button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={`text-xs font-medium block mb-1.5 ${muted}`}>Categoria</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as Category | '')} className={inputClass}>
                <option value="">Todas</option>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-xs font-medium block mb-1.5 ${muted}`}>Prioridade</label>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | '')} className={inputClass}>
                <option value="">Todas</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
            <div>
              <label className={`text-xs font-medium block mb-1.5 ${muted}`}>Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status | '')} className={inputClass}>
                <option value="">Todos</option>
                {(['Desejado', 'Pesquisando', 'Comprado', 'Entregue', 'Montado'] as Status[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`text-xs font-medium block mb-1.5 ${muted}`}>Adicionado por</label>
              <select value={filterAdded} onChange={e => setFilterAdded(e.target.value)} className={inputClass}>
                <option value="">Todos</option>
                {addedByOptions.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 mt-3 cursor-pointer w-fit">
            <input type="checkbox" checked={filterFavorites} onChange={e => setFilterFavorites(e.target.checked)} className="accent-blue-600 w-4 h-4 rounded" />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Apenas favoritos</span>
          </label>
        </div>
      )}

      {/* Count */}
      <p className={`text-sm ${muted}`}>{filtered.length} {filtered.length === 1 ? 'item' : 'itens'}</p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className={`${card} p-16 flex flex-col items-center justify-center text-center`}>
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Search size={24} className={muted} />
          </div>
          <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nenhum item encontrado</p>
          <p className={`text-sm mt-1 ${muted}`}>Tente ajustar os filtros ou a busca.</p>
          {hasFilters && <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 hover:underline">Limpar filtros</button>}
        </div>
      )}

      {/* Cards view */}
      {view === 'cards' && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} darkMode={darkMode} onFav={toggleFavorite} onBought={toggleBought} onDelete={() => setDeleteConfirm(item.id)} onClick={() => onOpenDetail(item)} />
          ))}
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <ItemGridCard key={item.id} item={item} darkMode={darkMode} onFav={toggleFavorite} onBought={toggleBought} onDelete={() => setDeleteConfirm(item.id)} onClick={() => onOpenDetail(item)} />
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && filtered.length > 0 && (
        <div className={`${card} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b text-left ${darkMode ? 'border-white/10' : 'border-white/60'}`}>
                {['Item', 'Categoria', 'Prioridade', 'Status', 'Previsto', 'Pago', 'Ações'].map(h => (
                  <th key={h} className={`px-4 py-3 font-medium text-xs ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} className={`border-b transition-colors cursor-pointer ${darkMode ? 'border-white/10 hover:bg-white/10' : 'border-white/50 hover:bg-white/40'} ${i === filtered.length - 1 ? 'border-b-0' : ''}`} onClick={() => onOpenDetail(item)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover bg-gray-200" />
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} max-w-[200px] truncate`}>{item.name}</p>
                        <p className={`text-xs ${muted}`}>{item.addedBy}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={muted}>{item.category}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[item.priority]}`}>{item.priority}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status]}`}>{item.status}</span></td>
                  <td className="px-4 py-3 font-mono text-xs">{fmt(item.plannedPrice)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.paidPrice != null ? fmt(item.paidPrice) : '—'}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleFavorite(item.id)} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}>
                        {item.isFavorite ? <Star size={14} fill="currentColor" className="text-amber-500" /> : <StarOff size={14} />}
                      </button>
                      <button onClick={() => setDeleteConfirm(item.id)} className={`p-1.5 rounded-lg transition-colors text-rose-500 ${darkMode ? 'hover:bg-rose-900/20' : 'hover:bg-rose-50'}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`${card} p-6 w-full max-w-sm shadow-2xl`}>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Excluir item?</h3>
            <p className={`text-sm ${muted} mb-5`}>Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${darkMode ? 'border-white/10 text-gray-300 hover:bg-white/10' : 'border-white/60 text-gray-700 hover:bg-white/40'}`}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CardProps {
  item: Item;
  darkMode: boolean;
  onFav: (id: string) => void;
  onBought: (id: string) => void;
  onDelete: () => void;
  onClick: () => void;
}

const ItemCard: FC<CardProps> = ({ item, darkMode, onFav, onBought, onDelete, onClick }) => {
  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const bought = ['Comprado', 'Entregue', 'Montado'].includes(item.status);
  const savings = item.paidPrice != null ? item.plannedPrice - item.paidPrice : null;

  return (
    <div
      className={`rounded-2xl border backdrop-blur-xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 group ${darkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white/45 border-white/60 hover:border-blue-200 hover:shadow-sm'} ${bought ? 'opacity-70' : ''}`}
      onClick={onClick}
    >
      <button
        onClick={e => { e.stopPropagation(); onBought(item.id); }}
        className={`flex-shrink-0 transition-colors ${bought ? 'text-green-500' : darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500'}`}
      >
        {bought ? <CheckSquare size={20} /> : <Square size={20} />}
      </button>

      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-200" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p className={`font-medium text-sm ${bought ? 'line-through' : ''} ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityColors[item.priority]}`}>{item.priority}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[item.status]}`}>{item.status}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className={`text-xs ${muted}`}>{item.category} · {item.store}</p>
          <p className={`text-xs ${muted}`}>por {item.addedBy}</p>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div>
            <p className={`text-xs ${muted}`}>Previsto</p>
            <p className={`text-sm font-semibold font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.plannedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          {item.paidPrice != null && (
            <div>
              <p className={`text-xs ${muted}`}>Pago</p>
              <p className="text-sm font-semibold font-mono text-green-600">{item.paidPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          )}
          {savings != null && savings > 0 && (
            <div>
              <p className={`text-xs ${muted}`}>Economia</p>
              <p className="text-sm font-semibold font-mono text-emerald-600">+{savings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button onClick={() => onFav(item.id)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
          {item.isFavorite ? <Star size={16} fill="currentColor" className="text-amber-400" /> : <Star size={16} className={muted} />}
        </button>
        <button onClick={onDelete} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-rose-900/30 text-gray-600 hover:text-rose-400' : 'hover:bg-rose-50 text-gray-400 hover:text-rose-500'}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const ItemGridCard: FC<CardProps> = ({ item, darkMode, onFav, onBought, onDelete, onClick }) => {
  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const bought = ['Comprado', 'Entregue', 'Montado'].includes(item.status);

  return (
    <div
      className={`rounded-2xl border backdrop-blur-xl overflow-hidden cursor-pointer transition-all duration-200 ${darkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white/45 border-white/60 hover:shadow-md hover:border-blue-200'}`}
      onClick={onClick}
    >
      <div className="relative">
        <img src={item.image} alt={item.name} className="w-full h-40 object-cover bg-gray-200" />
        <button
          onClick={e => { e.stopPropagation(); onFav(item.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-sm transition-transform hover:scale-110"
        >
          {item.isFavorite ? <Star size={15} fill="currentColor" className="text-amber-400" /> : <Star size={15} className="text-gray-400" />}
        </button>
        <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status]}`}>{item.status}</span>
      </div>
      <div className="p-4">
        <p className={`font-semibold text-sm ${bought ? 'line-through opacity-60' : ''} ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-1`}>{item.name}</p>
        <p className={`text-xs ${muted} mb-3`}>{item.category} · por {item.addedBy}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs ${muted}`}>Previsto</p>
            <p className={`text-sm font-bold font-mono ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.plannedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[item.priority]}`}>{item.priority}</span>
        </div>
        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onBought(item.id)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors ${bought ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {bought ? 'Comprado ✓' : 'Marcar'}
          </button>
          <button onClick={onDelete} className={`p-1.5 rounded-xl transition-colors ${darkMode ? 'bg-gray-800 text-gray-500 hover:bg-rose-900/30 hover:text-rose-400' : 'bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500'}`}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
