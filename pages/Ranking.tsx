import React from 'react';
import { useData } from '../contexts/DataContext';

const Ranking: React.FC = () => {
  const {
    leaderboard,
    user: currentUser,
    rankingFilter,
    setRankingFilter,
    events,
    selectedPeriodId,
    setSelectedPeriodId
  } = useData();

  const [showSelector, setShowSelector] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [dropdownTop, setDropdownTop] = React.useState(0);



  // Handle click outside to close dropdown
  React.useEffect(() => {
    if (!showSelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelector]);

  // Calculate dropdown top position when button is clicked
  React.useEffect(() => {
    if (showSelector && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownTop(rect.bottom + 8);
    }
  }, [showSelector]);


  // Top 3 for Podium
  const top3 = leaderboard.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  // Current user's rank and data
  const currentUserIndex = leaderboard.findIndex(u => u.id === currentUser?.id);
  // Use fallback to currentUser if not in leaderboard, ensuring the row always renders
  const currentUserData = currentUserIndex !== -1 ? leaderboard[currentUserIndex] : currentUser;

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
    // If index is -1 (not in leaderboard), show "-" or special rank
    const rank = index === -1 ? '---' : (index + 1).toString().padStart(2, '0');
    const isCurrentUser = currentUser && user?.id === currentUser.id;
    const displayPoints = getFilteredPoints(user);

    if (!user) return null;

    return (
      <div
        key={`${isHighlight ? 'highlight-' : ''}${user.id}`}
        className={`group grid grid-cols-12 gap-0 px-2 sm:px-8 py-0 h-[50px] sm:h-16 transition-all duration-300 relative overflow-hidden items-center ${isHighlight ? 'bg-zinc-900 border-2 border-primary/40 rounded-xl mb-2 sm:mb-4 shadow-[0_0_40px_rgba(236,19,19,0.15)] ring-1 ring-white/5 mx-0 sm:mx-0' : (isCurrentUser ? 'bg-primary/5' : 'hover:bg-white/[0.04]')}`}
      >
        {isCurrentUser && !isHighlight && <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-primary shadow-[0_0_20px_rgba(236,19,19,0.5)]"></div>}

        {/* Rank Column */}
        <div className="col-span-2 sm:col-span-1 flex justify-center">
          <div className={`font-display text-xl sm:text-3xl font-black italic tracking-tighter transition-all ${isHighlight || isCurrentUser ? 'text-primary scale-110 drop-shadow-[0_0_10px_rgba(236,19,19,0.2)]' : 'text-white/90 group-hover:text-primary group-hover:scale-105'}`}>
            {rank}
          </div>
        </div>

        {/* Progress - Always render container to maintain grid alignment, but hide content if week */}
        <div className="flex col-span-2 sm:col-span-3 justify-center sm:border-l border-white/5 sm:h-12 items-center shrink-0">
          {rankingFilter !== 'week' && <div className="scale-75 sm:scale-100 origin-center">{renderPerformance(user)}</div>}
        </div>

        {/* Competitor Column - Fixed Span 6/5 regardless of filter */}
        <div className="col-span-6 sm:col-span-5 flex items-center justify-start pl-4 sm:pl-8 sm:border-l border-white/5 sm:h-12 px-2 overflow-hidden">
          <div className="flex items-center justify-start gap-2 sm:gap-4 w-full max-w-[280px]">
            {/* Avatar visible? Yes, keeping it. */}
            <div className={`size-8 sm:size-10 bg-zinc-800 flex-shrink-0 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 ${isHighlight || isCurrentUser ? 'ring-1 sm:ring-2 ring-primary ring-offset-1 sm:ring-offset-2 ring-offset-zinc-900 shadow-xl shadow-primary/30' : 'border border-white/10 shadow-lg'}`} style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}>
              <img alt={user.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity" src={user.avatar_url} />
            </div>
            <div className="flex flex-col min-w-0 items-start text-left">
              <div className="flex items-center gap-2 justify-start">
                <span className={`font-condensed font-bold uppercase tracking-tight text-sm sm:text-2xl truncate ${isHighlight || isCurrentUser ? 'text-primary' : 'text-white/90 group-hover:text-white'}`}>{user.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Points Column */}
        <div className="col-span-2 sm:col-span-3 text-center sm:text-right sm:pr-10 sm:border-l border-white/5 sm:h-12 flex flex-col justify-center items-center sm:items-end">
          <div className={`font-display text-xl sm:text-4xl font-black tracking-tighter leading-none ${isHighlight || isCurrentUser ? 'text-primary' : 'text-white group-hover:text-primary transition-colors'}`}>
            {displayPoints}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-0 font-display scroll-smooth pb-20 sm:pb-8">
      {/* Sticky Header & Banner Section */}
      <div className="sticky top-0 md:top-0 z-40 bg-background-dark/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 pt-0 sm:pt-0 pb-0 sm:pb-0 mb-0 md:mb-0 border-b border-white/5">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4 mb-1 sm:mb-1 border-b border-white/5 pb-1 sm:pb-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <span className="w-1 h-3.5 sm:h-4 bg-primary"></span>
                <span className="w-1 h-2.5 sm:h-3 bg-primary/40 mt-0.5"></span>
                <span className="w-1 h-1.5 sm:h-2 bg-primary/20 mt-1"></span>
              </div>
              <span className="font-mono text-[8px] sm:text-[9px] text-primary tracking-[0.4em] uppercase font-black">ANÁLISE // SISTEMA_GLADIADOR</span>
            </div>
            <h2 className="font-condensed text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-white italic">
              Elite <span className="text-primary drop-shadow-[0_0_15px_rgba(236,19,19,0.3)]">Gladiador</span>
            </h2>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar pb-1">
            <div className="flex flex-nowrap items-center gap-2 sm:gap-4 min-w-max">
              {/* Filter Buttons */}
              <div className="flex bg-zinc-900 border border-white/10 p-1.5 sm:p-2 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] shrink-0">
                {[
                  { id: 'week', label: 'Último Evento' },
                  { id: 'month', label: 'Mensal' },
                  { id: 'year', label: 'Anual' }
                ].map((btn, i) => (
                  <React.Fragment key={btn.id}>
                    {i > 0 && <div className="w-px bg-white/5 my-2 mx-1 shrink-0"></div>}
                    <button
                      onClick={() => setRankingFilter(btn.id as any)}
                      className={`px-4 sm:px-8 py-2 sm:py-3 font-condensed text-[10px] sm:text-sm uppercase font-black tracking-widest transition-all rounded-lg shrink-0 ${rankingFilter === btn.id ? 'bg-primary text-white scale-105 shadow-2xl shadow-primary/40' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                    >
                      {btn.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Period Selector */}
              <div className="relative shrink-0">
                <button
                  ref={buttonRef}
                  onClick={() => setShowSelector(!showSelector)}
                  className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-xl border transition-all duration-300 ${showSelector ? 'bg-primary border-primary text-white shadow-lg shadow-primary/40' : 'bg-zinc-900 border-white/10 text-white/60 hover:text-white hover:border-white/30'}`}
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">history</span>
                  <span className="font-condensed font-bold uppercase tracking-widest text-xs sm:text-sm">
                    {rankingFilter === 'week' ? 'Outros Eventos' : rankingFilter === 'month' ? 'Outros Meses' : rankingFilter === 'year' ? 'Outros Anos' : 'Outros'}
                  </span>
                  <span className={`material-symbols-outlined text-sm transition-transform ${showSelector ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {showSelector && (
                  <>
                    {/* Backdrop overlay on mobile */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden" onClick={() => setShowSelector(false)} />

                    <div
                      ref={dropdownRef}
                      className="fixed left-4 right-4 sm:left-auto sm:right-4 sm:w-72 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-200"
                      style={{
                        top: `${dropdownTop}px`,
                        maxHeight: 'calc(100vh - 100px)'
                      }}
                    >
                      <div className="mb-4 pb-2 border-b border-white/5">
                        <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Arquivo // Historico</span>
                      </div>
                      <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {rankingFilter === 'week' ? (
                          events.filter(e => e.status === 'completed').map(event => (
                            <button
                              key={event.id}
                              onClick={() => { setSelectedPeriodId(event.id); setShowSelector(false); }}
                              className={`w-full text-left px-4 py-3 rounded-lg font-condensed text-sm uppercase font-bold tracking-wider transition-colors ${selectedPeriodId === event.id ? 'bg-primary/20 text-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                            >
                              {event.title} - {event.subtitle}
                            </button>
                          ))
                        ) : rankingFilter === 'month' ? (
                          [...Array(12)].map((_, i) => {
                            const monthId = `2026-${(i + 1).toString().padStart(2, '0')}`;
                            const monthName = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i];
                            return (
                              <button
                                key={monthId}
                                onClick={() => { setSelectedPeriodId(monthId); setShowSelector(false); }}
                                className={`w-full text-left px-4 py-3 rounded-lg font-condensed text-sm uppercase font-bold tracking-wider transition-colors ${selectedPeriodId === monthId ? 'bg-primary/20 text-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                              >
                                Performance {monthName} 2026
                              </button>
                            );
                          })
                        ) : (
                          ['2026', '2025'].map(year => (
                            <button
                              key={year}
                              onClick={() => { setSelectedPeriodId(year); setShowSelector(false); }}
                              className={`w-full text-left px-4 py-3 rounded-lg font-condensed text-sm uppercase font-bold tracking-wider transition-colors ${selectedPeriodId === year ? 'bg-primary/20 text-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                            >
                              Performance Anual {year}
                            </button>
                          ))
                        )}
                      </div>
                      <button
                        onClick={() => { setSelectedPeriodId(null); setShowSelector(false); }}
                        className="w-full mt-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-white/20 hover:text-primary transition-colors border-t border-white/5 pt-4"
                      >
                        Resetar para Atual
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Period Banner Section */}
        <div className="mb-1 sm:mb-2 relative h-10 sm:h-14 rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10"></div>
          {rankingFilter === 'week' ? (
            (() => {
              const lastCompletedEvent = events.filter(e => e.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              const event = selectedPeriodId
                ? events.find(e => e.id === selectedPeriodId)
                : lastCompletedEvent;

              return event ? (
                <>
                  <img src={event.banner_url} className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:scale-110 transition-transform duration-700" alt="Event Banner" />
                  <div className="absolute inset-0 z-20 flex items-center justify-between px-4 sm:px-8">
                    <h4 className="font-condensed text-base sm:text-xl font-black text-white italic uppercase leading-none">{event.title}</h4>
                    <p className="font-condensed text-xs sm:text-sm text-white/40 uppercase font-bold tracking-tight text-right">{event.subtitle}</p>
                  </div>
                </>
              ) : null;
            })()
          ) : (
            <>
              <div className="absolute inset-0 bg-[#1a0c0c] flex items-center justify-center -z-10 overflow-hidden">
                <span className="material-symbols-outlined text-[80px] text-white/[0.02] absolute rotate-12 -right-10">history_edu</span>
              </div>
              <div className="absolute inset-0 z-20 flex items-center justify-between px-4 sm:px-8">
                <h4 className="font-condensed text-base sm:text-xl font-black text-white italic uppercase leading-none">
                  {rankingFilter === 'month' ? (selectedPeriodId ? `Performance ${selectedPeriodId}` : 'Mês Corrente') : (selectedPeriodId ? `Ranking Anual ${selectedPeriodId}` : 'Ano Corrente')}
                </h4>
                <p className="font-condensed text-xs sm:text-sm text-white/40 uppercase font-bold tracking-tight text-right">Análise Consolidada</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-0.5 mt-1 sm:mb-2 sm:mt-2 relative z-20">
        <h3 className="font-condensed text-sm sm:text-base text-white uppercase tracking-[0.3em] font-black flex items-center gap-3 border-l-2 border-primary pl-4 truncate whitespace-nowrap overflow-hidden">
          <span className="material-symbols-outlined text-primary text-base shrink-0">military_tech</span>
          <span className="truncate">Pódio de Elite: {periodLabel}</span>
        </h3>
      </div>

      {/* Podium - Horizontal Grid on Mobile & Desktop */}
      <div className="grid grid-cols-3 gap-1 md:gap-3 mb-4 sm:mb-8 items-end px-1 sm:px-4 mt-6 sm:mt-6 relative z-10">
        {/* Silver */}
        <div className="order-1 w-full bg-card-dark border border-white/10 relative group hover:border-silver/50 transition-all duration-300 clip-corner">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-silver"></div>
          <div className="py-1 md:pt-2 md:pb-4 px-1 md:px-4 flex flex-col items-center justify-center gap-1 md:gap-4 min-h-[105px] md:min-h-auto">
            <div className="text-silver font-condensed text-3xl font-black opacity-10 absolute top-2 right-2 z-0 italic leading-none hidden md:block">02</div>
            {second && (
              <>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-12 md:size-24 overflow-hidden border border-silver/30 rotate-1 group-hover:rotate-0 transition-transform" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    <img alt="2nd" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={second.avatar_url} />
                  </div>
                  <div className="absolute -bottom-2 lg:-bottom-2 -bottom-1 left-1/2 -translate-x-1/2 bg-silver text-black font-condensed text-[6px] md:text-[8px] font-black px-2 md:px-3 py-0.5 uppercase tracking-[0.2em] whitespace-nowrap z-20">PRATA</div>
                </div>
                <div className="text-center z-10 w-full mt-2">
                  <h4 className="font-condensed text-xs md:text-lg uppercase tracking-tighter text-white font-black leading-none mb-1 truncate px-1">{second.name}</h4>
                  <div className="border-t border-white/5 pt-1 md:pt-2 mt-1 md:mt-4">
                    <div className="font-display font-black text-sm md:text-xl text-silver leading-none tracking-tight">{getFilteredPoints(second)}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gold - Peak Trophy */}
        <div className="order-2 w-full bg-zinc-900 border border-gold/40 relative group hover:border-gold transition-all duration-500 transform -translate-y-4 md:-translate-y-6 shadow-[0_20px_50px_rgba(255,215,0,0.1)] clip-corner z-20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
          <div className="py-2 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-4 min-h-[130px] md:min-h-auto">
            <div className="text-gold font-condensed text-4xl font-black opacity-10 absolute top-2 right-4 z-0 italic leading-none hidden md:block">01</div>
            <span className="material-symbols-outlined text-gold text-2xl absolute top-2 left-4 hidden md:block">workspace_premium</span>
            {first && (
              <>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-16 md:size-28 overflow-hidden border border-gold/50 -rotate-1 group-hover:rotate-0 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.1)]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    <img alt="1st" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={first.avatar_url} />
                  </div>
                  <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-gold text-black font-condensed text-[7px] md:text-[10px] font-black px-2 md:px-4 py-0.5 md:py-1 uppercase tracking-[0.3em] italic shadow-2xl whitespace-nowrap z-20">CAMPEÃO</div>
                </div>
                <div className="text-center z-10 w-full mt-2">
                  <h4 className="font-condensed text-sm md:text-xl uppercase tracking-tighter text-white font-black leading-none mb-0.5 md:mb-1 truncate px-1">{first.name}</h4>
                  <div className="font-mono text-[5px] md:text-[7px] text-gold/60 uppercase tracking-[0.4em] font-black mt-0.5 hidden sm:block">PODER_MÁXIMO</div>
                  <div className="border-t border-white/10 pt-2 md:pt-3 mt-1 md:mt-4">
                    <div className="text-[9px] text-white/30 uppercase tracking-[0.5em] font-black hidden md:block">Ranking_Oficial</div>
                    <div className="font-display font-black text-xl md:text-4xl text-gold leading-none tracking-tight">{getFilteredPoints(first)}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bronze */}
        <div className="order-3 w-full bg-card-dark border border-white/10 relative group hover:border-bronze/50 transition-all duration-300 clip-corner">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-bronze"></div>
          <div className="py-1 md:pt-2 md:pb-4 px-1 md:px-4 flex flex-col items-center justify-center gap-1 md:gap-4 min-h-[105px] md:min-h-auto">
            <div className="text-bronze font-condensed text-3xl font-black opacity-10 absolute top-2 right-2 z-0 italic leading-none hidden md:block">03</div>
            {third && (
              <>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-12 md:size-24 overflow-hidden border border-bronze/30 -rotate-1 group-hover:rotate-0 transition-transform" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    <img alt="3rd" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={third.avatar_url} />
                  </div>
                  <div className="absolute -bottom-2 lg:-bottom-2 -bottom-1 left-1/2 -translate-x-1/2 bg-bronze text-white font-condensed text-[6px] md:text-[8px] font-black px-2 md:px-3 py-0.5 uppercase tracking-[0.2em] whitespace-nowrap z-20">BRONZE</div>
                </div>
                <div className="text-center z-10 w-full mt-2">
                  <h4 className="font-condensed text-xs md:text-lg uppercase tracking-tighter text-white font-black leading-none mb-1 truncate px-1">{third.name}</h4>
                  <div className="border-t border-white/5 pt-1 md:pt-2 mt-1 md:mt-4">
                    <div className="font-display font-black text-sm md:text-xl text-bronze leading-none tracking-tight">{getFilteredPoints(third)}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Status Highlight - Compact Mobile Merged */}
      {currentUserData && (
        <div className="animate-in fade-in slide-in-from-left duration-1000 relative mb-3 sm:mb-6">
          <div className="absolute -left-4 top-0 bottom-2 w-1 bg-primary/40 rounded-full blur-sm sm:block hidden"></div>

          {/* Header visible only on desktop */}
          {/* Header visible only on desktop */}
          <div className="flex items-center gap-2 mb-1 px-2">
            <div className="size-5 bg-primary/20 border border-primary/40 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xs">person_search</span>
            </div>
            <h3 className="font-condensed text-sm sm:text-base text-white uppercase tracking-widest font-black italic">Sua <span className="text-primary">Posição</span></h3>
          </div>

          {/* Render User Row directly on mobile with no extra padding */}
          {renderUserRow(currentUserData, currentUserIndex, true)}
        </div>
      )}


      {/* Execution Table UI */}
      <div className="flex mb-1 sm:mb-2 items-center justify-between px-1 sm:px-2">
        <h3 className="font-condensed text-sm sm:text-base text-white uppercase tracking-[0.3em] font-black flex items-center gap-3 italic border-l-2 border-primary pl-4">
          <span className="material-symbols-outlined text-primary text-xl">list_alt</span> TABELA DE PERFORMANCE
        </h3>
      </div>

      <div className="flex flex-col border border-white/10 bg-zinc-900/40 backdrop-blur-3xl overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-40"></div>

        {/* Header Grid */}
        <div className="grid grid-cols-12 gap-0 px-2 sm:px-8 py-2 sm:py-3 bg-black/80 border-b border-primary/20 text-[10px] sm:text-sm font-condensed text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.4em] font-black z-30 sticky top-0 backdrop-blur-xl items-center">
          <div className="col-span-2 sm:col-span-1 text-center sm:border-r border-white/5">Rank</div>
          <div className="col-span-2 sm:col-span-3 text-center sm:border-r border-white/5 text-primary/60">{rankingFilter !== 'week' ? 'Prog' : ''}</div>
          <div className="col-span-6 sm:col-span-5 flex items-center justify-start pl-4 sm:pl-8 border-r border-white/5 uppercase">Competidor</div>
          <div className="col-span-2 sm:col-span-3 text-center sm:text-right pr-0 sm:pr-6 uppercase tracking-[0.2em] sm:tracking-[0.5em] font-black text-white/70">Pts</div>
        </div>

        {/* Leaderboard Lines */}
        <div className="divide-y divide-white/10 relative z-10 border-t border-white/5">
          {leaderboard.length > 3 ? (
            leaderboard.slice(3).map((user, index) => renderUserRow(user, index + 3))
          ) : (
            <div className="py-40 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-white/5 text-9xl mb-8 animate-pulse">database_off</span>
              <div className="text-white/20 font-condensed italic text-2xl tracking-[0.4em] uppercase font-black">SISTEMA_SEM_RESPOSTA // DADOS_NÃO_LOCALIZADOS</div>
            </div>
          )}
        </div>

        <div className="p-12 text-center text-white/5 text-[11px] font-mono border-t border-white/5 uppercase tracking-[0.7em] bg-black/60 font-black">
          STATUS_MOTOR: ONLINE // CONEXÃO_SEGURA // v1.0.4.8_ELITE
        </div>
      </div>
      <div className="h-40"></div>
    </div>
  );
};

export default Ranking;