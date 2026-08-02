import { useState, type FC } from 'react';
import { Heart, ArrowRight, Plus, Sparkles } from 'lucide-react';
import { mockItems, type Item } from '../data/mockData';

interface WishlistProps {
  darkMode: boolean;
  onOpenDetail: (item: Item) => void;
}

const Wishlist: FC<WishlistProps> = ({ darkMode, onOpenDetail }) => {
  const [items, setItems] = useState(mockItems.filter(i => i.isWishlist));
  const [moved, setMoved] = useState<string[]>([]);

  const moveToList = (id: string) => {
    setMoved(prev => [...prev, id]);
    setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 600);
  };

  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const card = `rounded-2xl border backdrop-blur-xl transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/45 border-white/60'}`;

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-slide-in">
      <div>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Lista de Desejos</h2>
        <p className={`text-sm mt-1 ${muted}`}>Itens que você sonha ter, mas ainda não são prioridade.</p>
      </div>

      {items.length === 0 ? (
        <div className={`${card} p-16 text-center`}>
          <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-pink-500" />
          </div>
          <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Lista vazia!</p>
          <p className={`text-sm mt-1 ${muted}`}>Adicione itens de desejo para planejar o futuro.</p>
          <button className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Adicionar item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className={`${card} overflow-hidden group cursor-pointer transition-all duration-500 ${moved.includes(item.id) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              onClick={() => onOpenDetail(item)}
            >
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-44 object-cover bg-gray-200" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-3 right-3">
                  <Heart size={18} fill="currentColor" className="text-pink-400 drop-shadow" />
                </div>
                <span className={`absolute bottom-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm bg-white/20 text-white border border-white/30`}>
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <p className={`font-semibold text-sm mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.name}</p>
                <p className={`text-xs mb-3 ${muted}`}>{item.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${muted}`}>Estimado</p>
                    <p className={`font-bold font-mono ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {item.plannedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); moveToList(item.id); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-all hover:gap-2"
                  >
                    Mover <ArrowRight size={13} />
                  </button>
                </div>
                <div className={`flex items-center gap-2 mt-3 pt-3 border-t text-xs ${darkMode ? 'border-white/10 text-gray-500' : 'border-white/50 text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold ${item.addedBy === 'Ana' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                    {item.addedBy === 'Ana' ? 'A' : 'V'}
                  </div>
                  Adicionado por {item.addedBy}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      <div className={`rounded-2xl border backdrop-blur-xl p-4 flex items-start gap-3 ${darkMode ? 'bg-blue-500/10 border-blue-400/20' : 'bg-blue-50/60 border-blue-200/60'}`}>
        <Sparkles size={18} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Dica</p>
          <p className={`text-xs mt-0.5 ${darkMode ? 'text-blue-400/70' : 'text-blue-600/70'}`}>
            Itens na lista de desejos não entram no cálculo do orçamento. Quando estiver pronto para comprar, clique em "Mover" para adicioná-lo à lista principal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
