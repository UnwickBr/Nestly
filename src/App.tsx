import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ShoppingList from './pages/ShoppingList';
import ItemDetail from './pages/ItemDetail';
import Wishlist from './pages/Wishlist';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';
import { type Item } from './data/mockData';

type Page = 'dashboard' | 'shopping' | 'wishlist' | 'stats' | 'profile';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const bg = darkMode ? 'glass-shell-dark' : 'glass-shell-light';

  return (
    <div className={`flex h-screen overflow-hidden ${bg} transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        darkMode={darkMode}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          currentPage={currentPage}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
          onOpenMobile={() => setMobileOpen(true)}
          onAddItem={() => setShowAddModal(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <Dashboard darkMode={darkMode} onNavigate={setCurrentPage} />
          )}
          {currentPage === 'shopping' && (
            <ShoppingList darkMode={darkMode} onOpenDetail={setSelectedItem} />
          )}
          {currentPage === 'wishlist' && (
            <Wishlist darkMode={darkMode} onOpenDetail={setSelectedItem} />
          )}
          {currentPage === 'stats' && (
            <Statistics darkMode={darkMode} />
          )}
          {currentPage === 'profile' && (
            <Profile darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
          )}
        </main>
      </div>

      {/* Item detail modal */}
      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          darkMode={darkMode}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Add item modal */}
      {showAddModal && (
        <AddItemModal darkMode={darkMode} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

import { X, Upload } from 'lucide-react';
import { CATEGORIES } from './data/mockData';

const AddItemModal = ({ darkMode, onClose }: { darkMode: boolean; onClose: () => void }) => {
  const [form, setForm] = useState({ name: '', category: '', priority: 'Média', plannedPrice: '', store: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const inputClass = `w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors ${darkMode ? 'bg-white/5 backdrop-blur-md border-white/10 text-gray-200 focus:border-blue-400/60' : 'bg-white/40 backdrop-blur-md border-white/60 text-gray-800 focus:border-blue-400'}`;
  const labelClass = `text-xs font-medium block mb-1.5 ${muted}`;

  const handleSubmit = () => {
    if (!form.name || !form.category) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl border ${darkMode ? 'bg-[#0c0c0e]/60 backdrop-blur-2xl border-white/10' : 'bg-white/70 backdrop-blur-2xl border-white/60'} animate-slide-in`}>
        <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-white/10' : 'border-white/60'}`}>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Adicionar Item</p>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-12 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Item adicionado!</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Image upload */}
            <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${darkMode ? 'border-white/15 hover:border-blue-400/50 bg-white/5' : 'border-white/60 hover:border-blue-300 bg-white/20'}`}>
              <Upload size={20} className={`mx-auto mb-2 ${muted}`} />
              <p className={`text-sm ${muted}`}>Clique para adicionar foto</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Nome do Item *</label>
                <input className={inputClass} placeholder="Ex: Sofá 3 lugares" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Categoria *</label>
                <select className={inputClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Selecionar...</option>
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Prioridade</label>
                <select className={inputClass} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Valor Previsto</label>
                <input className={inputClass} placeholder="R$ 0,00" value={form.plannedPrice} onChange={e => setForm({ ...form, plannedPrice: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Loja</label>
                <input className={inputClass} placeholder="Ex: Tok&Stok" value={form.store} onChange={e => setForm({ ...form, store: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Observações</label>
                <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Cor, tamanho, modelo..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${darkMode ? 'border-white/10 text-gray-300 hover:bg-white/10' : 'border-white/60 text-gray-700 hover:bg-white/40'}`}>
                Cancelar
              </button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                Adicionar Item
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
