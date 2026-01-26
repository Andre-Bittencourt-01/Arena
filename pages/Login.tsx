import React from 'react';
import { Screen } from '../App';

interface LoginProps {
  onLogin: () => void;
  onNavigate: (screen: Screen) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center items-center font-display bg-[#221010] text-white">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCA6c_kHAjo4v5J9dz08M8luixki67_Cb9qKrsnZhZ80Ghjkaa_b_j32nSPrbuBDeD8sPcKIfozGoWLOFb2cZOuZn-Ehg5cEIQfqZGh5gQZCmCHC8u2cBImtnFPQqCoGVJQlgWNe7MeXzHyRCIoDlJPLgNKCSWUTe-IHwtwNJyEf9j6jYmbq_8y4duyu6CD2FOBnKRMOQtD8pdDE9A4bJKx7wLk1aPd8dVebNQo1dGlguyXN1i_jNSGT2GbQe7E36LhhyHBDfnRwAMd")` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[480px] p-4 flex flex-col items-center animate-fade-in">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary text-4xl">sports_mma</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none text-white drop-shadow-xl italic">
            ARENA MMA
          </h1>
          <p className="text-[#b99d9d] font-medium mt-2 tracking-wide uppercase text-sm">Onde a luta começa</p>
        </div>

        <div className="w-full bg-[#180a0a]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-2xl font-bold text-white">Bem-vindo de volta</h2>
            <p className="text-gray-400 text-sm mt-1">Insira suas credenciais para entrar no octógono.</p>
          </div>

          <div className="p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-300 ml-1" htmlFor="email">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors">mail</span>
                </div>
                <input
                  className="w-full h-14 pl-12 pr-4 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 font-normal"
                  id="email"
                  placeholder="seu@email.com"
                  type="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-300 ml-1" htmlFor="password">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input
                  className="w-full h-14 pl-12 pr-12 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 font-normal"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                />
                <button className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input className="w-4 h-4 rounded border-gray-600 bg-black/40 text-primary focus:ring-primary focus:ring-offset-gray-900" type="checkbox" />
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Lembrar de mim</span>
              </label>
              <button
                onClick={() => onNavigate('forgot-password')}
                className="text-sm font-medium text-primary hover:text-red-400 transition-colors hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              onClick={onLogin}
              className="w-full h-14 mt-2 bg-primary hover:bg-primary-hover text-white font-bold text-lg rounded-lg shadow-[0_0_20px_rgba(236,19,19,0.3)] hover:shadow-[0_0_30px_rgba(236,19,19,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 uppercase tracking-wider flex items-center justify-center gap-2 group"
            >
              <span>ENTRAR</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-1">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">ou</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            {/* Google Login Button */}
            <button
              onClick={onLogin} // Mock login for now
              className="w-full h-14 bg-white hover:bg-gray-100 text-black font-bold text-base rounded-lg transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <span className="tracking-wide">Entrar com Google</span>
            </button>

          </div>

          <div className="px-8 py-4 bg-black/20 border-t border-white/5 flex justify-center">
            <p className="text-sm text-gray-400">
              Não tem uma conta?
              <button
                onClick={() => onNavigate('register')}
                className="text-white font-bold hover:text-primary hover:underline transition-all ml-1 uppercase"
              >
                Registre-se
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-6 text-xs text-gray-500 uppercase tracking-widest font-medium">
          <a className="hover:text-gray-300 transition-colors" href="#">Privacidade</a>
          <span className="text-gray-700">•</span>
          <a className="hover:text-gray-300 transition-colors" href="#">Termos</a>
          <span className="text-gray-700">•</span>
          <a className="hover:text-gray-300 transition-colors" href="#">Suporte</a>
        </div>
      </div>
    </div>
  );
};

export default Login;