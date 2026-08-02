import { type FC } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { ShoppingCart, CheckCircle, Clock, DollarSign, TrendingDown, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { useItems } from '../context/ItemsContext';
import { timeAgo } from '../lib/format';

interface DashboardProps {
  darkMode: boolean;
  onNavigate: (page: 'shopping') => void;
}

const Dashboard: FC<DashboardProps> = ({ darkMode, onNavigate }) => {
  const { items: allItems, activities } = useItems();
  const items = allItems.filter(i => !i.isWishlist);
  const totalItems = items.length;
  const boughtItems = items.filter(i => ['Comprado', 'Entregue', 'Montado'].includes(i.status)).length;
  const pendingItems = totalItems - boughtItems;
  const plannedTotal = items.reduce((s, i) => s + i.plannedPrice * i.quantity, 0);
  const spentTotal = items.reduce((s, i) => s + (i.paidPrice ?? 0) * i.quantity, 0);
  const savings = items.reduce((s, i) => s + (i.paidPrice != null ? (i.plannedPrice - i.paidPrice) * i.quantity : 0), 0);
  const progress = totalItems > 0 ? Math.round((boughtItems / totalItems) * 100) : 0;

  const categorySpend = CATEGORIES.map(cat => {
    const catItems = items.filter(i => i.category === cat.name && i.paidPrice != null);
    const total = catItems.reduce((s, i) => s + (i.paidPrice ?? 0) * i.quantity, 0);
    return { name: cat.name.length > 7 ? cat.name.slice(0, 7) + '…' : cat.name, fullName: cat.name, total, color: cat.color };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const priorityItems = items
    .filter(i => !['Comprado', 'Entregue', 'Montado'].includes(i.status) && i.priority === 'Alta')
    .slice(0, 4);

  const card = `rounded-2xl p-5 border backdrop-blur-xl transition-all duration-200 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/45 border-white/60'}`;
  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const text = darkMode ? 'text-gray-200' : 'text-gray-800';

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const summaryCards = [
    { label: 'Total de Itens', value: totalItems, icon: ShoppingCart, color: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    { label: 'Comprados', value: boughtItems, icon: CheckCircle, color: 'green', bg: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Pendentes', value: pendingItems, icon: Clock, color: 'amber', bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-50', iconColor: 'text-amber-600' },
    { label: 'Valor Planejado', value: fmt(plannedTotal), icon: DollarSign, color: 'violet', bg: darkMode ? 'bg-violet-900/30' : 'bg-violet-50', iconColor: 'text-violet-600' },
    { label: 'Valor Gasto', value: fmt(spentTotal), icon: TrendingUp, color: 'rose', bg: darkMode ? 'bg-rose-900/30' : 'bg-rose-50', iconColor: 'text-rose-600' },
    { label: 'Economia Obtida', value: fmt(savings), icon: TrendingDown, color: 'teal', bg: darkMode ? 'bg-teal-900/30' : 'bg-teal-50', iconColor: 'text-teal-600' },
  ];

  const statusColors: Record<string, string> = {
    Desejado: 'bg-gray-200 text-gray-600',
    Pesquisando: 'bg-blue-100 text-blue-700',
    Comprado: 'bg-green-100 text-green-700',
    Entregue: 'bg-purple-100 text-purple-700',
    Montado: 'bg-emerald-100 text-emerald-700',
  };

  const priorityColors: Record<string, string> = {
    Alta: 'bg-red-100 text-red-600',
    Média: 'bg-amber-100 text-amber-600',
    Baixa: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-slide-in">
      {/* Greeting */}
      <div>
        <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Bom dia, Casal! 👋
        </h2>
        <p className={`mt-1 text-sm ${muted}`}>Aqui está o resumo do planejamento da sua casa nova.</p>
      </div>

      {/* Progress */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-sm font-medium ${muted}`}>Progresso Geral</p>
            <p className={`text-3xl font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{progress}%</p>
          </div>
          <div className={`text-right`}>
            <p className={`text-sm ${muted}`}>{boughtItems} de {totalItems} itens</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>completos</p>
          </div>
        </div>
        <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-white/10' : 'bg-white/50'} overflow-hidden`}>
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-6 mt-4">
          {['Montado', 'Entregue', 'Comprado', 'Pesquisando', 'Desejado'].map(s => {
            const count = items.filter(i => i.status === s).length;
            return (
              <div key={s} className="text-center">
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{count}</p>
                <p className={`text-xs ${muted}`}>{s}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className={card}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className={`text-xs font-medium ${muted}`}>{label}</p>
            <p className={`text-xl font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts + Priority row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart */}
        <div className={`${card} lg:col-span-3`}>
          <h3 className={`text-sm font-semibold mb-5 ${text}`}>Gastos por Categoria</h3>
          {categorySpend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categorySpend} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#27272e' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [fmt(v), 'Gasto']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={{ background: darkMode ? 'rgba(22,22,26,0.75)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)'}`, borderRadius: 12, fontSize: 12 }}
                  cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {categorySpend.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-48 flex items-center justify-center ${muted} text-sm`}>Nenhum gasto registrado ainda</div>
          )}
        </div>

        {/* Priority Items */}
        <div className={`${card} lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${text}`}>Próximas Prioridades</h3>
            <button
              onClick={() => onNavigate('shopping')}
              className={`text-xs font-medium flex items-center gap-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
            >
              Ver tudo <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {priorityItems.length === 0 ? (
              <div className={`text-center py-8 ${muted} text-sm`}>
                <Star size={24} className="mx-auto mb-2 opacity-40" />
                Todos itens prioritários comprados!
              </div>
            ) : priorityItems.map(item => (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white/40'} transition-colors cursor-pointer`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</p>
                  <p className={`text-xs ${muted}`}>{item.category}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[item.priority]}`}>{item.priority}</span>
                  <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.plannedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className={card}>
        <h3 className={`text-sm font-semibold mb-4 ${text}`}>Atividades Recentes</h3>
        {activities.length === 0 ? (
          <p className={`text-sm text-center py-6 ${muted}`}>Nenhuma atividade ainda. Adicione seu primeiro item!</p>
        ) : (
        <div className="space-y-0.5">
          {activities.map(act => (
            <div
              key={act.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white/40'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 bg-blue-500`}>
                {act.user.trim().charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">{act.user}</span> {act.action}{' '}
                  <span className="font-medium">{act.item}</span>
                </p>
              </div>
              <p className={`text-xs flex-shrink-0 ${muted}`}>{timeAgo(act.createdAt)}</p>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
