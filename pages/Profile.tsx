import React from 'react';
import { Screen } from '../App';
import { useAuth } from '../contexts/AuthContext';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-500 font-condensed uppercase tracking-[0.3em] font-black italic">Carregando Perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="p-8 bg-zinc-900 border border-white/10 text-center max-w-md w-full rounded-2xl shadow-2xl">
          <span className="material-symbols-outlined text-7xl text-white/5 mb-4">account_circle</span>
          <h2 className="text-3xl font-black font-condensed uppercase text-white mb-2 italic">Acesso Restrito</h2>
          <p className="text-gray-500 mb-8 font-mono text-sm leading-relaxed">Você precisa estar autenticado para visualizar seu perfil detalhado e estatísticas de performance.</p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-primary hover:bg-primary-hover text-white font-black font-condensed uppercase py-4 rounded-xl shadow-neon transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">login</span>
            Entrar na Arena
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700">
      {/* Profile Header */}
      <section className="bg-zinc-900/50 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #ec1313 0%, transparent 25%)' }}></div>
        <div className="p-6 md:p-10 flex flex-col md:flex-row items-center md:items-center gap-8 relative z-10">
          <div className="relative flex-shrink-0 group">
            <div className="size-32 md:size-44 rounded-2xl border-2 border-primary/30 overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}>
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            {user.isYoutubeMember && (
              <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-black font-condensed px-3 py-1 rounded-lg uppercase tracking-widest shadow-neon-sm animate-bounce">
                PRO MEMBER
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-5xl md:text-7xl font-black font-condensed uppercase leading-none tracking-tighter text-white mb-2 italic">
                  {user.name.split(' ')[0]} <span className="text-primary">{user.name.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-white/40 text-lg font-medium font-mono mb-6 tracking-tight">{user.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/10 backdrop-blur-md">
                    <span className="material-symbols-outlined !text-sm text-primary">verified</span> Verificado
                  </span>
                  <span className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/10 backdrop-blur-md">
                    <span className="material-symbols-outlined !text-sm text-primary">calendar_month</span> Temporada 2026
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onNavigate('story')}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white transition-all rounded-xl h-14 px-8 font-black font-condensed uppercase tracking-widest text-lg shadow-neon active:scale-95"
                >
                  <span className="material-symbols-outlined">share</span>
                  Compartilhar
                </button>
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all rounded-xl h-14 px-6 font-black font-condensed uppercase tracking-widest text-sm border border-white/10 active:scale-95"
                >
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  Atleta
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-zinc-900 border border-white/5 p-8 rounded-3xl relative overflow-hidden transition-all hover:border-primary/30">
          <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <span className="material-symbols-outlined !text-[180px]">trophy</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary"></span>
              Pontos Totais
            </h3>
            <div className="flex items-baseline gap-1">
              <p className="text-7xl font-black font-condensed text-white tracking-tighter italic">{user.points}</p>
              <span className="text-sm font-black text-primary uppercase italic">pts</span>
            </div>
          </div>
        </div>

        <div className="group bg-zinc-900 border border-white/5 p-8 rounded-3xl relative overflow-hidden transition-all hover:border-primary/30">
          <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <span className="material-symbols-outlined !text-[180px]">leaderboard</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary"></span>
              Ranking Mensal
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <p className="text-7xl font-black font-condensed text-white tracking-tighter italic">{user.monthlyPoints}</p>
              <span className="text-sm font-black text-primary uppercase italic">pts</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border font-display ${user.monthlyRankDelta >= 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              <span className="material-symbols-outlined !text-sm font-bold">{user.monthlyRankDelta >= 0 ? 'trending_up' : 'trending_down'}</span>
              {user.monthlyRankDelta >= 0 ? '+' : ''}{user.monthlyRankDelta} Posições
            </div>
          </div>
        </div>

        <div className="group bg-zinc-900 border border-white/5 p-8 rounded-3xl relative overflow-hidden transition-all hover:border-primary/30">
          <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <span className="material-symbols-outlined !text-[180px]">military_tech</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary"></span>
              Performance Anual
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-primary italic">#</span>
              <p className="text-7xl font-black font-condensed text-white tracking-tighter italic">{user.yearlyRankDelta || 0}</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-4 italic">Atualizado hoje via MetaData</p>
          </div>
        </div>
      </section>

      {/* Footer / Logout */}
      <section className="pt-8 flex justify-center">
        <button
          onClick={logout}
          className="text-white/20 hover:text-red-500 font-condensed font-black uppercase tracking-[0.5em] text-xs transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Encerrar Sessão
        </button>
      </section>
    </div>
  );
};

export default Profile;