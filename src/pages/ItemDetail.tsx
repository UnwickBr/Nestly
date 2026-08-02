import { useEffect, useState, type FC } from 'react';
import { X, Star, ExternalLink, Edit3, ChevronDown, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { type Item, CATEGORIES } from '../data/mockData';
import { useItems } from '../context/ItemsContext';
import { avatarColor, timeAgo } from '../lib/format';

interface ItemDetailProps {
  item: Item;
  darkMode: boolean;
  onClose: () => void;
  onEdit: () => void;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  Alta: 'bg-red-100 text-red-600',
  Média: 'bg-amber-100 text-amber-600',
  Baixa: 'bg-gray-100 text-gray-500',
};

const statusColors: Record<string, string> = {
  Desejado: 'bg-gray-100 text-gray-600',
  Pesquisando: 'bg-blue-100 text-blue-700',
  Comprado: 'bg-green-100 text-green-700',
  Entregue: 'bg-purple-100 text-purple-700',
  Montado: 'bg-emerald-100 text-emerald-700',
};

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const mockHistory = [
  { date: '2024-01-10', event: 'Item adicionado por Você', price: null },
  { date: '2024-01-20', event: 'Preço previsto atualizado', price: null },
  { date: '2024-02-01', event: 'Status alterado para Pesquisando por Ana', price: null },
  { date: '2024-02-15', event: 'Status alterado para Comprado', price: 3200 },
];

const ItemDetail: FC<ItemDetailProps> = ({ item, darkMode, onClose, onEdit }) => {
  const { toggleFavorite } = useItems();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [sending, setSending] = useState(false);
  const [isFav, setIsFav] = useState(item.isFavorite);

  useEffect(() => {
    let cancelled = false;
    setLoadingComments(true);
    fetch(`/api/items/comments?itemId=${item.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (!cancelled) setComments(data.comments ?? []); })
      .finally(() => { if (!cancelled) setLoadingComments(false); });
    return () => { cancelled = true; };
  }, [item.id]);

  const handleToggleFavorite = () => {
    setIsFav(!isFav);
    toggleFavorite(item.id);
  };

  const sendComment = async () => {
    const text = comment.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/items/comments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, text }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setComments(prev => [...prev, data.comment]);
        setComment('');
      }
    } finally {
      setSending(false);
    }
  };

  const savings = item.paidPrice != null ? item.plannedPrice - item.paidPrice : null;
  const categoryMeta = CATEGORIES.find(c => c.name === item.category);
  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const text = darkMode ? 'text-gray-200' : 'text-gray-800';
  const sectionTitle = `text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`;
  const card = `rounded-2xl border backdrop-blur-xl p-4 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/45 border-white/60'}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 lg:p-8 animate-fade-in overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border ${darkMode ? 'bg-[#0c0c0e]/50 border-white/10' : 'bg-white/40 border-white/60'} backdrop-blur-2xl animate-slide-in mt-4 mb-8`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-white/10' : 'border-white/60'}`}>
          <button onClick={onClose} className={`p-2 rounded-lg border transition-colors ${darkMode ? 'bg-white/10 border-white/10 hover:bg-white/20 text-gray-200' : 'bg-white/60 border-white/70 hover:bg-white/90 text-gray-700'}`}>
            <ArrowLeft size={20} />
          </button>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detalhes do Item</p>
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg border transition-colors ${darkMode ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-white/60 border-white/70 hover:bg-white/90'}`}
          >
            <Star size={20} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'text-amber-400' : muted} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Image + name */}
          <div className={card}>
            <img src={item.image} alt={item.name} className="w-full h-56 object-cover rounded-xl bg-gray-200 mb-4" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h2>
                <p className={`text-sm mt-1 ${muted}`}>{item.description}</p>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColors[item.priority]}`}>{item.priority}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[item.status]}`}>{item.status}</span>
              </div>
            </div>
            <button
              onClick={onEdit}
              className={`mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${darkMode ? 'bg-white/10 border-white/10 hover:bg-white/20 text-gray-200' : 'bg-white/60 border-white/70 hover:bg-white/90 text-gray-700'}`}
            >
              <Edit3 size={13} /> Editar item
            </button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Categoria', value: `${categoryMeta?.icon} ${item.category}` },
              { label: 'Loja', value: item.store },
              { label: 'Quantidade', value: `${item.quantity} un.` },
              { label: 'Adicionado por', value: item.addedBy },
            ].map(({ label, value }) => (
              <div key={label} className={card}>
                <p className={`text-xs ${muted} mb-1`}>{label}</p>
                <p className={`text-sm font-medium ${text}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className={card}>
            <h3 className={sectionTitle}>Valores</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className={`text-xs ${muted} mb-1`}>Previsto</p>
                <p className={`text-base font-bold font-mono ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{fmt(item.plannedPrice)}</p>
              </div>
              <div>
                <p className={`text-xs ${muted} mb-1`}>Pago</p>
                <p className={`text-base font-bold font-mono ${item.paidPrice != null ? 'text-green-600' : muted}`}>
                  {item.paidPrice != null ? fmt(item.paidPrice) : '—'}
                </p>
              </div>
              <div>
                <p className={`text-xs ${muted} mb-1`}>Economia</p>
                <p className={`text-base font-bold font-mono ${savings && savings > 0 ? 'text-emerald-600' : savings && savings < 0 ? 'text-rose-600' : muted}`}>
                  {savings != null ? (savings >= 0 ? '+' : '') + fmt(savings) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {item.notes && (
            <div className={card}>
              <h3 className={sectionTitle}>Observações</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.notes}</p>
            </div>
          )}

          {/* Link */}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-xl text-sm font-medium transition-all ${darkMode ? 'border-white/10 bg-white/5 text-blue-400 hover:bg-white/10' : 'border-white/60 bg-white/45 text-blue-600 hover:bg-blue-50/60'}`}
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={15} />
            Ver produto em {item.store}
          </a>

          {/* History */}
          <div className={card}>
            <h3 className={sectionTitle}>Histórico de Alterações</h3>
            <div className="space-y-3">
              {mockHistory.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{h.event}</p>
                    {h.price && <p className={`text-xs font-mono text-green-600`}>{fmt(h.price)}</p>}
                    <p className={`text-xs mt-0.5 ${muted}`}>{h.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className={card}>
            <h3 className={sectionTitle}>Comentários</h3>
            <div className="space-y-4 mb-4">
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className={`animate-spin ${muted}`} />
                </div>
              ) : comments.length === 0 ? (
                <p className={`text-sm text-center py-2 ${muted}`}>Nenhum comentário ainda. Comece a conversa!</p>
              ) : comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full ${avatarColor(c.user)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                    {c.user.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${text}`}>{c.user}</span>
                      <span className={`text-xs ${muted}`}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escrever comentário..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendComment()}
                disabled={sending}
                className={`flex-1 px-3 py-2 rounded-xl text-sm border backdrop-blur-md outline-none transition-colors disabled:opacity-60 ${darkMode ? 'bg-white/5 border-white/10 text-gray-200 focus:border-blue-400/60' : 'bg-white/40 border-white/60 text-gray-800 focus:border-blue-400'}`}
              />
              <button
                onClick={sendComment}
                disabled={sending || !comment.trim()}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
