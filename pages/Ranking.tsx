import React from 'react';
import { useData } from '../contexts/DataContext';

const Ranking: React.FC = () => {
  const { leaderboard, user: currentUser, rankingFilter, setRankingFilter } = useData();

  // Top 3 for Podium
  const top3 = leaderboard.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  // Rest of the list (excluding top 3)
  const rankingList = leaderboard.slice(3);

  // Current user's rank and data
  const currentUserIndex = leaderboard.findIndex(u => u.id === currentUser?.id);
  const currentUserData = currentUserIndex !== -1 ? leaderboard[currentUserIndex] : null;

  // Get the points based on current filter for display in podium
  const getFilteredPoints = (user: any) => {
    if (!user) return 0;
    switch (rankingFilter) {
      case 'week': return user.last_event_points || 0;
      case 'month': return user.monthly_points || 0;
      case 'year': return user.yearly_points || 0;
      default: return user.points || 0;
    }
  };

  const periodLabel = {
    'week': 'Último Evento',
    'month': 'Performance Mensal',
    'year': 'Performance Anual',
    'all': 'Ranking Geral'
  }[rankingFilter as string || 'all'] || 'Ranking';

  const renderPerformance = (user: any) => {
    if (rankingFilter === 'week') return null;

    const delta = rankingFilter === 'month' ? user.monthly_rank_delta : user.yearly_rank_delta;

    if (delta === undefined) return (
      <div className="flex items-center gap-1 text-white/10 font-mono text-[10px] tracking-tighter">
        <span className="material-symbols-outlined text-xs">horizontal_rule</span>
        <span>NOVO</span>
      </div>
    );

    // 03 - Aumento de 80% nos dados de progresso
    if (delta > 0) {
      return (
        <div className="flex items-center gap-3 text-green-400 group-hover:text-green-300 transition-colors">
          <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <span className="material-symbols-outlined text-3xl font-bold">trending_up</span>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-display font-black text-3xl">+{delta}</span>
            <span className="text-[10px] font-mono uppercase tracking-tighter opacity-60 font-black">Subiu</span>
          </div>
        </div>
      );
    } else if (delta < 0) {
      return (
        <div className="flex items-center gap-3 text-red-500 group-hover:text-red-400 transition-colors">
          <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <span className="material-symbols-outlined text-3xl font-bold">trending_down</span>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-display font-black text-3xl">{delta}</span>
            <span className="text-[10px] font-mono uppercase tracking-tighter opacity-60 font-black">Caiu</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3 text-white/30 transition-colors">
          <div className="size-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <span className="material-symbols-outlined text-2xl">drag_handle</span>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-display font-black text-2xl">---</span>
            <span className="text-[10px] font-mono uppercase tracking-tighter opacity-60 font-black">Estável</span>
          </div>
        </div>
      );
    }
  };

  const renderUserRow = (user: any, index: number, isHighlight: boolean = false) => {
    const rank = index + 1;
    const isCurrentUser = currentUser && user.id === currentUser.id;
    const displayPoints = getFilteredPoints(user);

    return (
      <div
        key={`${isHighlight ? 'highlight-' : ''}${user.id}`}
        className={`group grid grid-cols-12 gap-0 px-8 py-8 items-center transition-all duration-300 relative overflow-hidden ${isHighlight ? 'bg-zinc-900 border-2 border-primary/40 rounded-xl mb-12 shadow-[0_0_40px_rgba(236,19,19,0.15)] ring-1 ring-white/5' : (isCurrentUser ? 'bg-primary/5' : 'hover:bg-white/[0.04]')}`}
      >
        {isCurrentUser && !isHighlight && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_20px_rgba(236,19,19,0.5)]"></div>}

        {/* Rank - Mesma cor da pontuação */}
        <div className={`col-span-1 text-center font-display text-4xl sm:text-5xl font-black italic tracking-tighter transition-all ${isHighlight || isCurrentUser ? 'text-primary scale-110 drop-shadow-[0_0_10px_rgba(236,19,19,0.2)]' : 'text-white/90 group-hover:text-primary group-hover:scale-105'}`}>
          {rank.toString().padStart(2, '0')}
        </div>

        {/* Progresso - Em Português com tamanho aumentado */}
        <div className="col-span-3 flex justify-center border-l border-white/5 h-20 items-center">
          {renderPerformance(user)}
        </div>

        {/* Competidor */}
        <div className="col-span-5 flex items-center gap-6 pl-10 border-l border-white/5 h-20">
          <div className={`size-16 bg-zinc-800 flex-shrink-0 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 ${isHighlight || isCurrentUser ? 'ring-2 ring-primary ring-offset-4 ring-offset-zinc-900 shadow-2xl shadow-primary/30' : 'border border-white/10 shadow-xl'}`} style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}>
            <img alt={user.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity" src={user.avatar_url} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3">
              <span className={`font-condensed font-bold uppercase tracking-tight text-2xl sm:text-3xl truncate ${isHighlight || isCurrentUser ? 'text-primary' : 'text-white/90 group-hover:text-white'}`}>{user.name}</span>
              {(isHighlight || isCurrentUser) && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] bg-primary text-white px-2.5 py-1 rounded-[2px] font-black tracking-[0.2em] flex-shrink-0 uppercase animate-pulse">ELITE_ARENA</span>
                </div>
              )}
            </div>
            <span className={`text-[11px] font-mono opacity-20 group-hover:opacity-40 transition-opacity hidden md:block uppercase tracking-widest font-bold ${isHighlight || isCurrentUser ? 'text-primary' : 'text-white'}`}>Token_Verificação // #{user.id.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>

        {/* Pontuação */}
        <div className="col-span-3 text-right pr-10 border-l border-white/5 h-20 flex flex-col justify-center">
          <div className={`font-display text-5xl sm:text-6xl font-black tracking-tighter leading-none ${isHighlight || isCurrentUser ? 'text-primary' : 'text-white group-hover:text-primary transition-colors'}`}>
            {displayPoints}
          </div>
          <div className={`text-[10px] font-mono uppercase tracking-[0.4em] opacity-30 mt-1 font-black ${isHighlight || isCurrentUser ? 'text-primary' : ''}`}>
            {rankingFilter === 'week' ? 'Pts Evento' : 'Acumulado'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-10 font-display scroll-smooth">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-6 bg-primary"></span>
              <span className="w-1.5 h-4 bg-primary/40 mt-1"></span>
              <span className="w-1.5 h-2 bg-primary/20 mt-2"></span>
            </div>
            <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase font-black">ANÁLISE_PERFORMANCE // SISTEMA_GLADIADOR</span>
          </div>
          <h2 className="font-condensed text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white italic">
            Elite <span className="text-primary drop-shadow-[0_0_15px_rgba(236,19,19,0.3)]">Gladiador</span>
          </h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex bg-zinc-900 border border-white/10 p-2 rounded-xl scale-90 sm:scale-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {[
            { id: 'week', label: 'Evento' },
            { id: 'month', label: 'Mensal' },
            { id: 'year', label: 'Anual' }
          ].map((btn, i) => (
            <React.Fragment key={btn.id}>
              {i > 0 && <div className="w-px bg-white/5 my-2 mx-1"></div>}
              <button
                onClick={() => setRankingFilter(btn.id as any)}
                className={`px-6 sm:px-8 py-3 font-condensed text-xs sm:text-sm uppercase font-black tracking-[0.2em] transition-all rounded-lg ${rankingFilter === btn.id ? 'bg-primary text-white scale-105 shadow-2xl shadow-primary/40' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
              >
                {btn.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mb-20 mt-4 relative z-20">
        <h3 className="font-condensed text-xl text-white uppercase tracking-[0.3em] font-black flex items-center gap-4 border-l-4 border-primary pl-6">
          <span className="material-symbols-outlined text-primary text-2xl animate-pulse">military_tech</span> Pódio de Elite: {periodLabel}
        </h3>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end px-4 mt-12 relative z-10">
        {/* Silver */}
        <div className="order-2 md:order-1 bg-card-dark border border-white/10 relative group hover:border-silver/50 transition-all duration-300 clip-corner">
          <div className="absolute top-0 left-0 w-full h-1 bg-silver"></div>
          <div className="p-8 flex flex-col items-center">
            <div className="text-silver font-condensed text-8xl font-black opacity-10 absolute top-4 right-4 z-0 italic leading-none">02</div>
            {second && (
              <>
                <div className="relative z-10 mb-6">
                  <div className="size-52 overflow-hidden border-2 border-silver/30 rotate-1 group-hover:rotate-0 transition-transform" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    <img alt="2nd" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={second.avatar_url} />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-silver text-black font-condensed text-xs font-black px-4 py-1.5 uppercase tracking-[0.3em]">PRATA</div>
                </div>
                <div className="text-center z-10 w-full">
                  <h4 className="font-condensed text-3xl uppercase tracking-tighter text-white font-black">{second.name}</h4>
                  <div className="flex items-center justify-center gap-6 border-t border-white/5 pt-5 mt-4">
                    <div className="text-center">
                      <div className="text-[11px] text-white/30 uppercase tracking-widest font-black mb-1">Pontos</div>
                      <div className="font-display text-5xl text-silver font-black leading-none tracking-tighter">{getFilteredPoints(second)}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gold */}
        <div className="order-1 md:order-2 bg-zinc-900 border border-gold/40 relative group hover:border-gold transition-all duration-500 transform md:-translate-y-10 shadow-[0_30px_90px_rgba(255,215,0,0.15)] clip-corner scale-105">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold/50 via-gold to-gold/50"></div>
          <div className="p-10 flex flex-col items-center">
            <div className="text-gold font-condensed text-9xl font-black opacity-10 absolute top-6 right-8 z-0 italic leading-none">01</div>
            <span className="material-symbols-outlined text-gold text-5xl absolute top-6 left-8 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]">workspace_premium</span>
            {first && (
              <>
                <div className="relative z-10 mb-8">
                  <div className="size-72 overflow-hidden border-2 border-gold/50 -rotate-1 group-hover:rotate-0 transition-transform shadow-[0_0_40px_rgba(255,215,0,0.2)]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    <img alt="1st" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={first.avatar_url} />
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gold text-black font-condensed text-sm font-black px-8 py-2 uppercase tracking-[0.4em] italic shadow-2xl">CAMPEÃO</div>
                </div>
                <div className="text-center z-10 w-full mb-4">
                  <h4 className="font-condensed text-4xl uppercase tracking-tighter text-white font-black leading-none mb-2">{first.name}</h4>
                  <div className="font-mono text-[11px] text-gold/60 uppercase tracking-[0.4em] font-black underline decoration-gold/30 underline-offset-8">PODER_MÁXIMO</div>
                  <div className="border-t border-white/10 pt-8 mt-10">
                    <div className="text-[12px] text-white/30 uppercase tracking-[0.5em] font-black mb-3">Ranking_Oficial</div>
                    <div className="font-display font-black text-8xl text-gold leading-none tracking-[calc(-0.05em)] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">{getFilteredPoints(first)}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bronze */}
        <div className="order-3 md:order-3 bg-card-dark border border-white/10 relative group hover:border-bronze/50 transition-all duration-300 clip-corner">
          <div className="absolute top-0 left-0 w-full h-1 bg-bronze"></div>
          <div className="p-8 flex flex-col items-center">
            <div className="text-bronze font-condensed text-8xl font-black opacity-10 absolute top-4 right-4 z-0 italic leading-none">03</div>
            {third && (
              <>
                <div className="relative z-10 mb-6">
                  <div className="size-52 overflow-hidden border-2 border-bronze/30 -rotate-1 group-hover:rotate-0 transition-transform" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    <img alt="3rd" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={third.avatar_url} />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-bronze text-white font-condensed text-xs font-black px-4 py-1.5 uppercase tracking-[0.3em]">BRONZE</div>
                </div>
                <div className="text-center z-10 w-full">
                  <h4 className="font-condensed text-3xl uppercase tracking-tighter text-white font-black">{third.name}</h4>
                  <div className="flex items-center justify-center gap-6 border-t border-white/5 pt-5 mt-4">
                    <div className="text-center">
                      <div className="text-[11px] text-white/30 uppercase tracking-widest font-black mb-1">Pontos</div>
                      <div className="font-display font-black text-5xl text-bronze font-black leading-none tracking-tighter">{getFilteredPoints(third)}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 01 - Highlight Box for Current User - AGORA ABAIXO DO PODIUM */}
      {currentUserData && (
        <div className="animate-in fade-in slide-in-from-left duration-1000 relative mb-16 px-4">
          <div className="absolute -left-4 top-0 bottom-12 w-1 bg-primary/40 rounded-full blur-sm"></div>
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="size-10 bg-primary/20 border border-primary/40 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">person_search</span>
            </div>
            <div>
              <h3 className="font-condensed text-2xl text-white uppercase tracking-widest font-black italic">Sua <span className="text-primary">Posição</span></h3>
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Consulte sua métrica atual sem navegar na tabela principal</p>
            </div>
          </div>
          {renderUserRow(currentUserData, currentUserIndex, true)}
        </div>
      )}

      {/* Tabela de Performance */}
      <div className="mb-8 flex items-center justify-between px-2">
        <h3 className="font-condensed text-2xl text-white uppercase tracking-[0.3em] font-black flex items-center gap-4 italic border-l-4 border-primary pl-6">
          <span className="material-symbols-outlined text-primary text-3xl">list_alt</span> TABELA DE PERFORMANCE
        </h3>
      </div>

      <div className="flex flex-col border border-white/10 bg-zinc-900/40 backdrop-blur-3xl overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-40"></div>

        {/* 02 - Cabeçalhos Ajustados para Harmonia Estética */}
        <div className="grid grid-cols-12 gap-0 px-8 py-12 bg-black/80 border-b-2 border-primary/20 text-xl font-condensed text-white/40 uppercase tracking-[0.4em] font-black z-30 sticky top-0 backdrop-blur-xl">
          <div className="col-span-1 text-center border-r border-white/5">Ranking</div>
          <div className="col-span-3 text-center border-r border-white/5 text-primary/60">Progresso</div>
          <div className="col-span-5 flex items-center pl-10 border-r border-white/5 uppercase">Competidor</div>
          <div className="col-span-3 text-right pr-10 uppercase tracking-[0.5em] font-black text-white/70">Pontuação</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/10 relative z-10 border-t border-white/5">
          {leaderboard.length > 0 ? (
            leaderboard.map((user, index) => renderUserRow(user, index))
          ) : (
            <div className="py-40 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-white/5 text-9xl mb-8 animate-pulse">database_off</span>
              <div className="text-white/20 font-condensed italic text-2xl tracking-[0.4em] uppercase font-black">SISTEMA_SEM_RESPOSTA // DADOS_NÃO_LOCALIZADOS</div>
            </div>
          )}
        </div>

        <div className="p-12 text-center text-white/5 text-[11px] font-mono border-t border-white/5 uppercase tracking-[0.7em] bg-black/60 font-black">
          STATUS_MOTOR: ONLINE // CONEXÃO_SEGURA // v1.0.4.7_ELITE
        </div>
      </div>
      <div className="h-40"></div>
    </div>
  );
};

export default Ranking;