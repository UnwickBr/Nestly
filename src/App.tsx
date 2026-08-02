import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ShoppingList from './pages/ShoppingList';
import ItemDetail from './pages/ItemDetail';
import Wishlist from './pages/Wishlist';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ItemsProvider, useItems } from './context/ItemsContext';
import { type Item } from './data/mockData';

type Page = 'dashboard' | 'shopping' | 'wishlist' | 'stats' | 'profile';

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { status } = useAuth();
  const bg = 'glass-shell-light';

  if (status === 'loading') {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center ${bg}`}>
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status === 'guest') return <Auth />;

  return (
    <ItemsProvider>
      <AppShell />
    </ItemsProvider>
  );
}

function AppShell() {
  const { user, partner, logout } = useAuth();
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
        user={user}
        partner={partner}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          currentPage={currentPage}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
          onOpenMobile={() => setMobileOpen(true)}
          onAddItem={() => setShowAddModal(true)}
          onNavigate={setCurrentPage}
        />

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <Dashboard darkMode={darkMode} onNavigate={setCurrentPage} />
          )}
          {currentPage === 'shopping' && (
            <ShoppingList darkMode={darkMode} onOpenDetail={setSelectedItem} />
          )}
          {currentPage === 'wishlist' && (
            <Wishlist darkMode={darkMode} onOpenDetail={setSelectedItem} onAddItem={() => setShowAddModal(true)} />
          )}
          {currentPage === 'stats' && (
            <Statistics darkMode={darkMode} />
          )}
          {currentPage === 'profile' && (
            <Profile darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} onLogout={logout} />
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

import { useRef } from 'react';
import { X, Upload, Link2, Loader2 } from 'lucide-react';
import { CATEGORIES, PLACEHOLDER_IMAGE } from './data/mockData';

function compressImageFile(file: File, maxDim = 640, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Não foi possível ler essa imagem.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height >= width && height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas não suportado neste navegador.'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const AddItemModal = ({ darkMode, onClose }: { darkMode: boolean; onClose: () => void }) => {
  const { addItem } = useItems();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: '', category: '', priority: 'Média', plannedPrice: '', store: '', link: '', notes: '', isWishlist: false, image: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const inputClass = `w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors ${darkMode ? 'bg-white/5 backdrop-blur-md border-white/10 text-gray-200 focus:border-blue-400/60' : 'bg-white/40 backdrop-blur-md border-white/60 text-gray-800 focus:border-blue-400'}`;
  const labelClass = `text-xs font-medium block mb-1.5 ${muted}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageError('');
    try {
      const dataUrl = await compressImageFile(file);
      setForm(f => ({ ...f, image: dataUrl }));
    } catch {
      setImageError('Não foi possível processar essa foto. Tente outra.');
    }
  };

  const fetchImageFromLink = async () => {
    if (!form.link.trim() || fetchingImage) return;
    setFetchingImage(true);
    setImageError('');
    try {
      const res = await fetch('/api/fetch-product-image', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.link.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.image) {
        setForm(f => ({ ...f, image: data.image }));
      } else {
        setImageError('Não encontramos uma imagem nesse link. Você pode enviar uma foto manualmente.');
      }
    } catch {
      setImageError('Não foi possível buscar a imagem. Tente novamente.');
    } finally {
      setFetchingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || submitting) return;
    setSubmitting(true);
    const created = await addItem({
      name: form.name,
      category: form.category,
      priority: form.priority,
      quantity: 1,
      plannedPrice: Number(form.plannedPrice.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
      store: form.store,
      link: form.link.trim(),
      notes: form.notes,
      isWishlist: form.isWishlist,
      image: form.image || PLACEHOLDER_IMAGE,
      description: '',
    });
    setSubmitting(false);
    if (!created) return;
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
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {/* Image upload / preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`group relative border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors overflow-hidden ${form.image ? '' : 'p-6'} ${darkMode ? 'border-white/15 hover:border-blue-400/50 bg-white/5' : 'border-white/60 hover:border-blue-300 bg-white/20'}`}
            >
              {form.image ? (
                <>
                  <img src={form.image} alt="Prévia do item" className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-medium text-white">Trocar foto</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload size={20} className={`mx-auto mb-2 ${muted}`} />
                  <p className={`text-sm ${muted}`}>Clique para adicionar foto</p>
                </>
              )}
            </div>

            <div>
              <label className={labelClass}>Link do produto</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
                  <input
                    className={`${inputClass} pl-9`}
                    placeholder="https://loja.com/produto"
                    value={form.link}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); fetchImageFromLink(); } }}
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchImageFromLink}
                  disabled={!form.link.trim() || fetchingImage}
                  className={`px-3 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap ${darkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/60 text-gray-700 hover:bg-white/80'}`}
                >
                  {fetchingImage && <Loader2 size={14} className="animate-spin" />}
                  {fetchingImage ? 'Buscando...' : 'Buscar foto'}
                </button>
              </div>
              {imageError && <p className="text-xs text-rose-500 mt-1.5">{imageError}</p>}
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

            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input type="checkbox" checked={form.isWishlist} onChange={e => setForm({ ...form, isWishlist: e.target.checked })} className="accent-blue-600 w-4 h-4 rounded" />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Adicionar à lista de desejos</span>
            </label>

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${darkMode ? 'border-white/10 text-gray-300 hover:bg-white/10' : 'border-white/60 text-gray-700 hover:bg-white/40'}`}>
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-60">
                {submitting ? 'Adicionando...' : 'Adicionar Item'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
