import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Event, Fight, Pick } from '../types';
import { toPng } from 'html-to-image';
import { Screen } from '../App';

interface StoryCreatorProps {
  onNavigate?: (screen: Screen) => void;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({ onNavigate }) => {
  const { events, getFightsForEvent, getPicksForEvent, currentEvent } = useData();
  const { user } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [fights, setFights] = useState<Fight[]>([]);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [loading, setLoading] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'preview'>('list');

  // Filter events
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'completed');

  // Load initial event
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      if (currentEvent) {
        // Se viemos de um palpite recente, mostre ele!
        setSelectedEventId(currentEvent.id);
      } else {
        const latestCompleted = pastEvents[0];
        if (latestCompleted) {
          setSelectedEventId(latestCompleted.id);
        } else if (upcomingEvents.length > 0) {
          setSelectedEventId(upcomingEvents[0].id);
        }
      }
    }
  }, [events, selectedEventId, currentEvent]);

  // Fetch data
  useEffect(() => {
    const loadEventData = async () => {
      if (!selectedEventId) return;

      setLoading(true);
      const foundEvent = events.find(e => e.id === selectedEventId) || null;
      setSelectedEvent(foundEvent);

      if (foundEvent) {
        const fts = await getFightsForEvent(selectedEventId);
        const userPicks = await getPicksForEvent(selectedEventId);
        setFights(fts);
        setPicks(userPicks);
      }
      setLoading(false);
    };

    loadEventData();
  }, [selectedEventId, events]);

  // Handle Selection (Mobile Auto-Switch)
  const handleEventSelect = (id: string) => {
    setSelectedEventId(id);
    setMobileView('preview');
  };

  // Download Handler
  const handleDownload = async () => {
    if (!storyRef.current) return;
    setDownloading(true);
    try {
      // 1080x1920 target
      const dataUrl = await toPng(storyRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#000000'
      });
      const link = document.createElement('a');
      link.download = `arena-story-${selectedEvent?.id || 'event'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download story image', err);
    } finally {
      setDownloading(false);
    }
  };

  // Share Handler (Native)
  const handleShare = async () => {
    if (storyRef.current && navigator.share) {
      try {
        setDownloading(true);
        // Gera o blob da imagem com qualidade alta
        const dataUrl = await toPng(storyRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          quality: 0.95,
          backgroundColor: '#000000'
        });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "meus-palpites.png", { type: "image/png" });

        // Chama a API nativa de compartilhamento (Instagram/WhatsApp abre direto)
        await navigator.share({
          title: 'Meus Palpites - Arena MMA',
          text: `Confira meus palpites para o ${selectedEvent?.title}!`,
          files: [file]
        });
      } catch (error) {
        console.error("Erro ao compartilhar", error);
      } finally {
        setDownloading(false);
      }
    } else {
      // Fallback para Download se não suportar share (Desktop)
      handleDownload();
    }
  };

  // Stats
  let totalPoints = 0;
  let correctPicks = 0;
  fights.forEach(f => {
    const pick = picks[f.id];
    if (pick) {
      totalPoints += pick.points_earned || 0;
      if (f.winner_id && pick.fighter_id === f.winner_id) correctPicks++;
    }
  });
  const accuracy = fights.length > 0 ? Math.round((correctPicks / fights.length) * 100) : 0;

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden min-h-[calc(100vh-64px)] bg-background-dark">
      {/* SIDEBAR */}
      <aside className={`w-full lg:w-80 bg-surface-dark border-r border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto max-h-[calc(100vh-64px)] custom-scrollbar z-20 ${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex`}>
        <div className="mb-8">
          <h1 className="text-white text-lg font-bold font-condensed uppercase tracking-wide">Story Creator</h1>
          <p className="text-gray-400 text-xs mt-1">Crie e compartilhe seus resultados.</p>
        </div>

        <div className="space-y-6">
          {upcomingEvents.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase font-bold text-primary tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-primary rounded-full"></span> Próximos
              </h3>
              <div className="space-y-2">
                {upcomingEvents.map(evt => (
                  <button
                    key={evt.id}
                    onClick={() => handleEventSelect(evt.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedEventId === evt.id ? 'bg-primary/20 border-primary text-white' : 'bg-black/20 border-transparent text-gray-400 hover:bg-black/40 hover:text-white'}`}
                  >
                    <div className="text-xs font-bold font-condensed uppercase">{evt.title}</div>
                    <div className="text-[10px] opacity-70 truncate">{evt.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase font-bold text-accent-green tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-accent-green rounded-full"></span> Realizados
              </h3>
              <div className="space-y-2">
                {pastEvents.map(evt => (
                  <button
                    key={evt.id}
                    onClick={() => handleEventSelect(evt.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedEventId === evt.id ? 'bg-accent-green/10 border-accent-green text-white' : 'bg-black/20 border-transparent text-gray-400 hover:bg-black/40 hover:text-white'}`}
                  >
                    <div className="text-xs font-bold font-condensed uppercase">{evt.title}</div>
                    <div className="text-[10px] opacity-70 truncate">{evt.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Área de Ações (Atualizada) */}
        <div className="mt-auto pt-8 flex flex-col gap-3">
          {/* Botão Compartilhar/Baixar */}
          <button
            onClick={handleShare}
            disabled={downloading}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-condensed font-black uppercase tracking-widest rounded-xl shadow-neon flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                <span className="material-symbols-outlined">share</span>
                <span>Compartilhar Card</span>
              </>
            )}
          </button>

          {/* Botão Voltar (Secundário) */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('ranking')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-condensed font-bold uppercase tracking-widest rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined">leaderboard</span>
              <span>Ver Ranking</span>
            </button>
          )}
        </div>
      </aside>

      {/* PREVIEW + CANVAS */}
      <section className={`flex-1 bg-black/50 p-4 lg:p-8 flex flex-col items-center overflow-y-auto ${mobileView === 'preview' ? 'flex' : 'hidden'} lg:flex`}>
        {/* Mobile Header (Back + Download) */}
        <div className="w-full lg:hidden flex items-center justify-between mb-4 shrink-0">
          <button
            onClick={() => setMobileView('list')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
            <span className="text-xs font-bold uppercase tracking-widest">Eventos</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-primary hover:bg-primary/80 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            {downloading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-t-white block"></span>
            ) : (
              <span className="material-symbols-outlined block">download</span>
            )}
          </button>
        </div>

        <h2 className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mb-6 hidden lg:block">Preview (9:16)</h2>

        {loading || !selectedEvent ? (
          <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2 border-primary/30"></div>
          </div>
        ) : (
          /* -------------------------------------------------------------------------- */
          /*                              THE STORY CANVAS                              */
          /* -------------------------------------------------------------------------- */
          /* Approx 9:16 aspect ratio relative to width 375px -> 667px height (Mobile) */
          <div
            ref={storyRef}
            className="w-[375px] h-[667px] bg-[#1a1a1a] relative flex flex-col select-none overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[#0a0a0a]"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-black/90"></div>
            </div>

            {/* HEADER: User & Brand - Ultra Compact */}
            <div className={`px-4 pt-4 pb-2 flex items-center justify-between relative z-10 bg-gradient-to-b from-black/80 to-transparent shrink-0 transition-all`}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-cover bg-center border border-white/20 shadow-lg"
                  style={{ backgroundImage: `url("${user?.avatar}")` }}
                ></div>
                <div>
                  <p className="text-white text-[10px] font-bold leading-none">{user?.name}</p>
                  <p className="text-primary text-[8px] font-bold uppercase tracking-wider mt-0.5">Arena Member</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm">sports_mma</span>
                  <span className="text-white text-[10px] font-black italic tracking-tighter">ARENA</span>
                </div>
              </div>
            </div>

            {/* EVENT BANNER - Drastic Reduction (50%) */}
            <div className={`relative ${fights.length > 10 ? 'h-14' : 'h-24'} shrink-0 mx-4 mt-0.5 rounded-lg overflow-hidden shadow-2xl border border-white/10 group transition-all flex items-center`}>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${selectedEvent.banner_url}")` }}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>

              <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-20">
                <div className={`px-1.5 py-0.5 rounded text-[7px] font-black italic tracking-widest uppercase text-white ${selectedEvent.status === 'completed' ? 'bg-accent-green' : 'bg-primary'}`}>
                  {selectedEvent.status === 'completed' ? 'RESULTADOS' : 'PALPITES'}
                </div>
              </div>

              <div className="relative z-20 pl-4 py-2 flex flex-col justify-center h-full">
                <h2 className="text-white text-sm font-black italic uppercase leading-tight drop-shadow-md truncate max-w-[200px]">
                  {selectedEvent.title}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-400 text-[8px] font-condensed uppercase tracking-wide">
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </span>
                  <span className="text-gray-500 text-[6px]">•</span>
                  <span className="text-gray-400 text-[8px] font-condensed uppercase tracking-wide truncate max-w-[100px]">
                    {selectedEvent.location}
                  </span>
                </div>
              </div>
            </div>

            {/* STATS STRIP (Only for completed) - Ultra Compact */}
            {selectedEvent.status === 'completed' && fights.length <= 14 && (
              <div className="mx-4 mt-1.5 flex gap-1 shrink-0">
                <div className="flex-1 bg-white/5 border border-white/5 rounded p-1 flex items-center justify-between px-2">
                  <span className="text-[7px] text-gray-500 uppercase font-bold">Pontos</span>
                  <span className="text-sm font-black text-white leading-none">{totalPoints}</span>
                </div>
                <div className="flex-1 bg-white/5 border border-white/5 rounded p-1 flex items-center justify-between px-2">
                  <span className="text-[7px] text-gray-500 uppercase font-bold"> Precisão</span>
                  <span className="text-sm font-black text-accent-green leading-none">{accuracy}%</span>
                </div>
              </div>
            )}

            {/* PICKS GRID - Optimized Density */}
            <div className="flex-1 px-4 py-2 overflow-hidden relative z-10 flex flex-col min-h-0">
              {(() => {
                const isOddCount = fights.length % 2 !== 0;
                const rowCount = isOddCount
                  ? 1 + Math.ceil((fights.length - 1) / 2)
                  : Math.ceil(fights.length / 2);

                // Dynamic Grid Template
                const gridTemplateRows = isOddCount
                  ? `1.4fr repeat(${rowCount - 1}, 1fr)`
                  : `repeat(${rowCount}, 1fr)`;

                return (
                  <div
                    className="grid grid-cols-2 gap-0.5 h-full w-full"
                    style={{ gridTemplateRows }}
                  >
                    {fights.map((fight, index) => {
                      const userPick = picks[fight.id];
                      const hasPick = !!userPick;
                      const isCompleted = selectedEvent.status === 'completed';
                      const isUpcoming = !isCompleted;
                      const winnerId = fight.winner_id;

                      const myPickId = userPick?.fighter_id;
                      const isPickCorrect = isCompleted && winnerId && myPickId === winnerId;

                      const fA = fight.fighter_a;
                      const fB = fight.fighter_b;

                      // Dim/Grayscale Logic
                      // Completed: Dim loser
                      // Upcoming: Grayscale unpicked logic (if I picked someone, dim the other)
                      const f1Dim = isCompleted
                        ? (winnerId && winnerId !== fA.id)
                        : (isUpcoming && myPickId && myPickId !== fA.id);

                      const f2Dim = isCompleted
                        ? (winnerId && winnerId !== fB.id)
                        : (isUpcoming && myPickId && myPickId !== fB.id);

                      // Layout Logic
                      const isMainEvent = index === 0;
                      const isFullWidth = isOddCount && isMainEvent;

                      const imgWidth = isFullWidth ? 'w-24' : 'w-10';

                      // Helper for Result Info
                      const resultRoundProp = (fight as any).result_round || (fight as any).round_end || fight.rounds;
                      const resultMethodProp = (fight as any).method || 'DEC';

                      // Simplify Method
                      let simpleMethod = 'DEC';
                      const mUpper = resultMethodProp.toUpperCase();
                      if (mUpper.includes('KO') || mUpper.includes('TKO')) simpleMethod = 'KO';
                      else if (mUpper.includes('SUB')) simpleMethod = 'SUB';
                      else if (mUpper.includes('DEC')) simpleMethod = 'DEC';
                      else simpleMethod = mUpper.substring(0, 3);

                      const renderWinnerBadge = () => {
                        const textSize = isFullWidth ? 'text-[7px]' : 'text-[4px]';
                        const padding = isFullWidth ? 'px-2 py-0.5' : 'px-1 py-[1px]';

                        return (
                          <div className={`absolute top-0 right-0 bg-accent-green text-black ${textSize} font-black ${padding} rounded-bl-sm uppercase tracking-tighter leading-none shadow-sm z-10`}>
                            VENCEDOR
                          </div>
                        );
                      };

                      const renderResultFooter = () => {
                        const textSize = isFullWidth ? 'text-[7px]' : 'text-[4px]';
                        const padding = isFullWidth ? 'px-2 py-0.5' : 'px-1.5 py-[1px]';
                        const minWMethod = isFullWidth ? 'min-w-[28px]' : 'min-w-[14px]';
                        const minWRound = isFullWidth ? 'min-w-[18px]' : 'min-w-[10px]';

                        // Decide content for the second box (Round or Decision Type)
                        let secondBoxContent = `R${String(resultRoundProp).replace(/[^\d]/g, '')}`;

                        if (simpleMethod === 'DEC') {
                          const mUp = resultMethodProp.toUpperCase();
                          if (mUp.includes('UNA') || mUp.includes('UNI')) {
                            secondBoxContent = isFullWidth ? 'UNANIME' : 'UNA';
                          } else if (mUp.includes('SPLIT') || mUp.includes('DIV')) {
                            secondBoxContent = isFullWidth ? 'DIVIDIDA' : 'DIV';
                          } else if (mUp.includes('MAJ')) {
                            secondBoxContent = isFullWidth ? 'MAJORITARIA' : 'MAJ';
                          }
                        }

                        return (
                          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-evenly pb-[1px]">
                            <div className={`bg-accent-green text-black ${textSize} font-black ${padding} rounded-t-sm uppercase tracking-tighter leading-none ${minWMethod} text-center shadow-sm`}>
                              {simpleMethod}
                            </div>
                            <div className={`bg-accent-green text-black ${textSize} font-black ${padding} rounded-t-sm uppercase tracking-tighter leading-none ${minWRound} text-center shadow-sm`}>
                              {secondBoxContent}
                            </div>
                          </div>
                        );
                      };

                      return (
                        <div
                          key={fight.id}
                          className={`relative h-full bg-white/5 border border-white/5 rounded-sm flex overflow-hidden group
                                    ${isFullWidth ? 'col-span-2 border-primary/30 bg-gradient-to-r from-black via-primary/5 to-black' : ''}
                                `}
                        >
                          {/* Left Fighter */}
                          <div className={`relative ${imgWidth} h-full shrink-0 transition-all border-r border-white/5
                              ${isUpcoming && myPickId === fA.id ? 'border-2 border-accent-green box-border z-10' : ''}
                          `}>
                            <img src={fA.image_url} alt={fA.name} className={`w-full h-full object-cover object-top ${f1Dim ? 'grayscale opacity-50' : ''}`} />
                            {myPickId === fA.id && <div className={`absolute bottom-0 h-0.5 w-full ${isPickCorrect ? 'bg-accent-green' : isCompleted && winnerId ? 'bg-red-500' : 'bg-accent-green'}`}></div>}

                            {isCompleted && winnerId === fA.id && (
                              <>
                                {renderWinnerBadge()}
                                {renderResultFooter()}
                              </>
                            )}
                          </div>

                          {/* Center Info - Vertical Stack */}
                          <div className="flex-1 flex flex-col justify-between items-center px-1 py-1 relative min-w-0 h-full">

                            {/* --- NAMES Top/Bottom & VS Middle --- */}
                            <div className="flex flex-col items-center justify-center w-full grow">
                              {(() => {
                                const getFighterStyle = (fId: string, isDim: boolean) => {
                                  if (myPickId === fId) {
                                    if (isUpcoming) return 'text-accent-green'; // Upcoming Pick
                                    if (isPickCorrect) return 'text-accent-green';
                                    if (isCompleted && winnerId) return 'text-red-500 line-through decoration-[0.5px]';
                                    return 'text-white'; // Pending Pick
                                  }
                                  return isDim ? 'text-gray-600' : 'text-white';
                                };

                                return (
                                  <>
                                    {/* Name A */}
                                    <div className={`w-full text-center ${isFullWidth ? 'text-[12px] mb-0.5' : 'text-[8px] mb-[1px]'} font-black uppercase truncate leading-tight ${getFighterStyle(fA.id, f1Dim)}`}>
                                      {fA.name.split(' ').pop()}
                                    </div>

                                    {/* VS */}
                                    <div className={`${isFullWidth ? 'text-[7px]' : 'text-[4px]'} font-black italic text-white/40 uppercase leading-none my-[1px]`}>
                                      VS
                                    </div>

                                    {/* Name B */}
                                    <div className={`w-full text-center ${isFullWidth ? 'text-[12px] mt-0.5' : 'text-[8px] mt-[1px]'} font-black uppercase truncate leading-tight ${getFighterStyle(fB.id, f2Dim)}`}>
                                      {fB.name.split(' ').pop()}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>

                            {/* --- PICKS ROW (Bottom) --- */}
                            {hasPick ? (
                              <div className={`grid ${isUpcoming ? 'grid-cols-2' : 'grid-cols-3'} gap-[1px] w-full ${isFullWidth ? 'h-4' : 'h-2.5'} mt-auto`}>
                                {(() => {
                                  // 1. Method Logic
                                  const resultMethSimple = simpleMethod;
                                  const pickMethRaw = userPick.method || '';
                                  let pickMethSimple = 'KO'; // Default to KO for upcoming if not specified
                                  if (pickMethRaw.includes('KO') || pickMethRaw.includes('TKO')) pickMethSimple = 'KO';
                                  else if (pickMethRaw.includes('SUB')) pickMethSimple = 'SUB';
                                  else if (pickMethRaw.includes('DEC')) pickMethSimple = 'DEC';

                                  const pickMethodCorrect = isCompleted && resultMethSimple === pickMethSimple;
                                  const pickMethodStyle = isUpcoming
                                    ? 'text-accent-green' // Upcoming
                                    : pickMethodCorrect
                                      ? 'text-accent-green'
                                      : (isCompleted && winnerId ? 'text-red-500 line-through decoration-[0.5px]' : 'text-primary');

                                  // 2. Round/Type Logic
                                  const userPickRound = (userPick as any).round;
                                  // Fix double "RR": Remove non-digits from input first
                                  const cleanRound = userPickRound ? String(userPickRound).replace(/[^\d]/g, '') : '';
                                  const pickRoundContent = cleanRound ? `R${cleanRound}` : pickMethSimple === 'DEC' ? 'DEC' : '-';

                                  const resultRoundVal = (fight as any).result_round;
                                  let pickRoundCorrect = false;
                                  if (pickMethSimple === 'DEC' && resultMethSimple === 'DEC') pickRoundCorrect = true;
                                  else if (cleanRound && resultRoundVal && Number(cleanRound) === Number(resultRoundVal)) pickRoundCorrect = true;

                                  const pickRoundStyle = isUpcoming
                                    ? 'text-accent-green' // Upcoming
                                    : pickRoundCorrect
                                      ? 'text-accent-green'
                                      : (isCompleted && winnerId ? 'text-red-500 line-through decoration-[0.5px]' : 'text-primary');

                                  // 3. Points
                                  const points = userPick.points_earned || 0;
                                  const pointsText = points > 0 ? `+${points} Pts` : '0 Pts';

                                  const textSize = isFullWidth ? 'text-[8px]' : 'text-[4px]';

                                  return (
                                    <>
                                      {/* Box 1: Method */}
                                      <div className={`bg-white/5 rounded-[1px] flex items-center justify-center ${textSize} font-bold uppercase ${pickMethodStyle}`}>
                                        {pickMethSimple}
                                      </div>
                                      {/* Box 2: Round/Type */}
                                      <div className={`bg-white/5 rounded-[1px] flex items-center justify-center ${textSize} font-bold uppercase ${pickRoundStyle}`}>
                                        {pickRoundContent}
                                      </div>
                                      {/* Box 3: Points (Only if completed) */}
                                      {isCompleted && (
                                        <div className={`bg-white/5 rounded-[1px] flex items-center justify-center ${textSize} font-black text-white`}>
                                          {pointsText}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            ) : (
                              // Empty Placeholder if no pick
                              <div className={`w-full ${isFullWidth ? 'h-4' : 'h-2.5'} mt-auto flex items-center justify-center opacity-20`}>
                                <div className="h-[1px] w-full bg-white/20"></div>
                              </div>
                            )}

                          </div>

                          {/* Right Fighter */}
                          <div className={`relative ${imgWidth} h-full shrink-0 transition-all border-l border-white/5
                             ${isUpcoming && myPickId === fB.id ? 'border-2 border-accent-green box-border z-10' : ''}
                          `}>
                            <img src={fB.image_url} alt={fB.name} className={`w-full h-full object-cover object-top ${f2Dim ? 'grayscale opacity-50' : ''}`} />
                            {myPickId === fB.id && <div className={`absolute bottom-0 h-0.5 w-full ${isPickCorrect ? 'bg-accent-green' : isCompleted && winnerId ? 'bg-red-500' : 'bg-accent-green'}`}></div>}

                            {isCompleted && winnerId === fB.id && (
                              <>
                                {renderWinnerBadge()}
                                {renderResultFooter()}
                              </>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* FOOTER - Updated Aesthetic */}
            <div className={`px-5 ${fights.length > 12 ? 'py-2' : 'py-4'} bg-black border-t border-white/10 flex items-center justify-between relative z-10 shrink-0`}>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-sm">sports_mma</span>
                <span className="text-[8px] text-white font-bold uppercase tracking-widest">ARENAMMA.APP</span>
              </div>
              <div className="text-[7px] text-gray-600 uppercase font-medium">Onde a luta começa</div>
            </div>

          </div>
        )}
      </section>
    </div>
  );
};

export default StoryCreator;