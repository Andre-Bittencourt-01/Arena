import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import Panel from '../components/Panel';
import { useData } from '../contexts/DataContext';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { events } = useData();
  const [nextEvent, setNextEvent] = useState(events.find(e => e.status === 'upcoming') || null);

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    // Priority: Live > Upcoming
    const live = events.find(e => e.status === 'live');
    if (live) {
      setNextEvent(live);
    } else {
      const upcoming = events.find(e => e.status === 'upcoming');
      setNextEvent(upcoming || null);
    }
  }, [events]);

  useEffect(() => {
    if (!nextEvent) return;

    const calculateTimeLeft = () => {
      // If live, we count down to the END of the event (betting remains open for unstarted fights)
      // If upcoming, we count down to the START of the event
      const targetDate = nextEvent.status === 'live'
        ? (nextEvent.end_date ? new Date(nextEvent.end_date).getTime() : new Date(nextEvent.date).getTime() + 8 * 60 * 60 * 1000)
        : new Date(nextEvent.date).getTime();

      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        return null; // Event completely finished
      }
    };

    // Initial calc
    setTimeLeft(calculateTimeLeft());

    // Interval
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextEvent]);

  // Formatting helpers
  const formatNumber = (num: number) => num < 10 ? `0${num}` : num;
  const getEventMonth = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();
  const getEventDay = (dateStr: string) => new Date(dateStr).getDate();
  const getEventTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 font-grotesk">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main Hero Section */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {nextEvent ? (
            <div className="relative overflow-hidden rounded-2xl bg-surface-dark border border-white/5 shadow-2xl group min-h-[400px]">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/80 to-transparent z-10"></div>
                <img
                  alt={nextEvent.title}
                  className="h-full w-full object-cover object-top opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                  src={nextEvent.banner_url}
                />
              </div>
              <div className="relative z-20 p-6 md:p-10 h-full flex flex-col justify-end">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4 max-w-lg">
                    {nextEvent.status === 'live' ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-600/20 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)] backdrop-blur-md animate-pulse">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        AO VIVO
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold uppercase tracking-widest shadow-neon-sm backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        PRÓXIMO EVENTO
                      </div>
                    )}
                    <h2 className="font-condensed text-5xl md:text-7xl font-bold uppercase italic leading-none tracking-tighter text-white">
                      {nextEvent.title.split(' ')[0]} <span className="text-primary drop-shadow-[0_0_10px_rgba(255,31,31,0.5)]">{nextEvent.title.split(' ')[1]}</span>
                    </h2>
                    <p className="font-condensed text-3xl md:text-4xl font-medium uppercase text-gray-300">
                      {nextEvent.subtitle.split(' vs ')[0]} <span className="text-primary font-bold">VS</span> {nextEvent.subtitle.split(' vs ')[1]}
                    </p>
                    <div className="flex items-center gap-3 text-gray-400 text-sm font-mono border-t border-white/10 pt-4 mt-2">
                      <span className="material-symbols-outlined text-primary text-base">calendar_month</span>
                      <span>{getEventDay(nextEvent.date)} {getEventMonth(nextEvent.date)}</span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                      <span>{getEventTime(nextEvent.date)}</span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                      <span>{nextEvent.location.split(',')[0].toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-2">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Tempo para Palpitar</p>
                      {timeLeft ? (
                        <div className="flex gap-2 font-condensed">
                          <div className="flex flex-col items-center bg-[#1e1e21]/80 backdrop-blur border border-white/5 p-3 rounded-lg w-16 shadow-lg">
                            <span className="text-3xl font-bold text-white leading-none" style={{ textShadow: '0 4px 0 #5a0000' }}>{formatNumber(timeLeft.days)}</span>
                            <span className="text-[9px] uppercase text-gray-500 font-bold mt-1">Dias</span>
                          </div>
                          <div className="text-xl font-bold text-primary self-start mt-2">:</div>
                          <div className="flex flex-col items-center bg-[#1e1e21]/80 backdrop-blur border border-white/5 p-3 rounded-lg w-16 shadow-lg">
                            <span className="text-3xl font-bold text-white leading-none" style={{ textShadow: '0 4px 0 #5a0000' }}>{formatNumber(timeLeft.hours)}</span>
                            <span className="text-[9px] uppercase text-gray-500 font-bold mt-1">Hrs</span>
                          </div>
                          <div className="text-xl font-bold text-primary self-start mt-2">:</div>
                          <div className="flex flex-col items-center bg-[#1e1e21]/80 backdrop-blur border border-white/5 p-3 rounded-lg w-16 shadow-lg">
                            <span className="text-3xl font-bold text-white leading-none" style={{ textShadow: '0 4px 0 #5a0000' }}>{formatNumber(timeLeft.minutes)}</span>
                            <span className="text-[9px] uppercase text-gray-500 font-bold mt-1">Min</span>
                          </div>
                          <div className="text-xl font-bold text-primary self-start mt-2">:</div>
                          <div className="flex flex-col items-center bg-[#1e1e21]/80 backdrop-blur border border-white/5 p-3 rounded-lg w-16 shadow-lg border-primary/30">
                            <span className="text-3xl font-bold text-white leading-none" style={{ textShadow: '0 4px 0 #5a0000' }}>{formatNumber(timeLeft.seconds)}</span>
                            <span className="text-[9px] uppercase text-gray-500 font-bold mt-1">Seg</span>
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
                      onClick={() => onNavigate('picks')}
                      className="mt-4 w-full bg-primary hover:bg-primary-hover text-white font-condensed font-bold uppercase tracking-wider py-3 px-6 rounded shadow-neon transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      Fazer Palpites <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-condensed text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span> Resumo da Semana
              </h3>
              <span className="text-xs font-mono text-gray-500">ATUALIZADO: HOJE 14:00</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Precision Card */}
              <div className="bg-surface-dark border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-primary">target</span>
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4">Precisão Detalhada</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative h-14 w-14">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-primary drop-shadow-[0_0_3px_rgba(255,31,31,0.8)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="82, 100" strokeWidth="3"></path>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">82%</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Vencedor</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative h-14 w-14">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-primary/70 drop-shadow-[0_0_3px_rgba(255,31,31,0.5)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="64, 100" strokeWidth="3"></path>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">64%</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Método</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative h-14 w-14">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-primary/40 drop-shadow-[0_0_3px_rgba(255,31,31,0.3)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="45, 100" strokeWidth="3"></path>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">45%</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Round</span>
                  </div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="bg-surface-dark border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-yellow-500">local_fire_department</span>
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Sequência Atual</p>
                <div className="flex items-end gap-1 h-12 mb-2">
                  <div className="w-1/6 bg-white/10 rounded-t h-[40%]"></div>
                  <div className="w-1/6 bg-white/10 rounded-t h-[60%]"></div>
                  <div className="w-1/6 bg-green-500/50 rounded-t h-[80%] shadow-[0_0_5px_rgba(34,197,94,0.3)]"></div>
                  <div className="w-1/6 bg-green-500 rounded-t h-[100%] shadow-[0_0_10px_rgba(34,197,94,0.5)] relative group-hover:bg-primary group-hover:shadow-neon transition-all"></div>
                  <div className="w-1/6 bg-white/10 rounded-t h-[20%]"></div>
                  <div className="w-1/6 bg-white/10 rounded-t h-[50%]"></div>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-condensed font-bold text-white">4 <span className="text-sm text-gray-400 font-normal">Vitórias</span></p>
                  <p className="text-[10px] text-gray-500">Recorde: 8</p>
                </div>
              </div>

              {/* Rank Card */}
              <div className="bg-surface-dark border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-blue-500">leaderboard</span>
                </div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Ranking Global</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-condensed font-bold text-white">#42</p>
                    <p className="text-[10px] text-gray-400">Top 15%</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                      <span className="material-symbols-outlined text-sm">arrow_upward</span>
                      <span className="text-xs font-bold">12 Pos</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/50 to-primary h-full rounded-full w-[85%] shadow-neon-sm"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Results */}
          <div className="border-t border-white/5 pt-6">
            <h3 className="font-condensed text-lg font-bold text-white uppercase tracking-wide mb-4">Resultados Recentes</h3>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-max">
                <div className="flex items-center gap-4 bg-surface-dark border border-white/5 p-3 rounded-lg w-[280px] hover:border-white/20 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center">
                    <img className="w-10 h-10 rounded-full object-cover border border-green-500/50 shadow-[0_0_5px_rgba(34,197,94,0.3)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvjheTvK32Gm-UKPDBJ2x7v0_w78nlO8I2FNEn2Umz2XDp8QH1RLD-JxnAUi93lFYHADP_DFOIPErsQ3MAIpIZ2eHMKYzmfWS1AAcbavodqsU3f6g6_0cd-3ykT6UXYxAofMg6ia7jYj1eV4vqaE4uyLW-6mNAqaA68s51v60G3xTzLjermCqojsMXNaJ6pZ974cGOABUQ6Yqxe-tehrWmAPt1k2XN08i8VSwe-zLmqNF-RDCqyhtlSSGEyERq4FNnNjZ3OKttVHhu" alt="O'Malley" />
                    <span className="text-[10px] font-bold mt-1 text-white">O'Malley</span>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">WIN</span>
                    <p className="text-[10px] text-gray-500 mt-1">UFC 299</p>
                  </div>
                  <div className="flex flex-col items-center opacity-50">
                    <img className="w-10 h-10 rounded-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMF3Cv-OMOtJ-8jrpzleOP-0AtftuXNbe5VBThqIrEvnccRwKUcEUSckJpVnO7CRV5_87Pc0Beut3040K464lDHvCPg3c860MEEwCqQAm63uY9lE_Oho7OXySpGFwLWvd5JKQHtz_AYC9L4AunLef1E8HwKUyipz03b5782EBId2hg5F1OepnxZFhVGSSlbejgKYRsRp-sz9iYjSjsfYpaKEk6LTolj3aHbXcT1tc9HC6yT99zEN7U19e-O1EzPROHDmcl8Iax84hS" alt="Vera" />
                    <span className="text-[10px] font-bold mt-1 text-gray-400">Vera</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-surface-dark border border-white/5 p-3 rounded-lg w-[280px] hover:border-white/20 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center opacity-50">
                    <img className="w-10 h-10 rounded-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBznAjoZtX-9TpZ_1at98dPMdIZ6ibRJ72AWV6N5weje994PX5WGDRQryNUbWVxyzBge5A0XKuvnYC8kCAtinvI_vcJ4xuD5AAtvjflyYSMxi_0u744C9PZ8L8yVDdPJ-giZHnRxWHYmYIIbjiPwzEygtxGAZ56UD7KliiVWA2fNN_FFpK1XYbhtMlAanSyPoVWyTd97BH0U2gAfoxuMdeku1ktQiTAvoIqSGOnLfP1-XGIey0c1-VnNFBfNLSzfGXPpvvzaw0gRI3j" alt="Poirier" />
                    <span className="text-[10px] font-bold mt-1 text-gray-400">Poirier</span>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">LOSS</span>
                    <p className="text-[10px] text-gray-500 mt-1">UFC 299</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <img className="w-10 h-10 rounded-full object-cover border border-white/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2hnAMz5cJJXtKorqT0NTxy_bVqToq4pJrC2UTK0_g0VRC_ExEDolYKiMf-Mr9tq6g-qta0M17jfRWQCL-tIuX0PcsJDK9zNgIv5aFY0HJJOqkolxNOX_iygsL_758Z4_CaqoN8I1O9sCuuzaZCq50zz1vJvcAH1N9WY53cyRhtrLyh2w3YsS1yS_Ai-RDN21bb0hki6QsRG1gPt5gLSvvLhUM3zaD6n-hLQhhSW3cekFwiiMHkryFE3Q1nFwggg_BIY8L9WPzIY9b" alt="St. Denis" />
                    <span className="text-[10px] font-bold mt-1 text-white">St. Denis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Panel
            title="Ranking Semanal"
            subtitle="Top Jogadores & Sequências"
            className="h-full"
            headerAction={
              <button className="text-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            }
          >
            <div className="space-y-2">
              <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 hover:border-yellow-500/50 transition-all cursor-pointer">
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full p-0.5 bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.4)]">
                    <img alt="Rank 1 Avatar" className="h-full w-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCSWKLXpjLsO2Wfg9q5313WXv7Igi-QnTXD0a40AxS_KgPKN9oBkucOy90RVIcmXJYvJL_haE9X-Cv-Zds_YY1DV2w9jZZ4YqYGvTfDUknUcdCPruxvJdy87diiEWMlUkXzN0iOEGNMVLQgKwXVmabnQTzn9HnI9NBfCSdLrzq9WCDq1c9gFatiPNKM9b3dbbc0vlOp86fTre8ayX0u7hjSe07frxLZ1H6K3K6bEYzrArTmCq1_14xVRioOyfz2EIui1orIENogJhW" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-black">1</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-bold text-white truncate group-hover:text-yellow-400 transition-colors">Pedro_MMA</p>
                    <span className="text-xs font-bold text-yellow-500">1,450 pts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-black/30 px-1.5 py-0.5 rounded">
                      <span className="material-symbols-outlined text-xs text-orange-500">local_fire_department</span>
                      <span className="text-orange-400 font-bold">8 Win Streak</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group flex items-center gap-3 p-3 rounded-xl bg-surface-lighter border border-white/5 hover:border-primary/50 hover:shadow-neon-sm transition-all cursor-pointer">
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full p-0.5 bg-gray-600">
                    <img alt="Rank 2 Avatar" className="h-full w-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfRpuY07jrjI2ZgpAd6wEVhhpbF5jv6QpOVz_6-BGMCcXDOXmO4LWIfBZlrvlQ5N3HdhbNAl1fdIlcGqAkfuFHDlqhQWQqQLMD42Fc2U6EpiuQkk8ncHrbjjrdHbyI8CS4lXNlWgta2uot8PBPOBKo7VvpqBHXSJoIDvnfONNdF2doq_IdF5EVALMu6LD5jYeHMdcr4nkm13bwbhMv-Y7l6-finGLRBoNeWz0CzeTwWWrZ7CEzaKZ6jfJJTBqoMyC-BEzAfaBMiedO" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gray-400 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-black">2</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-bold text-gray-300 truncate group-hover:text-white transition-colors">SilvaSpider</p>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-white">1,320 pts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-black/30 px-1.5 py-0.5 rounded">
                      <span className="material-symbols-outlined text-xs text-orange-500/50">local_fire_department</span>
                      <span>3 Win Streak</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div
                  onClick={() => onNavigate('profile')}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30 shadow-neon-sm cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full p-0.5 bg-primary">
                      <img alt="User Avatar" className="h-full w-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdv6fnH2aUkUnStYycJnEKhaBICr74VmX4NnJNWQeAiTlNYjfRaYYdIaoUwqoIEjja3cV-obJrnb8Gr2KiHkzQz-DeJP1i1-21wlLJCmCXKcRBgb6F2m-uUznPWRZzMhZNCqAZa6eSt2I623-0Z_DFPK5NPmKdViNtogczjn5ZtJ-ArZKYBj2bztA5emkHyNyEy2LqUPyIDFtazLxIRtXY1YTN904jPv1NkVDpSRAx_bnPSnUrqaadV4tkE7fo8AizW2OjfaNetD1y" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white text-black text-[10px] font-bold w-6 h-4 flex items-center justify-center rounded-full border border-primary">42</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-sm font-bold text-white truncate">Você</p>
                      <span className="text-xs font-bold text-primary">980 pts</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-black/30 px-1.5 py-0.5 rounded">
                        <span className="material-symbols-outlined text-xs text-orange-500">local_fire_department</span>
                        <span className="text-orange-400">4 Win Streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;