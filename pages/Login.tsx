import React, { useState } from 'react';
import { Screen } from '../App';
import { useData } from '../contexts/DataContext';

interface LoginProps {
  onLogin: () => void;
  onNavigate: (screen: Screen) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const { login } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    // Development bypass: if email and password are empty, use default credentials
    const loginEmail = email.trim() === '' ? 'andre@arena.com' : email;
    const loginPassword = password.trim() === '' ? 'a' : password;

    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        onLogin();
      } else {
        setError('Credenciais inválidas. Tente admin@arenamma.com / admin123');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-[100dvh] w-full flex flex-col justify-center items-center font-display bg-[#221010] text-white overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCA6c_kHAjo4v5J9dz08M8luixki67_Cb9qKrsnZhZ80Ghjkaa_b_j32nSPrbuBDeD8sPcKIfozGoWLOFb2cZOuZn-Ehg5cEIQfqZGh5gQZCmCHC8u2cBImtnFPQqCoGVJQlgWNe7MeXzHyRCIoDlJPLgNKCSWUTe-IHwtwNJyEf9j6jYmbq_8y4duyu6CD2FOBnKRMOQtD8pdDE9A4bJKx7wLk1aPd8dVebNQo1dGlguyXN1i_jNSGT2GbQe7E36LhhyHBDfnRwAMd")` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[400px] px-4 flex flex-col items-center animate-fade-in h-full justify-center">

        {/* Header - Compact */}
        <div className="mb-4 text-center shrink-0">
          <div className="inline-flex items-center justify-center p-2 mb-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary text-3xl">sports_mma</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter leading-none text-white drop-shadow-xl italic">
            ARENA MMA
          </h1>
          <p className="text-[#b99d9d] font-medium mt-1 tracking-wide uppercase text-xs">Onde a luta começa</p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-[#180a0a]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden shrink-0">
          <div className="px-6 pt-5 pb-2 border-b border-white/5 bg-black/20">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Login</h2>
          </div>

          <div className="p-5 flex flex-col gap-3">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-xs p-2 rounded flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider" htmlFor="email">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-500 text-lg group-focus-within:text-primary transition-colors">mail</span>
                </div>
                <input
                  className="w-full h-10 pl-10 pr-4 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-normal"
                  id="email"
                  placeholder="seu@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider" htmlFor="password">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-500 text-lg group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input
                  className="w-full h-10 pl-10 pr-10 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-normal"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">visibility_off</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input className="w-3 h-3 rounded border-gray-600 bg-black/40 text-primary focus:ring-primary focus:ring-offset-gray-900" type="checkbox" />
                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Lembrar</span>
              </label>
              <button
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-medium text-primary hover:text-red-400 transition-colors hover:underline"
              >
                Esqueci a senha
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-10 mt-1 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-lg shadow-[0_0_15px_rgba(236,19,19,0.3)] hover:shadow-[0_0_20px_rgba(236,19,19,0.4)] transition-all uppercase tracking-wider flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <span className="material-symbols-outlined text-base">arrow_forward</span>}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] text-gray-500 uppercase font-bold tracking-widest">Ou continue com</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Google */}
              <button
                onClick={() => onLogin()}
                className="h-10 bg-white hover:bg-gray-100 text-black font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <div className="w-4 h-4">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                Google
              </button>

              {/* Apple */}
              <button
                onClick={() => onLogin()}
                className="h-10 bg-black border border-white/20 hover:bg-white/10 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <div className="w-4 h-4 text-white">
                  <svg viewBox="0 0 384 512" fill="currentColor" className="w-full h-full">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                  </svg>
                </div>
                Apple
              </button>
            </div>
          </div>

          <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex justify-center">
            <p className="text-xs text-gray-400">
              Novo no Arena?
              <button
                onClick={() => onNavigate('register')}
                className="text-white font-bold hover:text-primary hover:underline transition-all ml-1 uppercase tracking-wide"
              >
                Registrar
              </button>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-4 flex gap-4 text-[10px] text-gray-600 uppercase tracking-widest font-medium shrink-0">
          <a className="hover:text-gray-400 transition-colors cursor-pointer">Privacidade</a>
          <span className="text-gray-800">•</span>
          <a className="hover:text-gray-400 transition-colors cursor-pointer">Suporte</a>
        </div>
      </div>
    </div>
  );
};

export default Login;