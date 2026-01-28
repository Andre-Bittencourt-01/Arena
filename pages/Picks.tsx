import React, { useState, useEffect, useMemo } from 'react';
import { Screen } from '../App';
import Panel from '../components/Panel';
import { useData } from '../contexts/DataContext';
import { Fight, Pick } from '../types';

interface PicksProps {
  onNavigate: (screen: Screen) => void;
}

const Picks: React.FC<PicksProps> = ({ onNavigate }) => {
  const {
    currentEvent,
    currentFights,
    user,
    getPicksForEvent,
    updatePick
  } = useData();

  const [activeFightId, setActiveFightId] = useState<string | null>(null);
  const [eventPicks, setEventPicks] = useState<Record<string, Pick>>({});

  // Selection Draft States
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'KO/TKO' | 'SUB' | 'DEC' | null>(null);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadPicks = async () => {
      if (currentEvent) {
        // Reset active fight when event changes to avoid "orphaned" IDs from previous events
        setActiveFightId(null);

        const picks = await getPicksForEvent(currentEvent.id);
        setEventPicks(picks);

        // Default to first fight that doesn't have a pick yet, or just the first fight
        // We wait for currentFights to be populated for the new event
        if (currentFights.length > 0 && currentFights[0].event_id === currentEvent.id) {
          const firstPending = currentFights.find(f => !picks[f.id]) || currentFights[0];
          setActiveFightId(firstPending.id);
        }
      }
    };
    loadPicks();
  }, [currentEvent, currentFights]);

  // Sync selection stages with active fight's existing pick
  useEffect(() => {
    if (activeFightId && eventPicks[activeFightId]) {
      const pick = eventPicks[activeFightId];
      setSelectedWinnerId(pick.fighter_id);
      setSelectedMethod(pick.method);
      setSelectedRound(pick.round);
    } else {
      setSelectedWinnerId(null);
      setSelectedMethod(null);
      setSelectedRound(null);
    }
  }, [activeFightId, eventPicks]);

  const activeFight = useMemo(() =>
    currentFights.find(f => f.id === activeFightId) || null
    , [activeFightId, currentFights]);

  const handleConfirm = async () => {
    if (!user) {
      alert("Você precisa estar logado para palpitar!");
      return;
    }

    if (!selectedWinnerId || !selectedMethod || !selectedRound) {
      alert("Por favor, preencha todas as etapas do palpite!");
      return;
    }

    if (!currentEvent || !activeFight) return;

    setIsSubmitting(true);
    try {
      const pickId = eventPicks[activeFight.id]?.id || `pick_${user.id}_${activeFight.id}`;

      const updatedPick: Pick = {
        id: pickId,
        user_id: user.id,
        event_id: currentEvent.id,
        fight_id: activeFight.id,
        fighter_id: selectedWinnerId,
        method: selectedMethod,
        round: selectedRound,
        points_earned: 0
      };

      await updatePick(updatedPick);

      // Update local picks state
      setEventPicks(prev => ({
        ...prev,
        [activeFight.id]: updatedPick
      }));

      // Small delay to let the user see the visual change in sidebar
      setTimeout(() => {
        // Auto-advance to next fight if available
        const currentIndex = currentFights.findIndex(f => f.id === activeFightId);
        if (currentIndex < currentFights.length - 1) {
          const nextFight = currentFights[currentIndex + 1];
          setActiveFightId(nextFight.id);

          // Reset drafting states for the next fight unless it already has a pick
          if (!eventPicks[nextFight.id]) {
            setSelectedWinnerId(null);
            setSelectedMethod(null);
            setSelectedRound(null);
          }
        } else {
          // Last fight confirmed
          alert("Card Completo! Seus palpites foram salvos.");
          onNavigate('ranking'); // Redirect to ranking to see impact
        }
      }, 300);

    } catch (error) {
      console.error("Failed to save pick", error);
      alert("Erro ao salvar palpite. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentEvent || !activeFight) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fighterA = activeFight.fighter_a;
  const fighterB = activeFight.fighter_b;
  const progressPercent = (Object.keys(eventPicks).length / currentFights.length) * 100;
  const picksDone = Object.keys(eventPicks).length;

  return (
    <div className="flex flex-col h-full font-display animate-in fade-in duration-500 overflow-hidden bg-background-dark pb-16 md:pb-0">
      <div className="mx-auto max-w-7xl w-full flex flex-col lg:flex-row gap-2 md:gap-4 items-start justify-start h-full p-2 md:p-4 overflow-hidden">

        {/* Main Selection Area */}
        <div className="w-full max-w-3xl flex flex-col gap-3 md:gap-6 flex-1 h-full overflow-hidden">
          {/* Progress Header & Card Trigger - Enhanced */}
          {/* Progress Header & Card Trigger - Mockup Style */}
          <div className="flex items-end justify-between gap-4 flex-shrink-0 relative z-10 px-1">
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <h1 className="text-primary text-xl md:text-2xl font-black uppercase tracking-tighter italic drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                  PALPITES
                </h1>
                <span className="text-white text-xl md:text-2xl font-black italic tracking-tighter">
                  {picksDone}/{currentFights.length}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary shadow-[0_0_10px_rgba(236,19,19,0.5)] transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => setIsCardDrawerOpen(true)}
              className="flex items-center gap-2 bg-[#2a0a0a] hover:bg-primary/20 border border-primary/30 text-primary rounded-xl px-3 py-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(236,19,19,0.1)] group max-h-[42px]"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">view_list</span>
              <div className="flex flex-col items-end leading-none">
                <span className="text-[8px] font-black uppercase tracking-wider text-primary/70">CARD</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-primary">COMPLETO</span>
              </div>
            </button>
          </div>

          {/* Fight Card Header */}
          <div className="flex flex-col rounded-2xl border border-border-dark bg-surface-dark shadow-2xl overflow-hidden ring-1 ring-white/5 flex-1 min-h-0">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 border-b border-white/5 flex items-center justify-between gap-2 shadow-lg z-20 relative">
              <div className="bg-surface-highlight px-2 py-0.5 rounded text-[10px] md:text-xs font-black text-white uppercase tracking-wider">
                {currentEvent.title.split(' ').slice(0, 2).join(' ')}
              </div>
              <p className="text-primary text-[10px] md:text-xs font-black uppercase tracking-widest animate-pulse">
                {activeFight.is_title ? 'DISPUTA DE CINTURÃO' : activeFight.category}
              </p>
              <h2 className="text-[10px] md:text-xs font-black text-white uppercase italic tracking-wider">
                {activeFight.weight_class.replace('Peso', '').trim()}
              </h2>
            </div>

            {/* Fighters Visual - Adjusted size (+10%) */}
            <div className="grid grid-cols-2 gap-px relative h-40 md:h-56 flex-shrink-0 bg-border-dark/30">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="flex h-5 w-5 md:h-8 md:w-8 items-center justify-center rounded-full bg-black border-2 border-primary text-white font-black italic shadow-[0_0_15px_rgba(236,19,19,0.4)] text-[9px] md:text-sm">
                  VS
                </div>
              </div>

              {/* Fighter A */}
              <div
                className={`relative group cursor-pointer overflow-hidden h-full`}
                onClick={() => setSelectedWinnerId(fighterA.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-10"></div>
                <div
                  className={`h-full w-full bg-cover bg-center bg-no-repeat transition-all duration-700 ${selectedWinnerId === fighterA.id ? 'scale-110 grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                  style={{ backgroundImage: `url('${fighterA.image_url}')` }}
                ></div>
                <div className="absolute bottom-0 left-0 w-full p-2 z-10 flex flex-col items-center">
                  <h3 className="text-sm md:text-xl font-condensed font-black text-white text-center leading-none uppercase italic tracking-tighter truncate w-full px-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {fighterA.name.split(' ').pop()}
                  </h3>
                </div>
                {selectedWinnerId === fighterA.id && (
                  <div className="absolute inset-0 border-2 border-primary z-20 pointer-events-none opacity-100 shadow-[inset_0_0_20px_rgba(236,19,19,0.4)]">
                    <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-primary text-white rounded-full p-0.5 md:p-1 shadow-2xl animate-in zoom-in-50 duration-300">
                      <span className="material-symbols-outlined text-[10px] md:text-sm block font-bold">check</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fighter B */}
              <div
                className={`relative group cursor-pointer overflow-hidden h-full`}
                onClick={() => setSelectedWinnerId(fighterB.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-10"></div>
                <div
                  className={`h-full w-full bg-cover bg-center bg-no-repeat transition-all duration-700 ${selectedWinnerId === fighterB.id ? 'scale-110 grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                  style={{ backgroundImage: `url('${fighterB.image_url}')` }}
                ></div>
                <div className="absolute bottom-0 left-0 w-full p-2 z-10 flex flex-col items-center">
                  <h3 className="text-sm md:text-xl font-condensed font-black text-white text-center leading-none uppercase italic tracking-tighter truncate w-full px-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {fighterB.name.split(' ').pop()}
                  </h3>
                </div>
                {selectedWinnerId === fighterB.id && (
                  <div className="absolute inset-0 border-2 border-primary z-20 pointer-events-none opacity-100 shadow-[inset_0_0_20px_rgba(236,19,19,0.4)]">
                    <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-primary text-white rounded-full p-0.5 md:p-1 shadow-2xl animate-in zoom-in-50 duration-300">
                      <span className="material-symbols-outlined text-[10px] md:text-sm block font-bold">check</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Steps - Flexible spacing with reduced vertical padding */}
            <div className="flex-1 overflow-hidden px-3 py-1.5 md:p-4 flex flex-col justify-evenly bg-surface-dark relative">
              <div className="absolute left-7 top-0 bottom-0 w-px border-l border-dashed border-border-dark hidden md:block opacity-20"></div>

              {/* Step 1: Winner */}
              <div className="flex flex-col gap-1.5 md:gap-2 relative md:pl-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-[10px] md:text-sm font-condensed font-black uppercase flex items-center gap-2 italic">
                    <span className={`flex items-center justify-center w-4 h-4 md:w-6 md:h-6 rounded-full text-[8px] text-white transition-colors ${selectedWinnerId ? 'bg-primary' : 'bg-surface-highlight border border-border-dark text-text-muted'}`}>1</span>
                    Quem vence?
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedWinnerId(fighterA.id)}
                    className={`relative overflow-hidden rounded-xl py-4 border-2 transition-all active:scale-95 group ${selectedWinnerId === fighterA.id ? 'bg-primary border-primary shadow-[0_0_20px_rgba(236,19,19,0.3)]' : 'bg-[#1a0f0f] border-transparent hover:bg-[#2a1515] hover:border-primary/30'}`}
                  >
                    <span className={`font-condensed font-black uppercase text-sm md:text-lg italic leading-none tracking-tight block text-center ${selectedWinnerId === fighterA.id ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>{fighterA.name}</span>
                  </button>
                  <button
                    onClick={() => setSelectedWinnerId(fighterB.id)}
                    className={`relative overflow-hidden rounded-xl py-4 border-2 transition-all active:scale-95 group ${selectedWinnerId === fighterB.id ? 'bg-primary border-primary shadow-[0_0_20px_rgba(236,19,19,0.3)]' : 'bg-[#1a0f0f] border-transparent hover:bg-[#2a1515] hover:border-primary/30'}`}
                  >
                    <span className={`font-condensed font-black uppercase text-sm md:text-lg italic leading-none tracking-tight block text-center ${selectedWinnerId === fighterB.id ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>{fighterB.name}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Method */}
              <div className={`flex flex-col gap-1.5 md:gap-2 relative md:pl-8 transition-all duration-500 ${!selectedWinnerId ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-[10px] md:text-sm font-condensed font-black uppercase flex items-center gap-2 italic">
                    <span className={`flex items-center justify-center w-4 h-4 md:w-6 md:h-6 rounded-full text-[8px] text-white transition-colors ${selectedMethod ? 'bg-primary' : 'bg-surface-highlight border border-border-dark text-text-muted'}`}>2</span>
                    Como vence?
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'KO/TKO', label: 'Knockout', icon: 'sports_kabaddi' },
                    { id: 'SUB', label: 'Finalização', icon: 'settings_accessibility' },
                    { id: 'DEC', label: 'Decisão', icon: 'gavel' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id as any)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 h-14 md:h-16 transition-all active:scale-95 group ${selectedMethod === method.id ? 'bg-primary border-primary shadow-neon' : 'bg-[#1a0f0f] border-transparent hover:bg-[#2a1515] hover:border-primary/30'}`}
                    >
                      <span className={`material-symbols-outlined text-xl md:text-2xl ${selectedMethod === method.id ? 'text-white' : 'text-text-muted group-hover:text-primary'}`}>{method.icon}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${selectedMethod === method.id ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Round */}
              <div className={`flex flex-col gap-1.5 md:gap-2 relative md:pl-8 transition-all duration-500 ${!selectedMethod ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-[10px] md:text-sm font-condensed font-black uppercase flex items-center gap-2 italic">
                    <span className={`flex items-center justify-center w-4 h-4 md:w-6 md:h-6 rounded-full text-[8px] text-white transition-colors ${selectedRound ? 'bg-primary' : 'bg-surface-highlight border border-border-dark text-text-muted'}`}>3</span>
                    Round?
                  </h4>
                </div>
                <div className={`grid gap-2 ${activeFight.rounds === 5 ? 'grid-cols-5' : 'grid-cols-3'}`}>
                  {selectedMethod === 'DEC' ? (
                    ['UNÂNIME', 'DIVIDIDA', 'MAJORIT.'].map((dec) => (
                      <button
                        key={dec}
                        onClick={() => setSelectedRound(dec)}
                        className={`col-span-1.5 first:col-span-2 last:col-span-2 min-h-[36px] md:min-h-[44px] flex items-center justify-center rounded-xl border font-black text-[9px] tracking-tight transition-all active:scale-95 px-1 ${selectedRound === dec ? 'bg-primary border-primary text-white shadow-neon' : 'bg-[#1a0f0f] border-transparent text-text-muted hover:border-primary/20 hover:text-white'}`}
                      >
                        {dec}
                      </button>
                    ))
                  ) : (
                    Array.from({ length: activeFight.rounds }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedRound(`R${i + 1}`)}
                        className={`h-10 md:h-12 flex items-center justify-center rounded-xl border font-condensed font-black text-lg md:text-xl transition-all active:scale-95 ${selectedRound === `R${i + 1}` ? 'bg-primary border-primary text-white shadow-neon' : 'bg-[#1a0f0f] border-transparent text-text-muted hover:border-primary/20'}`}
                      >
                        {i + 1}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Fixed Footer Button */}
            <div className="p-2 md:p-4 border-t border-white/10 bg-surface-dark/95 backdrop-blur-md flex flex-col flex-shrink-0">
              <button
                onClick={handleConfirm}
                disabled={!selectedWinnerId || !selectedMethod || !selectedRound || isSubmitting}
                className={`w-full rounded-xl md:rounded-2xl py-2.5 md:py-6 text-white font-condensed font-black text-base md:text-2xl uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all ${selectedWinnerId && selectedMethod && selectedRound ? 'bg-primary hover:bg-primary-hover active:scale-[0.98] shadow-neon' : 'bg-surface-highlight text-white/10 cursor-not-allowed'}`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>{eventPicks[activeFight.id!] ? 'Atualizar' : 'Confirmar'}</span>
                    <span className="material-symbols-outlined font-black text-base md:text-xl">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Fight List - Hidden on mobile, shown on desktop */}
        <aside className="hidden lg:flex w-72 h-full lg:h-[calc(100vh-100px)] overflow-hidden flex-col flex-shrink-0 lg:sticky lg:top-0">
          <Panel
            title="Card"
            icon="view_list"
            className="flex-1 flex flex-col overflow-hidden shadow-2xl border-white/5 bg-surface-dark/40 backdrop-blur-md"
            headerAction={
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-full border border-primary/20 tracking-widest">
                {picksDone}/{currentFights.length}
              </span>
            }
          >

            <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-1.5 fight-list-scroll custom-scrollbar pb-2">
              {currentFights.map((fight, i) => {
                const isCurrent = fight.id === activeFightId;
                const hasPick = !!eventPicks[fight.id];

                return (
                  <div
                    key={fight.id}
                    onClick={() => setActiveFightId(fight.id)}
                    className={`group cursor-pointer relative flex items-center gap-2 p-1.5 md:p-2 rounded-lg transition-all duration-300 ${isCurrent ? 'bg-primary/10 border border-primary ring-1 ring-white/5' : 'bg-surface-highlight/20 border border-white/5 hover:bg-surface-highlight/40'}`}
                  >
                    <div className={`flex items-center justify-center rounded-full p-1 transition-all ${hasPick ? 'text-green-500 bg-green-500/10' : (isCurrent ? 'text-primary bg-primary/20 animate-pulse' : 'text-white/20 bg-black/40')}`}>
                      <span className="material-symbols-outlined text-[12px] md:text-base font-bold">
                        {hasPick ? 'check_circle' : (isCurrent ? 'sports_mma' : 'radio_button_unchecked')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-[6px] md:text-[7px] font-black uppercase tracking-tight ${isCurrent ? 'text-primary' : (hasPick ? 'text-green-500/70' : 'text-text-muted')}`}>
                          Luta {i + 1}
                        </p>
                      </div>
                      <p className={`text-[9px] md:text-[11px] font-condensed font-black leading-none truncate italic ${isCurrent ? 'text-white' : (hasPick ? 'text-white/80' : 'text-white/40')}`}>
                        {fight.fighter_a.name.split(' ').pop()} <span className="opacity-20 mx-0.5">VS</span> {fight.fighter_b.name.split(' ').pop()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-2 py-1 flex justify-between text-[6px] md:text-[7px] text-text-muted font-black uppercase tracking-[0.1em] border-t border-white/5 mt-0.5 bg-black/20">
              <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-green-500"></span> Salvo</span>
              <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary"></span> Atual</span>
            </div>
          </Panel>
        </aside>

        {/* Mobile Fight Card Drawer (Bottom Sheet) */}
        {isCardDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-300 lg:hidden"
            onClick={() => setIsCardDrawerOpen(false)}
          >
            <div
              className="absolute bottom-0 left-0 w-full bg-surface-dark border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500 max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />

              <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-condensed font-black text-white uppercase italic tracking-tighter">Card Completo</h3>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">{picksDone} de {currentFights.length} lutas palpitadas</p>
                </div>
                <button
                  onClick={() => setIsCardDrawerOpen(false)}
                  className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div className="grid grid-cols-1 gap-2">
                  {currentFights.map((fight, i) => {
                    const isCurrent = fight.id === activeFightId;
                    const hasPick = !!eventPicks[fight.id];
                    const pick = eventPicks[fight.id];
                    const selectedFighter = pick ? (fight.fighter_a_id === pick.fighter_id ? fight.fighter_a : fight.fighter_b) : null;

                    return (
                      <div
                        key={fight.id}
                        onClick={() => {
                          setActiveFightId(fight.id);
                          setIsCardDrawerOpen(false);
                        }}
                        className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${isCurrent ? 'bg-primary border-transparent shadow-[0_0_20px_rgba(236,19,19,0.3)]' : 'bg-surface-highlight/40 border border-white/5'}`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${isCurrent ? 'bg-white text-primary border-white' : (hasPick ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'bg-black/40 text-white/20 border-white/10')}`}>
                          {hasPick ? (
                            <span className="material-symbols-outlined text-sm font-bold italic">check</span>
                          ) : (
                            <span className="text-[10px] font-black italic">{i + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isCurrent ? 'text-white/70' : 'text-text-muted'}`}>
                            {fight.weight_class}
                          </p>
                          <div className={`text-base font-condensed font-black leading-none truncate italic ${isCurrent ? 'text-white' : 'text-white/90'}`}>
                            {fight.fighter_a.name.split(' ').pop()} <span className="opacity-40 italic font-black mx-1">VS</span> {fight.fighter_b.name.split(' ').pop()}
                          </div>
                          {hasPick && !isCurrent && (
                            <p className="text-[10px] text-green-500 font-bold uppercase mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 bg-green-500 rounded-full" />
                              {selectedFighter?.name.split(' ').pop()} por {pick.method}
                            </p>
                          )}
                        </div>

                        {isCurrent && (
                          <div className="text-white">
                            <span className="material-symbols-outlined animate-bounce-x">arrow_forward</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 flex-shrink-0 bg-black/40 border-t border-white/10">
                <button
                  onClick={() => setIsCardDrawerOpen(false)}
                  className="w-full py-4 bg-primary text-white font-condensed font-black text-xl uppercase tracking-widest rounded-2xl shadow-neon transition-transform active:scale-95"
                >
                  Continuar Palpitando
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Picks;
