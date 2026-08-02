import { type FC } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, Area, AreaChart,
} from 'recharts';
import { TrendingDown, TrendingUp, Award, Target } from 'lucide-react';
import { CATEGORIES, type Status } from '../data/mockData';
import { useItems } from '../context/ItemsContext';

interface StatsProps { darkMode: boolean; }

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_ORDER: Status[] = ['Desejado', 'Pesquisando', 'Comprado', 'Entregue', 'Montado'];
const STATUS_COLORS: Record<Status, string> = {
  Desejado: '#9ca3af',
  Pesquisando: '#3b82f6',
  Comprado: '#22c55e',
  Entregue: '#a855f7',
  Montado: '#10b981',
};

const Statistics: FC<StatsProps> = ({ darkMode }) => {
  const { items: allItems } = useItems();
  const items = allItems.filter(i => !i.isWishlist);
  const bought = items.filter(i => ['Comprado', 'Entregue', 'Montado'].includes(i.status));
  const totalSpent = bought.reduce((s, i) => s + (i.paidPrice ?? 0) * i.quantity, 0);
  const totalPlanned = items.reduce((s, i) => s + i.plannedPrice * i.quantity, 0);
  const totalSavings = bought.reduce((s, i) => s + (i.paidPrice != null ? (i.plannedPrice - i.paidPrice) * i.quantity : 0), 0);
  const progress = items.length > 0 ? Math.round((bought.length / items.length) * 100) : 0;

  const categoryData = CATEGORIES.map(cat => {
    const catItems = bought.filter(i => i.category === cat.name);
    const total = catItems.reduce((s, i) => s + (i.paidPrice ?? 0) * i.quantity, 0);
    return { name: cat.name, value: total, color: cat.color };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  const mostExpensive = [...bought].sort((a, b) => (b.paidPrice ?? 0) - (a.paidPrice ?? 0)).slice(0, 4);

  // Real spend over time, derived from when each item was actually marked
  // as bought (its last update), grouped by month.
  const monthMap = new Map<string, { label: string; gasto: number }>();
  for (const i of bought) {
    if (i.paidPrice == null) continue;
    const d = new Date(i.updatedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'short' });
    const entry = monthMap.get(key) ?? { label, gasto: 0 };
    entry.gasto += i.paidPrice * i.quantity;
    monthMap.set(key, entry);
  }
  const monthlyData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);

  const statusData = STATUS_ORDER.map(status => ({
    status,
    count: items.filter(i => i.status === status).length,
  })).filter(s => s.count > 0);

  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const text = darkMode ? 'text-gray-200' : 'text-gray-800';
  const card = `rounded-2xl border backdrop-blur-xl p-5 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/45 border-white/60'}`;
  const tooltipStyle = { background: darkMode ? 'rgba(22,22,26,0.75)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)'}`, borderRadius: 12, fontSize: 12 };

  const kpis = [
    { label: 'Total Gasto', value: fmt(totalSpent), icon: TrendingUp, color: 'text-rose-500', bg: darkMode ? 'bg-rose-900/20' : 'bg-rose-50' },
    { label: 'Total Planejado', value: fmt(totalPlanned), icon: Target, color: 'text-blue-500', bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50' },
    { label: 'Economia Total', value: fmt(totalSavings), icon: TrendingDown, color: 'text-emerald-500', bg: darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50' },
    { label: 'Conclusão', value: `${progress}%`, icon: Award, color: 'text-violet-500', bg: darkMode ? 'bg-violet-900/20' : 'bg-violet-50' },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-slide-in">
      <div>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Estatísticas</h2>
        <p className={`text-sm mt-1 ${muted}`}>Visão completa do progresso e gastos da sua casa.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={card}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className={`text-xs ${muted}`}>{label}</p>
            <p className={`text-xl font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className={card}>
        <h3 className={`text-sm font-semibold mb-5 ${text}`}>Gastos por Mês</h3>
        {monthlyData.length === 0 ? (
          <div className={`h-48 flex items-center justify-center ${muted} text-sm`}>Nenhum gasto registrado ainda</div>
        ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#27272e' : '#f1f5f9'} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => [fmt(v), 'Gasto']} contentStyle={tooltipStyle} cursor={{ stroke: darkMode ? '#27272e' : '#e2e8f0' }} />
            <Area type="monotone" dataKey="gasto" stroke="#3b82f6" strokeWidth={2} fill="url(#colorGasto)" />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Category + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className={card}>
          <h3 className={`text-sm font-semibold mb-4 ${text}`}>Gastos por Categoria</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={tooltipStyle} />
                <Legend formatter={(value) => <span className={`text-xs ${muted}`}>{value}</span>} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-48 flex items-center justify-center ${muted} text-sm`}>Nenhum dado ainda</div>
          )}
        </div>

        {/* Items by status */}
        <div className={card}>
          <h3 className={`text-sm font-semibold mb-4 ${text}`}>Itens por Status</h3>
          {statusData.length === 0 ? (
            <div className={`h-[180px] flex items-center justify-center ${muted} text-sm`}>Nenhum item ainda</div>
          ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statusData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#27272e' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {statusData.map(entry => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
          <div className={`mt-4 p-3 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/60'} flex items-center justify-between`}>
            <span className={`text-sm ${muted}`}>Conclusão atual</span>
            <div className="flex items-center gap-3">
              <div className={`w-24 h-2 rounded-full ${darkMode ? 'bg-white/10' : 'bg-white/50'}`}>
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
              </div>
              <span className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Most expensive */}
      <div className={card}>
        <h3 className={`text-sm font-semibold mb-4 ${text}`}>Produtos Mais Caros</h3>
        {mostExpensive.length === 0 ? (
          <p className={`text-sm text-center py-6 ${muted}`}>Nenhum produto comprado ainda.</p>
        ) : (
        <div className="space-y-3">
          {mostExpensive.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className={`text-sm font-bold w-5 text-center ${i === 0 ? 'text-amber-500' : muted}`}>#{i + 1}</span>
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</p>
                <p className={`text-xs ${muted}`}>{item.category}</p>
              </div>
              <p className={`text-sm font-bold font-mono flex-shrink-0 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {fmt(item.paidPrice ?? item.plannedPrice)}
              </p>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
