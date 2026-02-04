import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import Panel from '../components/Panel';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveBanner from '../components/common/ResponsiveBanner';
import * as dateUtils from '../utils/dateUtils';
import { getEventStatus, getEventEndTime } from '../utils/eventStatus';

interface DashboardProps {
  on_navigate: (screen: Screen) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ on_navigate }) => {
  const { events, leaderboard, set_current_event, get_all_picks_for_event, get_fights_for_event } = useData();
  const { user, loading: auth_loading } = useAuth();

  const [next_event, set_next_event] = useState(events.find(e => e.status === 'SCHEDULED') || null);
  const [time_left, set_time_left] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!events.length) return;

    const active_events = events.filter(e => getEventStatus(e) !== 'COMPLETED');
    const sorted = active_events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const selected = sorted[0] || events[events.length - 1];

    set_next_event(selected);
  }, [events]);

  useEffect(() => {
    if (!next_event) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target_date = getEventEndTime(next_event);
      const difference = target_date - now;

      if (difference > 0) {
        set_time_left({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        set_time_left(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [next_event]);

  const [user_stats, set_user_stats] = React.useState({
    winner_accuracy: 0,
    method_accuracy: 0,
    round_accuracy: 0,
    total_picks: 0
  });

  useEffect(() => {
    const calculate_stats = async () => {
      if (!user) {
        set_user_stats({ winner_accuracy: 0, method_accuracy: 0, round_accuracy: 0, total_picks: 0 });
        return;
      }

      try {
        const now = new Date();
        const current_month = now.getMonth();
        const current_year = now.getFullYear();

        const monthly_events = events.filter(event => {
          const event_date = new Date(event.date);
          return event.status === 'COMPLETED' &&
            event_date.getMonth() === current_month &&
            event_date.getFullYear() === current_year;
        });

        let total_picks = 0;
        let correct_winner = 0;
        let correct_method = 0;
        let correct_round = 0;

        for (const event of monthly_events) {
          const all_picks = await get_all_picks_for_event(event.id);
          const user_picks_array = all_picks.filter(pick => pick.user_id === user.id);

          if (user_picks_array.length === 0) continue;

          const fights = await get_fights_for_event(event.id);

          for (const pick of user_picks_array) {
            const fight = fights.find(f => f.id === pick.fight_id);
            if (!fight || !fight.winner_id) continue;

            total_picks++;

            if (pick.fighter_id === fight.winner_id) {
              correct_winner++;

              if (pick.method && fight.method) {
                const pick_method = pick.method.toUpperCase();
                const fight_method = fight.method.toUpperCase();

                if (
                  (pick_method === 'KO/TKO' && (fight_method.includes('KO') || fight_method.includes('TKO'))) ||
                  (pick_method === 'SUB' && fight_method.includes('SUB')) ||
                  (pick_method === 'DEC' && (fight_method.includes('DEC') || fight_method.includes('DECISION')))
                ) {
                  correct_method++;

                  if (pick.round && fight.round_end) {
                    if (pick.round === fight.round_end) {
                      correct_round++;
                    }
                  }
                }
              }
            }
          }
        }

        set_user_stats({
          winner_accuracy: total_picks > 0 ? Math.round((correct_winner / total_picks) * 100) : 0,
          method_accuracy: correct_winner > 0 ? Math.round((correct_method / correct_winner) * 100) : 0,
          round_accuracy: correct_method > 0 ? Math.round((correct_round / correct_method) * 100) : 0,
          total_picks: total_picks
        });
      } catch (error) {
        console.error('Error calculating user stats:', error);
        set_user_stats({ winner_accuracy: 0, method_accuracy: 0, round_accuracy: 0, total_picks: 0 });
      }
    };

    calculate_stats();
  }, [user, events, get_all_picks_for_event, get_fights_for_event]);

  const [monthly_rank_data, set_monthly_rank_data] = React.useState({
    position: 0,
    percentile: 0,
    rank_delta: 0,
    total_users: 0
  });

  useEffect(() => {
    const calculate_monthly_rank = async () => {
      if (!user) {
        set_monthly_rank_data({ position: 0, percentile: 0, rank_delta: 0, total_users: 0 });
        return;
      }

      try {
        const user_position = leaderboard.findIndex(u => u.id === user.id) + 1;
        const total_users = leaderboard.length;
        const percentile = total_users > 0 ? Math.round((user_position / total_users) * 100) : 0;
        const rank_delta = user.monthly_rank_delta || 0;

        set_monthly_rank_data({
          position: user_position || 0,
          percentile,
          rank_delta: rank_delta,
          total_users: total_users
        });
      } catch (error) {
        console.error('Error calculating monthly rank:', error);
        set_monthly_rank_data({ position: 0, percentile: 0, rank_delta: 0, total_users: 0 });
      }
    };

    calculate_monthly_rank();
  }, [user, leaderboard]);

  if (auth_loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-400 font-condensed font-bold uppercase tracking-widest animate-pulse">Carregando Arena...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 md:py-8 font-grotesk pb-24 md:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-8">

        {/* Main Hero Section */}
        <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
          {next_event ? (
            <div className="relative overflow-hidden rounded-2xl bg-surface-dark border border-white/5 shadow-2xl group min-h-[260px] md:min-h-[400px]">
              <div className="absolute top-3 left-3 z-30">
                {getEventStatus(next_event) === 'LIVE' ? (
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-red-600/90 border border-red-500/50 text-red-100 text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)] backdrop-blur-md animate-pulse">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    AO VIVO
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-green-500/90 border border-green-500/50 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-neon-sm backdrop-blur-md">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    PRÓXIMO EVENTO
                  </div>
                )}
              </div>
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent z-10"></div>
                <ResponsiveBanner
                  event={next_event}
                  context="dashboard"
                  className="transition-transform duration-700 group-hover:scale-[1.05]"
                />
              </div>
              <div className="relative z-20 p-5 md:p-10 h-full flex flex-col justify-end">
                <div className="flex flex-col justify-end h-full gap-2 md:gap-8">

                  {/* Event Info Row */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-1 md:gap-8">

                    {/* Left Column: Title, Subtitle, Details */}
                    <div className="w-full md:w-auto space-y-1 md:space-y-4 max-w-lg">
                      <div className="flex items-end justify-between gap-4">
                        <h2 className="font-condensed text-4xl md:text-7xl font-bold uppercase italic leading-none tracking-tighter text-white">
                          {next_event.title.split(' ')[0]} <span className="text-primary drop-shadow-[0_0_10px_rgba(255,31,31,0.5)]">{next_event.title.split(' ')[1]}</span>
                        </h2>

                        <div className="md:hidden mb-2">
                          {getEventStatus(next_event) === 'LIVE' ? (
                            <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-1.5 animate-pulse">Prazo Final</p>
                          ) : (
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Tempo para Palpitar</p>
                          )}
                          {time_left ? (
                            <div className="flex gap-1.5 font-condensed">
                              <div className="flex flex-col items-center bg-[#1e1e21]/90 backdrop-blur border border-white/10 p-2 rounded w-12">
                                <span className="text-xl font-bold text-white leading-none">{time_left.days.toString().padStart(2, '0')}</span>
                                <span className="text-[7px] uppercase text-gray-500 font-bold">Dias</span>
                              </div>
                              <div className="text-xl font-bold text-primary self-center pb-2">:</div>
                              <div className="flex flex-col items-center bg-[#1e1e21]/90 backdrop-blur border border-white/10 p-2 rounded w-12">
                                <span className="text-xl font-bold text-white leading-none">{time_left.hours.toString().padStart(2, '0')}</span>
                                <span className="text-[7px] uppercase text-gray-500 font-bold">Hrs</span>
                              </div>
                              <div className="text-xl font-bold text-primary self-center pb-2">:</div>
                              <div className="flex flex-col items-center bg-[#1e1e21]/90 backdrop-blur border border-white/10 p-2 rounded w-12 border-primary/30">
                                <span className="text-xl font-bold text-white leading-none">{time_left.minutes.toString().padStart(2, '0')}</span>
                                <span className="text-[7px] uppercase text-gray-500 font-bold">Min</span>
                              </div>
                            </div>
                          ) : (
                            <div className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-[10px] text-red-500 font-bold uppercase backdrop-blur">
                              Encerrado
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="font-condensed text-xl md:text-4xl font-medium uppercase text-gray-300 leading-none">
                        {next_event.subtitle.split(' vs ')[0]} <span className="text-primary font-bold">VS</span> {next_event.subtitle.split(' vs ')[1]}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400 text-[10px] md:text-sm font-mono border-t border-white/10 pt-2 md:pt-3 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-[14px] md:text-base">calendar_month</span>
                          <span>{dateUtils.getEventDay(next_event.date)} {dateUtils.getEventMonthLong(next_event.date)}</span>
                        </div>
                        <span className="hidden md:block w-1 h-1 bg-gray-600 rounded-full"></span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-[14px] md:text-base">schedule</span>
                          <span>{dateUtils.getEventTime(next_event.date)}</span>
                        </div>
                        <span className="hidden md:block w-1 h-1 bg-gray-600 rounded-full"></span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-[14px] md:text-base">location_on</span>
                          <span>{dateUtils.getLocationCity(next_event.location)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Timer (Desktop) + Button */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2 w-full md:w-auto mt-2 md:mt-0">

                      {/* Desktop Timer - Hidden on Mobile */}
                      <div className="hidden md:flex flex-col items-center gap-2">
                        {getEventStatus(next_event) === 'LIVE' ? (
                          <p className="text-xs uppercase tracking-widest text-red-500 font-bold animate-pulse">Prazo Final</p>
                        ) : (
                          <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Tempo para Palpitar</p>
                        )}
                        {time_left ? (
                          <div className="flex gap-1.5 md:gap-2 font-condensed">
                            <div className="flex flex-col items-center bg-[#1e1e21]/80 backdrop-blur border border-white/5 p-2 md:p-3 rounded-lg w-14 md:w-16 shadow-lg">
                              <span className="text-2xl md:text-3xl font-bold text-white leading-none" style={{ textShadow: '0 4px 0 #5a0000' }}>{time_left.days.toString().padStart(2, '0')}</span>
                              <span className="text-[8px] md:text-[9px] uppercase text-gray-500 font-bold mt-1">Dias</span>
                            </div>
                            <div className="text-xl font-bold text-primary self-start mt-1 md:mt-2">:</div>
                            <div className="flex flex-col items-center bg-[#1e1e21]/80 backdrop-blur border border-white/5 p-2 md:p-3 rounded-lg w-14 md:w-16 shadow-lg">
                              <span className="text-2xl md:text-3xl font-bold text-white leading-none" style={{ textShadow: '0 4px 0 #5a0000' }}>{time_left.hours.toString().padStart(2, '0')}</span>
                              <span className="text-[8px] md:text-[9px] uppercase text-gray-500 font-bold mt-1">Hrs</span>
                            </div>
                            <div className="text-xl font-bold text-primary self-start mt-1 md:mt-2">:</div>
                            <div className="flex flex-col items-center bg-[#1e1e21]/80 backdrop-blur border border-white/5 p-2 md:p-3 rounded-lg w-14 md:w-16 shadow-lg border-primary/30">
                              <span className="text-2xl md:text-3xl font-bold text-white leading-none" style={{ textShadow: '0 4px 0 #5a0000' }}>{time_left.minutes.toString().padStart(2, '0')}</span>
                              <span className="text-[8px] md:text-[9px] uppercase text-gray-500 font-bold mt-1">Min</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(220,38,38,0.1)] w-full max-w-[200px]">
                            <span className="material-symbols-outlined text-red-500 text-3xl mb-1">lock</span>
                            <p className="text-red-400 font-condensed font-bold uppercase text-lg leading-none tracking-wide text-center">Palpites<br />Encerrados</p>
                            <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest border-t border-red-500/20 pt-2 w-full text-center">Evento Iniciado</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (next_event) {
                            set_current_event(next_event);
                            on_navigate('picks');
                          }
                        }}
                        className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white font-condensed font-bold uppercase tracking-wider py-3 px-6 rounded shadow-neon transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        Fazer Palpites <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-dark border border-white/5 p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
              <span className="material-symbols-outlined text-gray-600 text-6xl mb-4">event_busy</span>
              <h2 className="text-2xl font-bold text-white uppercase font-condensed">Sem Eventos Programados</h2>
              <p className="text-gray-500 mt-2">Fique ligado para as próximas atualizações.</p>
            </div>
          )}

          {/* Stats Summary */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {/* Precision Card */}
              <div className="bg-surface-dark border border-white/5 rounded-xl p-4 md:p-5 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-2 md:p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-3xl md:text-4xl text-primary">target</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 md:mb-4">Precisão Detalhada do Mês</p>
                <div className="flex items-center justify-between gap-1 md:gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative h-16 w-16 md:h-20 md:w-20">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-primary drop-shadow-[0_0_3px_rgba(255,31,31,0.8)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${user_stats.winner_accuracy}, 100`} strokeWidth="3"></path>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs md:text-sm font-bold text-white">{user_stats.winner_accuracy}%</span>
                      </div>
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wide">Vencedor</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative h-16 w-16 md:h-20 md:w-20">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-primary/70 drop-shadow-[0_0_3px_rgba(255,31,31,0.5)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${user_stats.method_accuracy}, 100`} strokeWidth="3"></path>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs md:text-sm font-bold text-white">{user_stats.method_accuracy}%</span>
                      </div>
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wide">Método</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative h-16 w-16 md:h-20 md:w-20">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-primary/40 drop-shadow-[0_0_3px_rgba(255,31,31,0.3)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${user_stats.round_accuracy}, 100`} strokeWidth="3"></path>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs md:text-sm font-bold text-white">{user_stats.round_accuracy}%</span>
                      </div>
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wide">Round</span>
                  </div>
                </div>
              </div>

              {/* Rank Card */}
              <div className="bg-surface-dark border border-white/5 rounded-xl p-3 md:p-5 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-blue-500">leaderboard</span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ranking Global / Sua Posição</p>
                  <button
                    onClick={() => on_navigate('ranking')}
                    className="text-[10px] text-primary font-bold uppercase tracking-wider hover:text-white transition-colors"
                  >
                    Ranking Completo
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-condensed font-bold text-white">#{monthly_rank_data.position || '-'}</p>
                    <p className="text-[10px] text-gray-400">Top {monthly_rank_data.percentile || 0}%</p>
                  </div>
                  <div className="text-right">
                    {monthly_rank_data.rank_delta !== 0 && (
                      <div className={`inline-flex items-center gap-1 ${monthly_rank_data.rank_delta > 0 ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'} px-2 py-1 rounded border`}>
                        <span className="material-symbols-outlined text-sm">{monthly_rank_data.rank_delta > 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                        <span className="text-xs font-bold">{Math.abs(monthly_rank_data.rank_delta)} Pos</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary/50 to-primary h-full rounded-full shadow-neon-sm transition-all duration-500"
                    style={{ width: `${Math.max(5, 100 - (monthly_rank_data.percentile || 0))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Panel
            title="Ranking"
            subtitle="Top 5 Elite"
            className="h-[50vh] lg:h-full"
            headerAction={
              <button
                onClick={() => on_navigate('ranking')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:text-white transition-all text-[10px] font-condensed font-bold uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">leaderboard</span>
                <span>Ver Todos</span>
              </button>
            }
          >
            <div className="space-y-2">
              {/* Dynamic Top 5 from Leaderboard */}
              {leaderboard.slice(0, 5).map((u, index) => (
                <div key={u.id} className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20 hover:border-yellow-500/50' : 'bg-surface-lighter border-white/5 hover:border-primary/50'}`}>
                  <div className="relative shrink-0">
                    <div className={`h-10 w-10 rounded-full p-0.5 ${index === 0 ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.4)]' : index === 1 ? 'bg-silver' : index === 2 ? 'bg-bronze' : 'bg-gray-600'}`}>
                      <img alt={`Rank ${index + 1} Avatar`} className={`h-full w-full rounded-full object-cover ${index > 0 ? 'grayscale group-hover:grayscale-0 transition-all' : ''}`} src={u.avatar_url} />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-black ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-silver' : index === 2 ? 'bg-bronze' : 'bg-gray-400'}`}>{index + 1}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0">
                      <p className={`text-xs font-bold truncate transition-colors ${index === 0 ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{u.name}</p>
                      <span className={`text-xs font-bold ${index === 0 ? 'text-yellow-500' : 'text-gray-400 group-hover:text-white'}`}>{u.points} pts</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-white/10">
                {user ? (
                  <div
                    onClick={() => on_navigate('profile')}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30 shadow-neon-sm cursor-pointer hover:bg-primary/20 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full p-0.5 bg-primary">
                        <img alt="User Avatar" className="h-full w-full rounded-full object-cover" src={user.avatar_url} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white text-black text-[10px] font-bold w-6 h-4 flex items-center justify-center rounded-full border border-primary">
                        {leaderboard.findIndex(u => u.id === user.id) + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-sm font-bold text-white truncate">Você</p>
                        <span className="text-xs font-bold text-primary">{user.points} pts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-black/30 px-1.5 py-0.5 rounded">
                          <span className="material-symbols-outlined text-xs text-orange-500">local_fire_department</span>
                          <span className="text-orange-400">4 Win Streak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => on_navigate('login')}
                    className="group flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-lighter border border-white/10 hover:border-primary/50 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-primary">login</span>
                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">Fazer Login</span>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;