import { useState, type FC } from 'react';
import { Sun, Moon, Bell, Shield, Download, ChevronRight, Users, Mail, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
}

const Profile: FC<ProfileProps> = ({ darkMode, onToggleDark, onLogout }) => {
  const { user, partner, receivedInvites, sentInvites, sendInvite, acceptInvite, declineInvite, error, clearError } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [sharedEdit, setSharedEdit] = useState(true);
  const [currency, setCurrency] = useState('BRL');
  const [toastMsg, setToastMsg] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const submitInvite = async () => {
    if (!inviteEmail.trim() || sending) return;
    setSending(true);
    const ok = await sendInvite(inviteEmail.trim());
    setSending(false);
    if (ok) {
      showToast('Convite enviado!');
      setInviteEmail('');
    }
  };

  const respond = async (id: string, accept: boolean) => {
    const ok = accept ? await acceptInvite(id) : await declineInvite(id);
    if (ok) showToast(accept ? 'Vocês agora compartilham o mesmo perfil!' : 'Convite recusado.');
  };

  const muted = darkMode ? 'text-gray-500' : 'text-gray-400';
  const text = darkMode ? 'text-gray-200' : 'text-gray-700';
  const card = `rounded-2xl border backdrop-blur-xl overflow-hidden ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/45 border-white/60'}`;
  const divider = `border-t ${darkMode ? 'border-white/10' : 'border-white/50'}`;
  const rowClass = `flex items-center justify-between px-5 py-4 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white/40'}`;
  const inputClass = `flex-1 px-3 py-2 rounded-xl text-sm border backdrop-blur-md outline-none transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-gray-200 focus:border-blue-400/60' : 'bg-white/40 border-white/60 text-gray-800 focus:border-blue-400'}`;

  const Toggle: FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-blue-600' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-slide-in max-w-2xl">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900/70 backdrop-blur-xl border border-white/10 text-white text-sm shadow-xl animate-slide-in">
          <Check size={15} className="text-green-400" /> {toastMsg}
        </div>
      )}

      <div>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Perfil</h2>
        <p className={`text-sm mt-1 ${muted}`}>Gerencie sua conta e preferências.</p>
      </div>

      {/* Convites recebidos */}
      {receivedInvites.length > 0 && (
        <div className={`rounded-2xl border backdrop-blur-xl p-4 space-y-3 ${darkMode ? 'bg-blue-500/10 border-blue-400/20' : 'bg-blue-50/60 border-blue-200/60'}`}>
          {receivedInvites.map(inv => (
            <div key={inv.id} className="flex items-center justify-between gap-3 flex-wrap">
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                <span className="font-semibold">{inv.fromName}</span> ({inv.fromEmail}) quer juntar os perfis com você.
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => respond(inv.id, true)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
                  <Check size={13} /> Aceitar
                </button>
                <button onClick={() => respond(inv.id, false)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${darkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/70 text-gray-600 hover:bg-white'}`}>
                  <X size={13} /> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile card */}
      <div className={card}>
        <div className={`p-5 flex items-center gap-4 ${partner ? divider : ''}`}>
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-600/30">
              {user?.name.trim().charAt(0).toUpperCase() || '?'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
          </div>
          <div>
            <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
            <p className={`text-sm ${muted}`}>{user?.email}</p>
            <p className={`text-xs mt-1 px-2 py-0.5 rounded-full w-fit ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>Você</p>
          </div>
        </div>

        {partner ? (
          <div className="p-5 flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-pink-500/30">
                {partner.name.trim().charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
            </div>
            <div>
              <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{partner.name}</p>
              <p className={`text-sm ${muted}`}>{partner.email}</p>
              <p className={`text-xs mt-1 px-2 py-0.5 rounded-full w-fit ${darkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>Cônjuge</p>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <p className={`text-sm font-medium mb-1 ${text}`}>Convide seu cônjuge</p>
            <p className={`text-xs mb-3 ${muted}`}>
              Envie um convite por e-mail. Quando ele(a) aceitar, os perfis são unidos e o app passa a mostrar "Você & {inviteEmail ? inviteEmail.split('@')[0] : 'nome'}" para os dois.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => { setInviteEmail(e.target.value); if (error) clearError(); }}
                  onKeyDown={e => e.key === 'Enter' && submitInvite()}
                  placeholder="email@conjuge.com"
                  className={`${inputClass} pl-9`}
                />
              </div>
              <button
                onClick={submitInvite}
                disabled={sending}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                Convidar
              </button>
            </div>
            {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}

            {sentInvites.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {sentInvites.map(inv => (
                  <div key={inv.id} className={`flex items-center gap-2 text-xs ${muted}`}>
                    <Clock size={12} /> Convite pendente para {inv.toEmail}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compartilhamento */}
      <div className={card}>
        <div className="px-5 pt-4 pb-2">
          <p className={`text-xs font-semibold ${muted} tracking-wide`}>COMPARTILHAMENTO</p>
        </div>
        <div className={rowClass}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Users size={15} className={muted} />
            </div>
            <p className={`text-sm font-medium ${text}`}>{partner ? `${partner.name} pode` : 'Seu cônjuge poderá'} editar itens</p>
          </div>
          <Toggle checked={sharedEdit} onChange={() => setSharedEdit(!sharedEdit)} />
        </div>
      </div>

      {/* Preferências */}
      <div className={card}>
        <div className="px-5 pt-4 pb-2">
          <p className={`text-xs font-semibold ${muted} tracking-wide`}>PREFERÊNCIAS</p>
        </div>

        <div className={rowClass}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
              {darkMode ? <Moon size={15} className="text-amber-400" /> : <Sun size={15} className="text-amber-500" />}
            </div>
            <p className={`text-sm font-medium ${text}`}>Modo {darkMode ? 'Escuro' : 'Claro'}</p>
          </div>
          <Toggle checked={darkMode} onChange={onToggleDark} />
        </div>

        <div className={`${divider} ${rowClass}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <Bell size={15} className="text-blue-500" />
            </div>
            <p className={`text-sm font-medium ${text}`}>Notificações</p>
          </div>
          <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
        </div>

        <div className={`${divider} px-5 py-4`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <span className="text-sm">💱</span>
            </div>
            <p className={`text-sm font-medium ${text}`}>Moeda</p>
          </div>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl text-sm border backdrop-blur-md outline-none transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-gray-200 focus:border-blue-400/60' : 'bg-white/40 border-white/60 text-gray-800 focus:border-blue-400'}`}
          >
            <option value="BRL">BRL — Real Brasileiro (R$)</option>
            <option value="USD">USD — Dólar Americano ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
          </select>
        </div>
      </div>

      {/* Dados */}
      <div className={card}>
        <div className="px-5 pt-4 pb-2">
          <p className={`text-xs font-semibold ${muted} tracking-wide`}>DADOS</p>
        </div>
        <button className={`w-full ${rowClass}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Download size={15} className={muted} />
            </div>
            <p className={`text-sm font-medium ${text}`}>Exportar dados (CSV)</p>
          </div>
          <ChevronRight size={16} className={muted} />
        </button>
        <button className={`w-full ${divider} ${rowClass}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Shield size={15} className={muted} />
            </div>
            <p className={`text-sm font-medium ${text}`}>Privacidade e segurança</p>
          </div>
          <ChevronRight size={16} className={muted} />
        </button>
      </div>

      {/* Danger */}
      <div className={`${card} mb-8`}>
        <button onClick={onLogout} className={`w-full ${rowClass}`}>
          <p className="text-sm font-medium text-rose-500">Sair da conta</p>
          <ChevronRight size={16} className="text-rose-400" />
        </button>
      </div>
    </div>
  );
};

export default Profile;
