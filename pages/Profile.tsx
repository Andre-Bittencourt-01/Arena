import React from 'react';
import { Screen } from '../App';
import { useData } from '../contexts/DataContext';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user, leaderboard, events, getAllPicksForEvent, getFightsForEvent, getLeaderboard } = useData();

  // Period filter state (similar to Ranking page)
  const [periodFilter, setPeriodFilter] = React.useState<'week' | 'month' | 'year'>('month');

  // Period selector dropdown state
  const [showSelector, setShowSelector] = React.useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = React.useState<string | null>(null);
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

  // Period label mapping
  const periodLabels = {
    'week': 'Último Evento',
    'month': 'Mensal',
    'year': 'Anual'
  };

  // Calculate user stats from picks
  const [userStats, setUserStats] = React.useState({
    winnerAccuracy: 0,
    methodAccuracy: 0,
    roundAccuracy: 0,
    totalPicks: 0,
    totalVictories: 0,
    weeklyPoints: 0,
    totalPoints: 0,
    userRank: 0
  });

  React.useEffect(() => {
    const calculateStats = async () => {
      if (!user) {
        setUserStats({
          winnerAccuracy: 0,
          methodAccuracy: 0,
          roundAccuracy: 0,
          totalPicks: 0,
          totalVictories: 0,
          weeklyPoints: 0,
          totalPoints: 0,
          userRank: 0
        });
        return;
      }

      try {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get week start (7 days ago) for weekly points
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);

        // Filter events based on selected period
        let filteredEvents: typeof events = [];

        if (periodFilter === 'week') {
          // Get last completed event
          filteredEvents = events
            .filter(e => e.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 1);
        } else if (periodFilter === 'month') {
          // Get all completed events from this month
          filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return event.status === 'completed' &&
              eventDate.getMonth() === currentMonth &&
              eventDate.getFullYear() === currentYear;
          });
        } else if (periodFilter === 'year') {
          // Get all completed events from this year
          filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return event.status === 'completed' &&
              eventDate.getFullYear() === currentYear;
          });
        }

        const weeklyEvents = events.filter(event => {
          const eventDate = new Date(event.date);
          return event.status === 'completed' && eventDate >= weekStart;
        });

        let totalPicks = 0;
        let correctWinner = 0;
        let correctMethod = 0;
        let correctRound = 0;
        let weeklyPoints = 0;
        let totalPoints = 0;

        // Calculate stats based on filtered events
        for (const event of filteredEvents) {
          const allPicks = await getAllPicksForEvent(event.id);
          const userPicksArray = allPicks.filter(pick => pick.user_id === user.id);

          if (userPicksArray.length === 0) continue;

          const fights = await getFightsForEvent(event.id);

          for (const pick of userPicksArray) {
            const fight = fights.find(f => f.id === pick.fight_id);
            if (!fight || !fight.winner_id) continue;

            totalPicks++;
            totalPoints += pick.points_earned || 0;

            // Check winner accuracy
            if (pick.fighter_id === fight.winner_id) {
              correctWinner++;

              // Check method accuracy (only if winner was correct)
              if (pick.method && fight.method) {
                const pickMethod = pick.method.toUpperCase();
                const fightMethod = fight.method.toUpperCase();

                if (
                  (pickMethod === 'KO/TKO' && (fightMethod.includes('KO') || fightMethod.includes('TKO'))) ||
                  (pickMethod === 'SUB' && fightMethod.includes('SUB')) ||
                  (pickMethod === 'DEC' && (fightMethod.includes('DEC') || fightMethod.includes('DECISION')))
                ) {
                  correctMethod++;

                  // Check round accuracy (only if method was also correct)
                  if (pick.round && fight.round_end) {
                    if (pick.round === fight.round_end) {
                      correctRound++;
                    }
                  }
                }
              }
            }
          }
        }

        // Calculate weekly points
        for (const event of weeklyEvents) {
          const allPicks = await getAllPicksForEvent(event.id);
          const userPicksArray = allPicks.filter(pick => pick.user_id === user.id);

          for (const pick of userPicksArray) {
            weeklyPoints += pick.points_earned || 0;
          }
        }

        // Get user rank based on period
        const periodLeaderboard = await getLeaderboard(periodFilter);
        const userRankIndex = periodLeaderboard.findIndex(u => u.id === user.id);
        const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 0;

        setUserStats({
          winnerAccuracy: totalPicks > 0 ? Math.round((correctWinner / totalPicks) * 100) : 0,
          methodAccuracy: correctWinner > 0 ? Math.round((correctMethod / correctWinner) * 100) : 0,
          roundAccuracy: correctMethod > 0 ? Math.round((correctRound / correctMethod) * 100) : 0,
          totalPicks,
          totalVictories: correctWinner,
          weeklyPoints,
          totalPoints,
          userRank
        });
      } catch (error) {
        console.error('Error calculating user stats:', error);
        setUserStats({
          winnerAccuracy: 0,
          methodAccuracy: 0,
          roundAccuracy: 0,
          totalPicks: 0,
          totalVictories: 0,
          weeklyPoints: 0,
          totalPoints: 0,
          userRank: 0
        });
      }
    };

    calculateStats();
  }, [user, events, getAllPicksForEvent, getFightsForEvent, periodFilter, getLeaderboard]);

  // Get completed events for history table
  const [eventHistory, setEventHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchEventHistory = async () => {
      if (!user) {
        setEventHistory([]);
        return;
      }

      try {
        const completedEvents = events
          .filter(e => e.status === 'completed')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        const eventsWithStats = await Promise.all(
          completedEvents.map(async (event) => {
            const allPicks = await getAllPicksForEvent(event.id);
            const userPicks = allPicks.filter(pick => pick.user_id === user.id);
            const userPointsForEvent = userPicks.reduce((sum, pick) => sum + (pick.points_earned || 0), 0);

            // Get user rank for this event
            const eventLeaderboard = await getLeaderboard('week', event.id);
            const userRankIndex = eventLeaderboard.findIndex(u => u.id === user.id);
            const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

            return {
              ...event,
              userPoints: userPointsForEvent,
              userRank
            };
          })
        );

        setEventHistory(eventsWithStats);
      } catch (error) {
        console.error('Error fetching event history:', error);
        setEventHistory([]);
      }
    };

    fetchEventHistory();
  }, [user, events, getAllPicksForEvent, getLeaderboard]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="p-8 bg-card-dark rounded-xl border border-white/10 text-center max-w-md w-full">
          <span className="material-symbols-outlined text-6xl text-white/20 mb-4">account_circle</span>
          <h2 className="text-2xl font-bold font-condensed uppercase text-white mb-2">Login Necessário</h2>
          <p className="text-gray-400 mb-6 font-mono text-sm">Faça login para acessar seu perfil e estatísticas.</p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold font-condensed uppercase py-3 rounded shadow-neon transition-all"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Calculate Rank
  const userRankIndex = leaderboard.findIndex(u => u.id === user.id);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 'N/A';
  const totalUsers = leaderboard.length;
  const rankPercentile = userRank !== 'N/A' && totalUsers > 0
    ? Math.max(1, Math.ceil((Number(userRank) / totalUsers) * 100))
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <section className="bg-card-dark rounded-sm border border-border-dark shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #ec1313 0%, transparent 20%)' }}></div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
          <div className="relative flex-shrink-0">
            <div className="bg-center bg-no-repeat bg-cover h-32 w-32 md:h-40 md:w-40 rounded-sm border border-primary shadow-[0_0_20px_rgba(236,19,19,0.2)]" style={{ backgroundImage: `url("${user.avatar_url}")` }}></div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-bold font-condensed px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-md">
              Pro Member
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-condensed uppercase leading-none tracking-tight text-white mb-1">{user.name}</h1>
                <p className="text-text-secondary text-base font-medium font-mono mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 bg-border-dark px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider text-white border border-white/5">
                    <span className="material-symbols-outlined !text-sm text-primary">verified</span> Verificado
                  </span>
                  <span className="inline-flex items-center gap-1 bg-border-dark px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider text-white border border-white/5">
                    <span className="material-symbols-outlined !text-sm text-text-secondary">calendar_month</span> Desde 2025
                  </span>
                  <span className="inline-flex items-center gap-1 bg-border-dark px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider text-white border border-white/5">
                    <span className="material-symbols-outlined !text-sm text-text-secondary">group</span> Team Arena
                  </span>
                </div>
              </div>
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <button
                  onClick={() => onNavigate('story')}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white transition-all rounded-sm h-12 px-8 font-bold font-condensed uppercase tracking-wider text-base shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined !text-[20px]">share</span>
                  Compartilhar Resultado
                </button>
                <button
                  onClick={() => onNavigate('admin')}
                  className="mt-2 md:mt-0 md:ml-4 w-full md:w-auto flex items-center justify-center gap-2 bg-surface-dark hover:bg-surface-highlight text-text-secondary hover:text-white transition-all rounded-sm h-12 px-6 font-bold font-condensed uppercase tracking-wider text-sm border border-white/10"
                >
                  <span className="material-symbols-outlined !text-[20px]">admin_panel_settings</span>
                  Admin
                </button>
              </div>
            </div>

            {/* Period Filter Buttons */}
            <div className="mt-6 border-t border-border-dark pt-6">
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-3">Visualizar Estatísticas</p>
              <div className="flex flex-wrap gap-2">
                {/* Filter Buttons */}
                <div className="flex bg-zinc-900 border border-white/10 p-1.5 rounded-xl shadow-lg">
                  {[
                    { id: 'week', label: 'Último Evento' },
                    { id: 'month', label: 'Mensal' },
                    { id: 'year', label: 'Anual' }
                  ].map((btn, i) => (
                    <React.Fragment key={btn.id}>
                      {i > 0 && <div className="w-px bg-white/5 my-2 mx-1"></div>}
                      <button
                        onClick={() => setPeriodFilter(btn.id as 'week' | 'month' | 'year')}
                        className={`px-4 py-2 font-condensed text-xs uppercase font-black tracking-widest transition-all rounded-lg ${periodFilter === btn.id
                          ? 'bg-primary text-white scale-105 shadow-lg shadow-primary/40'
                          : 'text-white/30 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        {btn.label}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Period Selector Dropdown */}
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setShowSelector(!showSelector)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${showSelector
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/40'
                      : 'bg-zinc-900 border-white/10 text-white/60 hover:text-white hover:border-white/30'
                      }`}
                  >
                    <span className="material-symbols-outlined text-lg">history</span>
                    <span className="font-condensed font-bold uppercase tracking-widest text-xs">
                      {periodFilter === 'week' ? 'Outros Eventos' : periodFilter === 'month' ? 'Outros Meses' : 'Outros Anos'}
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
                          {periodFilter === 'week' ? (
                            events.filter(e => e.status === 'completed').map(event => (
                              <button
                                key={event.id}
                                onClick={() => { setSelectedPeriodId(event.id); setShowSelector(false); }}
                                className={`w-full text-left px-4 py-3 rounded-lg font-condensed text-sm uppercase font-bold tracking-wider transition-colors ${selectedPeriodId === event.id
                                  ? 'bg-primary/20 text-primary'
                                  : 'text-white/40 hover:bg-white/5 hover:text-white'
                                  }`}
                              >
                                {event.title} - {event.subtitle}
                              </button>
                            ))
                          ) : periodFilter === 'month' ? (
                            [...Array(12)].map((_, i) => {
                              const monthId = `2026-${(i + 1).toString().padStart(2, '0')}`;
                              const monthName = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i];
                              return (
                                <button
                                  key={monthId}
                                  onClick={() => { setSelectedPeriodId(monthId); setShowSelector(false); }}
                                  className={`w-full text-left px-4 py-3 rounded-lg font-condensed text-sm uppercase font-bold tracking-wider transition-colors ${selectedPeriodId === monthId
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                                    }`}
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
                                className={`w-full text-left px-4 py-3 rounded-lg font-condensed text-sm uppercase font-bold tracking-wider transition-colors ${selectedPeriodId === year
                                  ? 'bg-primary/20 text-primary'
                                  : 'text-white/40 hover:bg-white/5 hover:text-white'
                                  }`}
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
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card-dark rounded-sm p-6 border border-border-dark relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined !text-8xl">trophy</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary !text-lg">equalizer</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Pontos {periodLabels[periodFilter]}</h3>
              </div>
              <p className="text-6xl font-bold font-condensed text-white tracking-tight">{userStats.totalPoints}</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded text-green-500 text-xs font-bold uppercase tracking-wide border border-green-500/20">
                <span className="material-symbols-outlined !text-sm">trending_up</span>
                +{userStats.weeklyPoints} ESTA SEMANA
              </div>
            </div>
          </div>
          <div className="bg-card-dark rounded-sm p-6 border border-border-dark relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined !text-8xl">leaderboard</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary !text-lg">public</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Ranking {periodLabels[periodFilter]}</h3>
              </div>
              <p className="text-6xl font-bold font-condensed text-white tracking-tight">#{userStats.userRank || 'N/A'}</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded text-green-500 text-xs font-bold uppercase tracking-wide border border-green-500/20">
                <span className="material-symbols-outlined !text-sm">arrow_upward</span>
                TOP {Math.round((userStats.userRank / leaderboard.length) * 100)}% GLOBAL
              </div>
            </div>
          </div>
          <div className="bg-card-dark rounded-sm p-6 border border-border-dark relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined !text-8xl">stars</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary !text-lg">military_tech</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Melhor {periodFilter === 'week' ? 'Evento' : periodFilter === 'month' ? 'Mês' : 'Ano'}</h3>
              </div>
              <p className="text-6xl font-bold font-condensed text-white tracking-tight">UFC 315</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-border-dark px-2 py-0.5 rounded text-text-secondary text-xs font-bold uppercase tracking-wide border border-white/5">
                <span className="material-symbols-outlined !text-sm">check</span>
                Em Breve
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-card-dark rounded-sm border border-border-dark p-6">
          <div className="flex items-center justify-between mb-6 border-b border-border-dark pb-4">
            <h2 className="text-lg font-bold font-condensed uppercase tracking-wide text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-primary block"></span>
              Análise de Precisão - {periodLabels[periodFilter]}
            </h2>
            <button className="text-xs text-text-secondary hover:text-white uppercase font-bold tracking-widest transition-colors">Ver Detalhes</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border-dark">
            {/* Donut Chart 1 */}
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
              <div className="relative flex items-center justify-center mb-4">
                <div className="w-[100px] h-[100px] rounded-full" style={{ background: `conic-gradient(#ec1313 ${userStats.winnerAccuracy}%, transparent 0)`, mask: 'radial-gradient(farthest-side, transparent 80%, black 0)', WebkitMask: 'radial-gradient(farthest-side, transparent 80%, black 0)' }}></div>
                <div className="absolute bg-card-dark w-[80px] h-[80px] rounded-full flex flex-col items-center justify-center border border-border-dark">
                  <span className="text-2xl font-bold font-condensed text-white">{userStats.winnerAccuracy}%</span>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold uppercase font-condensed text-white mb-1">Vencedor</h4>
                <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Taxa de Acerto</p>
              </div>
            </div>
            {/* Donut Chart 2 */}
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <div className="relative flex items-center justify-center mb-4">
                <div className="w-[100px] h-[100px] rounded-full" style={{ background: `conic-gradient(#ec1313 ${userStats.methodAccuracy}%, transparent 0)`, mask: 'radial-gradient(farthest-side, transparent 80%, black 0)', WebkitMask: 'radial-gradient(farthest-side, transparent 80%, black 0)' }}></div>
                <div className="absolute bg-card-dark w-[80px] h-[80px] rounded-full flex flex-col items-center justify-center border border-border-dark">
                  <span className="text-2xl font-bold font-condensed text-white">{userStats.methodAccuracy}%</span>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold uppercase font-condensed text-white mb-1">Método</h4>
                <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">KO / SUB / DEC</p>
              </div>
            </div>
            {/* Donut Chart 3 */}
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <div className="relative flex items-center justify-center mb-4">
                <div className="w-[100px] h-[100px] rounded-full" style={{ background: `conic-gradient(#ec1313 ${userStats.roundAccuracy}%, transparent 0)`, mask: 'radial-gradient(farthest-side, transparent 80%, black 0)', WebkitMask: 'radial-gradient(farthest-side, transparent 80%, black 0)' }}></div>
                <div className="absolute bg-card-dark w-[80px] h-[80px] rounded-full flex flex-col items-center justify-center border border-border-dark">
                  <span className="text-2xl font-bold font-condensed text-white">{userStats.roundAccuracy}%</span>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold uppercase font-condensed text-white mb-1">Round</h4>
                <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Precisão Exata</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="bg-card-dark rounded-sm border border-border-dark overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-dark bg-[#181a1e]">
            <h2 className="text-lg font-bold font-condensed uppercase tracking-wide text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-primary block"></span>
              Histórico de Eventos
            </h2>
            <button className="text-xs text-primary font-bold uppercase hover:text-white transition-colors tracking-widest flex items-center gap-1">
              Ver Todos <span className="material-symbols-outlined !text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#14161a] text-text-secondary text-[10px] uppercase tracking-widest border-b border-border-dark font-bold font-mono">
                  <th className="p-4 w-1/2">Evento / Data</th>
                  <th className="p-4 text-center">Pontos</th>
                  <th className="p-4 text-center">Rank</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {eventHistory.length > 0 ? (
                  eventHistory.map((event) => (
                    <tr key={event.id} className="group hover:bg-[#23262b] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-center bg-cover rounded-sm border border-border-dark shrink-0" style={{ backgroundImage: `url("${event.banner_url}")` }}></div>
                          <div>
                            <p className="font-bold font-condensed text-lg text-white group-hover:text-primary transition-colors leading-tight">{event.title}</p>
                            <p className="text-[11px] text-text-secondary font-mono mt-1 uppercase tracking-wider">
                              {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold font-condensed text-2xl text-white block">{event.userPoints || 0}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-medium text-sm text-text-secondary font-mono">#{event.userRank || 'N/A'}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-block px-2 py-1 bg-green-900/20 text-green-500 text-[10px] font-bold border border-green-900/30 rounded-sm uppercase tracking-wide">Finalizado</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-secondary text-sm">
                      Nenhum evento completado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;