import React from 'react';
import { Screen } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext'; // Assuming useData needs to be imported

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user, login_loading, logout } = useAuth();
  const { user_stats, loading: data_loading } = useData();

  const loading = login_loading || data_loading;

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
          <div className="relative group">
            <div className="size-24 sm:size-32 bg-zinc-800 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-black relative overflow-hidden group-hover:ring-primary/60 transition-all duration-500">
              <img src={user.avatar_url || '/placeholder-avatar.png'} alt={user.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            {user.is_youtube_member && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-black z-10 animate-bounce">
                <span className="material-symbols-outlined text-sm sm:text-lg">youtube_activity</span>
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-zinc-900/50 p-3 sm:p-5 rounded-xl border border-white/5 flex flex-col items-center justify-center">
              <span className="text-white/40 text-[10px] sm:text-xs uppercase font-black tracking-widest mb-1 sm:mb-2">Vitórias</span>
              <span className="text-2xl sm:text-4xl font-display font-black text-white">{user_stats?.correct_picks || 0}</span>
            </div>
            <div className="bg-zinc-900/50 p-3 sm:p-5 rounded-xl border border-white/5 flex flex-col items-center justify-center">
              <span className="text-white/40 text-[10px] sm:text-xs uppercase font-black tracking-widest mb-1 sm:mb-2">Pontos Totais</span>
              <span className="text-2xl sm:text-4xl font-display font-black text-primary">{user.points || 0}</span>
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
              <p className="text-7xl font-black font-condensed text-white tracking-tighter italic">{user.monthly_points}</p>
              <span className="text-sm font-black text-primary uppercase italic">pts</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border font-display ${user.monthly_rank_delta >= 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              <span className="material-symbols-outlined !text-sm font-bold">{user.monthly_rank_delta >= 0 ? 'trending_up' : 'trending_down'}</span>
              {user.monthly_rank_delta >= 0 ? '+' : ''}{user.monthly_rank_delta} Posições
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
              <p className="text-7xl font-black font-condensed text-white tracking-tighter italic">{user.yearly_rank_delta || 0}</p>
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