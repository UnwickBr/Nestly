import { useState, type FC } from 'react';
import { Home, Mail, Lock, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth: FC = () => {
  const { login, register, error, clearError } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bg = darkMode ? 'glass-shell-dark' : 'glass-shell-light';
  const muted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputClass = `w-full pl-10 pr-3 py-2.5 rounded-xl text-sm border backdrop-blur-md outline-none transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-gray-200 focus:border-blue-400/60 placeholder:text-gray-600' : 'bg-white/40 border-white/60 text-gray-800 focus:border-blue-400 placeholder:text-gray-400'}`;

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const ok = mode === 'login' ? await login(email, password) : await register(name, email, password);
    setSubmitting(false);
    if (ok) { setPassword(''); }
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    clearError();
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 ${bg}`}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-white/40 text-gray-600'}`}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className={`w-full max-w-sm rounded-2xl border backdrop-blur-2xl p-6 shadow-2xl animate-slide-in ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/50 border-white/60'}`}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 mb-3">
            <Home size={22} color="white" />
          </div>
          <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nestly</h1>
          <p className={`text-xs mt-0.5 ${muted}`}>Planeje sua casa com quem você ama</p>
        </div>

        <div className={`flex items-center gap-1 p-1 rounded-xl border backdrop-blur-md mb-5 ${darkMode ? 'border-white/10 bg-white/5' : 'border-white/60 bg-white/40'}`}>
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'login' ? 'bg-blue-600 text-white' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Entrar
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'register' ? 'bg-blue-600 text-white' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Criar conta
          </button>
        </div>

        <form
          className="space-y-3"
          onSubmit={e => { e.preventDefault(); submit(); }}
        >
          {mode === 'register' && (
            <div className="relative">
              <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
              <input className={inputClass} placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="relative">
            <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
            <input type="email" className={inputClass} placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
            <input type="password" className={inputClass} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-60"
          >
            {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className={`text-xs text-center mt-5 ${muted}`}>
          {mode === 'login' ? 'Depois de entrar, convide seu cônjuge pelo Perfil.' : 'Após criar sua conta, você poderá convidar seu cônjuge pelo Perfil.'}
        </p>
      </div>
    </div>
  );
};

export default Auth;
